import { fetchTripBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
export const dynamic = 'force-dynamic';

import {
  Calendar, Map as MapIcon, TrendingUp, Users, ChevronLeft
} from "lucide-react";
import TravelTimeline from "@/components/TravelTimeline";
import TripGallerySection from "@/components/TripGallerySection";
import TripSubNav from "@/components/TripSubNav";
import StickyBookingCard from "@/components/StickyBookingCard";
import TripDetailView from "@/components/TripDetailView";
import Link from "next/link";

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {

  const { slug } = await params;
  const trip = await fetchTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const navSections = [
    { id: "about", label: "About" },
    { id: "itinerary", label: "Itinerary" },
    { id: "inclusions", label: "Inclusions" },
    { id: "highlights", label: "Highlights" },
    { id: "stay", label: "Stay" },
    { id: "faqs", label: "FAQs" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-white min-h-screen font-montserrat pb-[80px] md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-24">
        <div className="mb-4 md:mb-12">
          <Link href="/trips" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary-orange mb-3 md:mb-6 font-bold text-xs capitalize tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Expeditions
          </Link>
          <h1 className="text-2xl md:text-7xl font-bold text-navy mb-2 md:mb-4 tracking-tighter leading-[0.9] italic">
            <span className="text-primary-orange not-italic font-semibold">{trip.title || "Our Expedition"}</span>
          </h1>
        </div>

        <TripGallerySection trip={trip} />

        <TripSubNav sections={navSections} />

        {/* Quick Info Bar - Open Grid Style */}
        <div className="flex flex-row overflow-x-auto no-scrollbar gap-x-12 md:gap-x-16 gap-y-8 mb-20 py-8 border-y border-zinc-100 w-full">
          {[
            { label: "Duration", val: trip.duration || "9 Days", icon: Calendar },
            { label: "Difficulty", val: trip.difficulty || "Moderate", icon: MapIcon },
            { label: "Age Group", val: trip.ageLimit || "15-35 years", icon: Users },
            { label: "Max Altitude", val: trip.maxAltitude || "15,000 ft", icon: TrendingUp },
          ].map((info, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-primary-orange">
                <info.icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <p className="text-zinc-500 font-bold text-base md:text-lg leading-none mb-1 whitespace-nowrap">{info.label}</p>
                <p className="text-zinc-400 font-medium text-sm md:text-base whitespace-nowrap">{info.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <TripDetailView trip={trip} />

          <div className="lg:col-span-4">
            <StickyBookingCard trip={trip} />
          </div>
        </div>
      </div>
    </div>
  );
}
