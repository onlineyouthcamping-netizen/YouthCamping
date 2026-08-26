/**
 * Builds the shared `/book` query string used by booking-link resolvers
 * and trip-code redirects so every customer entry hits the same wizard.
 */
export type BookPrefillInput = {
  tripName?: string | null;
  tripId?: string | null;
  departureDate?: string | Date | null;
  pickupCity?: string | null;
  paymentMode?: string | null;
  customAmount?: number | string | null;
  customTime?: string | null;
  headerTitle?: string | null;
  headerSubtitle?: string | null;
  bookingLinkId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  travelerCount?: number | string | null;
  price?: number | string | null;
  salesperson?: string | null;
  sourceBookingLinkPayload?: string | null;
  sourceBookingLinkSignature?: string | null;
};

function setIfPresent(
  qs: URLSearchParams,
  key: string,
  value: string | number | null | undefined,
) {
  if (value === undefined || value === null) return;
  const str = String(value).trim();
  if (!str) return;
  qs.set(key, str);
}

export function buildBookQuery(data: BookPrefillInput): string {
  const qs = new URLSearchParams();

  setIfPresent(qs, "trip", data.tripName);
  setIfPresent(qs, "tid", data.tripId);

  if (data.departureDate) {
    const raw =
      data.departureDate instanceof Date
        ? data.departureDate.toISOString()
        : String(data.departureDate);
    qs.set("date", raw.slice(0, 10));
  }

  setIfPresent(qs, "pickupCity", data.pickupCity);
  setIfPresent(qs, "payMode", data.paymentMode);
  setIfPresent(qs, "bookAmt", data.customAmount);
  setIfPresent(qs, "customTime", data.customTime);
  setIfPresent(qs, "headerTitle", data.headerTitle);
  setIfPresent(qs, "headerSubtitle", data.headerSubtitle);
  setIfPresent(qs, "sourceBookingLinkId", data.bookingLinkId);
  setIfPresent(qs, "sourceBookingLinkPayload", data.sourceBookingLinkPayload);
  setIfPresent(
    qs,
    "sourceBookingLinkSignature",
    data.sourceBookingLinkSignature,
  );
  setIfPresent(qs, "customerName", data.customerName);
  setIfPresent(qs, "customerPhone", data.customerPhone);
  setIfPresent(qs, "customerEmail", data.customerEmail);
  setIfPresent(qs, "travelerCount", data.travelerCount);
  setIfPresent(qs, "price", data.price);
  setIfPresent(qs, "salesperson", data.salesperson);

  return qs.toString();
}

export function bookPathFromPrefill(data: BookPrefillInput): string {
  const q = buildBookQuery(data);
  return q ? `/book?${q}` : "/book";
}
