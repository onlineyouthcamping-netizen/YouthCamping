import { parseTripDate } from "./parseTripDate";

export type UpcomingDeparture = {
  date: string;
  capacity: number | null;
  bookedCount: number;
  parsed: Date;
  monthLabel: string;
  dayStr: string;
  weekdayStr: string;
};

/** Upcoming departures from API/CMS only. Never synthesizes dates or capacity. */
export function listUpcomingDepartures(
  availableDates: unknown,
  now: Date = new Date(),
): UpcomingDeparture[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const validDates: UpcomingDeparture[] = [];
  const rawAvailable = Array.isArray(availableDates) ? availableDates : [];

  rawAvailable.forEach((ad) => {
    const rawDateStr = typeof ad === "string" ? ad : ad?.date;
    const d = parseTripDate(rawDateStr);
    if (!d) return;
    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate.getTime() < today.getTime()) return;

    const monthName = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    const monthLabel =
      year !== today.getFullYear() ? `${monthName} ${year}` : monthName;
    const weekdayStr = d.toLocaleString("default", { weekday: "short" });
    const hasCapacity =
      typeof ad === "object" &&
      ad &&
      (ad as any).capacity !== undefined &&
      (ad as any).capacity !== null &&
      String((ad as any).capacity).trim() !== "";
    const capNum = hasCapacity ? Number((ad as any).capacity) : NaN;

    validDates.push({
      date: String(rawDateStr),
      capacity: Number.isFinite(capNum) ? capNum : null,
      bookedCount:
        typeof ad === "object" && ad && Number.isFinite(Number((ad as any).bookedCount))
          ? Number((ad as any).bookedCount)
          : 0,
      parsed: d,
      monthLabel,
      dayStr: d.getDate().toString(),
      weekdayStr,
    });
  });

  validDates.sort((a, b) => a.parsed.getTime() - b.parsed.getTime());
  return validDates;
}

export function groupDeparturesByMonth(dates: UpcomingDeparture[]) {
  const grouped: Record<string, UpcomingDeparture[]> = {};
  dates.forEach((item) => {
    if (!grouped[item.monthLabel]) grouped[item.monthLabel] = [];
    grouped[item.monthLabel].push(item);
  });
  return { groupedDates: grouped, months: Object.keys(grouped) };
}

/** Explicit opt-in only. Never NODE_ENV === development by itself. */
export function isDemoTripDataEnabled(env: {
  NODE_ENV?: string;
  NEXT_PUBLIC_ENABLE_DEMO_DATA?: string;
} = typeof process !== "undefined" ? process.env : {}): boolean {
  if (env.NODE_ENV === "production") return false;
  return String(env.NEXT_PUBLIC_ENABLE_DEMO_DATA || "").toLowerCase() === "true";
}
