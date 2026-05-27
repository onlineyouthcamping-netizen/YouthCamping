"use client";

import { useState, useEffect } from "react";
import DestinationInquiryModal from "./DestinationInquiryModal";
import { Trip } from "@/types";

interface TripInquiryAutoTriggerProps {
  trip: Trip;
}

export default function TripInquiryAutoTrigger({ trip }: TripInquiryAutoTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem(`inquiry_popup_${trip.id}`);
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(`inquiry_popup_${trip.id}`, "true");
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [trip.id]);

  return (
    <DestinationInquiryModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      destination={{
        id: trip.id || (trip as any)._id,
        name: trip.title,
        img: trip.heroImage,
        duration: trip.duration,
        subtext: `Join our curated ${trip.location} expedition`
      }}
    />
  );
}
