const IST = "Asia/Kolkata";

const WEEKDAY_SUN0 = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function formatYmdIst(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function istMidnightUtc(ymd) {
  return new Date(`${ymd}T00:00:00+05:30`);
}

function istEndOfDayUtc(ymd) {
  return new Date(`${ymd}T23:59:59.999+05:30`);
}

function addCalendarDaysYmd(ymd, days) {
  const shifted = new Date(istMidnightUtc(ymd).getTime() + days * 24 * 60 * 60 * 1000);
  return formatYmdIst(shifted);
}

function istWeekdaySun0(date = new Date()) {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: IST,
    weekday: "short",
  }).format(date);
  return WEEKDAY_SUN0[wd] ?? 0;
}

function daysFromMonday(date = new Date()) {
  const sun0 = istWeekdaySun0(date);
  return (sun0 + 6) % 7;
}

/**
 * Inclusive Instant bounds for dashboard period filters (Asia/Kolkata).
 * "This week" = Monday 00:00 IST through `now`.
 */
function getPeriodBounds(dateFilter, now = new Date()) {
  const todayYmd = formatYmdIst(now);
  const startToday = istMidnightUtc(todayYmd);
  const endToday = istEndOfDayUtc(todayYmd);

  const filter = String(dateFilter || "all").toLowerCase();

  if (!filter || filter === "all") {
    return { start: null, end: null, startToday, endToday, todayYmd, now };
  }

  if (filter === "today") {
    return { start: startToday, end: endToday, startToday, endToday, todayYmd, now };
  }

  if (filter === "week") {
    const mondayYmd = addCalendarDaysYmd(todayYmd, -daysFromMonday(now));
    return {
      start: istMidnightUtc(mondayYmd),
      end: now,
      startToday,
      endToday,
      todayYmd,
      now,
    };
  }

  if (filter === "month") {
    const monthStartYmd = `${todayYmd.slice(0, 7)}-01`;
    return {
      start: istMidnightUtc(monthStartYmd),
      end: now,
      startToday,
      endToday,
      todayYmd,
      now,
    };
  }

  if (filter === "year") {
    const yearStartYmd = `${todayYmd.slice(0, 4)}-01-01`;
    return {
      start: istMidnightUtc(yearStartYmd),
      end: now,
      startToday,
      endToday,
      todayYmd,
      now,
    };
  }

  return { start: null, end: null, startToday, endToday, todayYmd, now };
}

function createdAtInPeriod(bounds) {
  if (!bounds?.start) return undefined;
  return { gte: bounds.start, lte: bounds.end || bounds.now };
}

function collectionOccurredInPeriod(bounds) {
  const range = createdAtInPeriod(bounds);
  if (!range) return undefined;
  return {
    OR: [
      { paymentDate: range },
      { AND: [{ paymentDate: null }, { createdAt: range }] },
    ],
  };
}

module.exports = {
  IST,
  formatYmdIst,
  istMidnightUtc,
  istEndOfDayUtc,
  addCalendarDaysYmd,
  istWeekdaySun0,
  daysFromMonday,
  getPeriodBounds,
  createdAtInPeriod,
  collectionOccurredInPeriod,
};
