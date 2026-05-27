"use client";

import { useState, useEffect, useMemo } from "react";

import { Check, MapPin, ArrowRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Trip } from "@/types";
import { fetchSettings, normalizeImageUrl } from "@/lib/api";
import { useTripSelection } from "@/store/trip-selection";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface BookingOptionsProps {
  trip: Trip;
  onDateSelect?: (date: string | null) => void;
  onVariantSelect?: (index: number) => void;
  onTravelSelect?: (index: number) => void;
  onRoomSelect?: (index: number) => void;
  onPriceChange?: (price: number) => void;
}

export default function BookingOptions({ 
  trip, 
  onDateSelect, 
  onVariantSelect, 
  onTravelSelect, 
  onRoomSelect, 
  onPriceChange
}: BookingOptionsProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedTravel, setSelectedTravel] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(0);

  const variants = useMemo(() => trip.variants || [], [trip.variants]);
  const travelOptions = useMemo(() => trip.travelOptions || [
    { label: "Non AC Sleeper Train", priceDelta: 0 },
    { label: "AC Sleeper Train", priceDelta: 2000 }
  ], [trip.travelOptions]);
  const roomOptions = useMemo(() => trip.roomOptions || [
    { label: "Quad", priceDelta: 0 },
    { label: "Triple", priceDelta: 1500 },
    { label: "Double", priceDelta: 3000 }
  ], [trip.roomOptions]);


  const { currentPrice, setCurrentPrice } = useTripSelection();

  useEffect(() => {
    const variant = variants[selectedVariant];
    const basePrice = variant?.discountedPrice || trip.price;
    const travelDelta = travelOptions[selectedTravel]?.priceDelta || 0;
    const roomDelta = roomOptions[selectedRoom]?.priceDelta || 0;
    
    const total = basePrice + travelDelta + roomDelta;
    
    if (total !== currentPrice) {
      onPriceChange?.(total);
      setCurrentPrice(total);
    }
  }, [selectedVariant, selectedTravel, selectedRoom, trip.price, onPriceChange, setCurrentPrice, currentPrice, variants, travelOptions, roomOptions]);

  const [activeMonth, setActiveMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Group dates by month
  const groupedDates: Record<string, any[]> = {};
  (trip.availableDates || []).forEach(ad => {
    const d = new Date(ad.date);
    const month = d.toLocaleString('default', { month: 'long' });
    if (!groupedDates[month]) groupedDates[month] = [];
    groupedDates[month].push(ad);
  });

  const months = Object.keys(groupedDates);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (months.length > 0 && !activeMonth) {
      setActiveMonth(months[0]);
    }
  }, [months, activeMonth]);

  const phone = settings?.contactPhone || "99242 46267";
  const whatsappNumber = phone.replace(/\D/g, '');

  const handleWhatsAppBooking = () => {
    const selectedLocation = variants[selectedVariant]?.location || "";
    const message = encodeURIComponent(`Hi! I want to book the "${trip.title}" expedition from ${selectedLocation} starting at ₹${currentPrice.toLocaleString()}. Please help me with the booking.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Unified Booking Box */}
      <section className="bg-white rounded-[20px] p-4 md:p-5 border border-zinc-100 shadow-sm space-y-6">
        
        {/* Starting Location Section - Horizontal Slide */}
        <div>
          <div className="flex flex-row overflow-x-auto no-scrollbar gap-4 pb-4 -mx-1 px-1 snap-x">
            {variants.map((v, i) => (
              <div 
                key={i}
                onClick={() => {
                  setSelectedVariant(i);
                  onVariantSelect?.(i);
                }}
                className={cn(
                  "min-w-[200px] md:min-w-[240px] bg-white rounded-[20px] overflow-hidden border-2 transition-all p-3 cursor-pointer snap-start shadow-sm",
                  selectedVariant === i ? "border-primary-orange" : "border-zinc-100 hover:border-zinc-200"
                )}
              >
                <div className="relative aspect-square rounded-[14px] overflow-hidden mb-3">
                  <OptimizedImage 
                    src={normalizeImageUrl(v.image) || "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6"} 
                    alt={v.location} className="object-cover" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base md:text-lg font-bold text-navy">{v.location}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-400 line-through">₹{v.originalPrice?.toLocaleString()}</span>
                       <span className="text-sm font-bold text-navy leading-none">₹{v.discountedPrice?.toLocaleString()}/-</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-50 rounded-full border border-zinc-100">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">{v.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-50" />

        {/* Travelling & Room Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy">Travelling Options</h3>
            <div className="flex flex-wrap gap-2">
              {travelOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedTravel(i);
                    onTravelSelect?.(i);
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all",
                    selectedTravel === i 
                      ? "border-primary-orange text-primary-orange bg-primary-orange/5" 
                      : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  {opt.label}
                  {selectedTravel === i && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary-orange rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white stroke-[4]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy">Room Sharing</h3>
            <div className="flex flex-wrap gap-2">
              {roomOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedRoom(i);
                    onRoomSelect?.(i);
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all",
                    selectedRoom === i 
                      ? "border-primary-orange text-primary-orange bg-primary-orange/5" 
                      : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  {opt.label}
                  {selectedRoom === i && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary-orange rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white stroke-[4]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-50" />

        {/* Dates Section */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-navy">Departure Dates</h2>
          
          <div className="flex flex-wrap gap-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setActiveMonth(month)}
                className={cn(
                  "relative px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all",
                  activeMonth === month 
                    ? "border-primary-orange text-primary-orange bg-primary-orange/5" 
                    : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                )}
              >
                {month}
                {activeMonth === month && (
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary-orange rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white stroke-[4]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {(groupedDates[activeMonth] || []).map((ad, i) => {
              const dateStr = new Date(ad.date).getDate().toString();
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(ad.date);
                    onDateSelect?.(ad.date);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs transition-all shadow-sm",
                    selectedDate === ad.date 
                      ? "border-primary-orange text-primary-orange bg-white scale-105" 
                      : "border-zinc-200 text-navy bg-white hover:border-zinc-300"
                  )}
                >
                  {dateStr}
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleWhatsAppBooking}
            className="hidden md:block w-full py-3.5 bg-primary-orange text-white rounded-xl font-bold text-sm hover:bg-[#FF5B00]/90 transition-all shadow-lg shadow-orange-100 uppercase tracking-widest"
          >
             Book My Spot
          </button>

        </div>
      </section>
    </div>
  );
}
