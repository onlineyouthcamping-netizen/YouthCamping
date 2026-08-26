"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { bookPathFromPrefill } from "@/lib/booking/buildBookQuery";
import { BookingLinkOpening } from "@/components/booking/BookingLinkOpening";

function BookingLinkResolveInner({ token }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setError("");
      try {
        const payload = searchParams.get("p") || "";
        const signature = searchParams.get("s") || "";
        const resolveUrl = new URL(`${API_BASE_URL}/booking-links/resolve`);
        resolveUrl.searchParams.set("token", token);
        resolveUrl.searchParams.set("_t", String(Date.now()));
        if (payload) resolveUrl.searchParams.set("p", payload);
        if (signature) resolveUrl.searchParams.set("s", signature);

        const res = await fetch(resolveUrl.toString(), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          setError(json?.message || "Invalid or expired booking link");
          return;
        }

        const data = json.data || {};
        router.replace(
          bookPathFromPrefill({
            tripName: data.tripName,
            tripId: data.tripId,
            departureDate: data.departureDate,
            pickupCity: data.pickupCity,
            paymentMode: data.paymentMode,
            customAmount: data.customAmount,
            customTime: data.customTime,
            headerTitle: data.headerTitle,
            headerSubtitle: data.headerSubtitle,
            bookingLinkId: data.bookingLinkId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail,
            travelerCount: data.travelerCount,
            sourceBookingLinkPayload: payload || null,
            sourceBookingLinkSignature: signature || null,
          }),
        );
      } catch {
        setError(
          "Our servers are temporarily unavailable. Please try again shortly.",
        );
      }
    };

    run();
  }, [token, router, searchParams]);

  return <BookingLinkOpening error={error || undefined} />;
}

export default function BookingLinkResolvePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <Suspense fallback={<BookingLinkOpening />}>
      <BookingLinkResolveInner token={token} />
    </Suspense>
  );
}
