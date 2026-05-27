"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useTripSelection } from "@/store/trip-selection";
import { Trip } from "@/types";
import DestinationInquiryModal from "./DestinationInquiryModal";
import { fetchSettings } from "@/lib/api";

interface StickyBookingCardProps {
  trip: Trip;
}

export default function StickyBookingCard({ trip }: StickyBookingCardProps) {
  const { currentPrice } = useTripSelection();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);
  
  // Initial price if store is empty
  const displayPrice = currentPrice || trip.price;
  const phone = settings?.contactPhone || "99242 46267";
  const whatsappNumber = phone.replace(/\D/g, '');

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(`Hi! I want to book the "${trip.title}" expedition starting at ₹${displayPrice.toLocaleString()}. Please help me with the booking.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="sticky top-32 space-y-6 hidden md:block">
        {/* Main Booking Card */}
        <div className="bg-white border border-zinc-100 rounded-[40px] overflow-hidden shadow-2xl shadow-zinc-200/50">
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <span className="text-zinc-500 font-bold text-sm">Starting from</span>
              <div className="text-right">
                <div className="text-4xl font-black text-navy mb-1 transition-all duration-300">₹ {displayPrice.toLocaleString()}</div>
                <div className="text-zinc-400 line-through font-bold text-sm decoration-2">₹ {(displayPrice + 3000).toLocaleString()}</div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">per person + taxes</div>
              </div>
            </div>

            <div className="h-px bg-zinc-100 mb-8" />

            <div className="text-center mb-8">
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Package Configuration</p>
              <p className="text-navy font-bold">{trip.duration}</p>
            </div>

            <button 
              onClick={handleWhatsAppBooking}
              className="w-full py-6 bg-primary-orange text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-[#FF5B00]/90 transition-all shadow-xl shadow-orange-100"
            >
              Book My Spot
            </button>
          </div>
        </div>

        {/* Private Trips Card */}
        <div className="bg-white border border-zinc-100 rounded-[35px] p-8 shadow-xl shadow-zinc-100/50">
           <h3 className="text-xl font-black text-navy mb-1">Private Trips Available</h3>
           <p className="text-zinc-400 text-xs font-bold mb-6">for Group of 2+ Travellers</p>
           <button 
             onClick={handleWhatsAppBooking}
             className="flex items-center gap-3 px-6 py-3 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
           >
              <MessageCircle className="w-4 h-4" /> Request a Callback
           </button>
        </div>

        {/* WhatsApp Button */}
        <a 
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I'm interested in the ${trip.title} trip.`)}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-6 bg-white border border-zinc-100 rounded-[24px] shadow-lg hover:bg-zinc-50 transition-all"
        >
           <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white fill-current" />
           </div>
           <span className="text-sm font-black text-navy uppercase tracking-widest">Whatsapp</span>
        </a>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.1)] overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-navy leading-none">₹ {displayPrice.toLocaleString()}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-400 line-through text-xs font-bold">₹ {(displayPrice + 3000).toLocaleString()}</span>
              <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider">per person</span>
            </div>
          </div>
          <button 
            onClick={handleWhatsAppBooking}
            className="bg-primary-orange text-white px-8 py-4 rounded-xl font-bold text-sm tracking-tight active:scale-95 transition-all shadow-lg shadow-orange-500/20"
          >
            Book Now
          </button>
        </div>
      </div>

      <DestinationInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        destination={{
          id: trip.id || trip._id,
          name: trip.title,
          img: trip.heroImage,
          duration: trip.duration,
          subtext: `Join our curated ${trip.location} expedition`
        }}
      />
    </>
  );
}
