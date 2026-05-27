"use client";

import { useState } from "react";
import BookingOptions from "./BookingOptions";
import ItineraryAccordion from "./ItineraryAccordion";
import { Trip } from "@/types";
import PopupDetails from "./PopupDetails";

interface TripBookingSectionProps {
  trip: Trip;
  onPriceChange?: (price: number) => void;
  onDateSelect?: (date: string | null) => void;
}

export default function TripBookingSection({ trip, onPriceChange, onDateSelect }: TripBookingSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  const currentSkipDays = trip.variants[variantIndex]?.skipDays || 0;

  return (
    <div className="space-y-8 md:space-y-24">
      <BookingOptions 
        trip={trip} 
        onDateSelect={handleDateSelect} 
        onVariantSelect={(idx) => setVariantIndex(idx)}
        onPriceChange={onPriceChange}
      />
      
      <section id="itinerary" className="mb-24 scroll-mt-32">
        <ItineraryAccordion 
          itinerary={trip.itinerary} 
          startDate={selectedDate}
          skipDays={currentSkipDays}
        />
      </section>
    </div>
  );
}
