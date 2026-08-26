"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL as API } from "@/lib/api";
import { bookPathFromPrefill } from "@/lib/booking/buildBookQuery";
import { BookingLinkOpening } from "@/components/booking/BookingLinkOpening";

/**
 * Legacy trip-code booking URLs (`/book/MKA-1`) used a separate dark form.
 * Redirect into the same public `/book` wizard as booking links and the site.
 */
function TripBookingRedirect() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripCode = (params.tripCode as string) || "";

  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripCode) {
      setError("Trip not found");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setError("");
      try {
        const res = await fetch(
          `${API}/bookings/trip-info/${encodeURIComponent(tripCode)}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (!cancelled) {
            setError(
              res.status === 404
                ? "The booking link is invalid or this trip is no longer active."
                : "Our booking servers are busy right now. Please try again in a few minutes.",
            );
          }
          return;
        }
        const json = await res.json();
        if (!json?.success || !json?.data) {
          if (!cancelled) {
            setError(
              "The booking link is invalid or this trip is no longer active.",
            );
          }
          return;
        }

        const trip = json.data;
        const path = bookPathFromPrefill({
          tripName: trip.title || trip.tripName || tripCode,
          tripId: trip.id || tripCode,
          departureDate: searchParams.get("date"),
          pickupCity: searchParams.get("pickupCity"),
          paymentMode: searchParams.get("payMode"),
          customAmount: searchParams.get("bookAmt"),
          price:
            searchParams.get("price") ||
            trip.price ||
            trip.stickyCardPrice ||
            null,
          salesperson: searchParams.get("salesperson"),
          customerName: searchParams.get("customerName"),
          customerPhone: searchParams.get("customerPhone"),
          customerEmail: searchParams.get("customerEmail"),
          travelerCount: searchParams.get("travelerCount"),
        });

        if (!cancelled) router.replace(path);
      } catch {
        if (!cancelled) {
          setError(
            "Our servers are temporarily unavailable. Please try again shortly.",
          );
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [tripCode, router, searchParams]);

  return <BookingLinkOpening error={error || undefined} />;
}

export default function TripBookingPage() {
  return (
    <Suspense fallback={<BookingLinkOpening />}>
      <TripBookingRedirect />
    </Suspense>
  );
}
