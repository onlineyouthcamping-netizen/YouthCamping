const {
  getPeriodBounds,
  formatYmdIst,
  daysFromMonday,
  istMidnightUtc,
} = require("../src/utils/istDateRange");

describe("IST dashboard period bounds", () => {
  // 26 Aug 2026 20:00 IST = 26 Aug 2026 14:30 UTC (Wednesday)
  const now = new Date("2026-08-26T14:30:00.000Z");

  it("formats the calendar date in Asia/Kolkata", () => {
    expect(formatYmdIst(now)).toBe("2026-08-26");
  });

  it("uses Monday as the start of This Week (not server-local Sunday)", () => {
    expect(daysFromMonday(now)).toBe(2);
    const week = getPeriodBounds("week", now);
    expect(week.start.toISOString()).toBe(istMidnightUtc("2026-08-24").toISOString());
    expect(week.end.toISOString()).toBe(now.toISOString());
  });

  it("bounds Today to the IST calendar day", () => {
    const today = getPeriodBounds("today", now);
    expect(today.start.toISOString()).toBe(istMidnightUtc("2026-08-26").toISOString());
    expect(today.end.toISOString()).toBe(new Date("2026-08-26T23:59:59.999+05:30").toISOString());
  });

  it("bounds This Month and This Year in IST", () => {
    const month = getPeriodBounds("month", now);
    const year = getPeriodBounds("year", now);
    expect(month.start.toISOString()).toBe(istMidnightUtc("2026-08-01").toISOString());
    expect(year.start.toISOString()).toBe(istMidnightUtc("2026-01-01").toISOString());
    expect(month.end.toISOString()).toBe(now.toISOString());
  });

  it("leaves All time unbounded", () => {
    const all = getPeriodBounds("all", now);
    expect(all.start).toBeNull();
    expect(all.end).toBeNull();
  });
});
