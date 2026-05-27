"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronRight, ChevronLeft, TrendingUp, CheckCircle2 } from "lucide-react";

import Link from "next/link";
import { Trip } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

import { cn } from "@/lib/utils";

import { WavyEdges } from "./ui/WavyEdges";

interface CommunityTripsProps {
  trips: Trip[];
  title?: string;
  titleSize?: string | number;
  titleWeight?: string | number;
  topLabel?: string;
  titleStyle?: 'standard' | 'boxed';
  subtitle?: string;
  months?: string[];
  tripIds?: string[];
  wavyEdges?: boolean;
  topColor?: string;
  bottomColor?: string;
}

export default function CommunityTrips({ 
  trips, 
  title = "Upcoming Community Trips",
  titleSize,
  titleWeight,
  topLabel,
  titleStyle = 'standard',
  subtitle,
  months: propMonths,
  tripIds = [],
  wavyEdges = false,
  topColor = "#ffffff",
  bottomColor = "#ffffff",
}: CommunityTripsProps) {
  // Filter trips by IDs first if provided
  const baseTrips = tripIds && tripIds.length > 0 
    ? trips.filter(t => tripIds.includes(t.id))
    : trips;

  // Generate dynamic months if none provided
  const dynamicMonths = Array.from(new Set(baseTrips.flatMap(t => {
    if (!t.availableDates) return [];
    try {
      const dates = typeof t.availableDates === 'string' ? JSON.parse(t.availableDates) : t.availableDates;
      return (dates || []).map((d: any) => {
        const date = new Date(d.date || d);
        const mName = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const mYear = date.toLocaleString('en-US', { year: '2-digit' });
        return `${mName} '${mYear}`;
      });
    } catch (e) { return []; }
  }))).sort((a, b) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const [ma, yaWithApostrophe] = a.split(" '");
    const [mb, ybWithApostrophe] = b.split(" '");
    if (yaWithApostrophe !== ybWithApostrophe) return yaWithApostrophe.localeCompare(ybWithApostrophe);
    return months.indexOf(ma) - months.indexOf(mb);
  });

  const displayMonths = (propMonths && propMonths.length > 0 
    ? propMonths 
    : (dynamicMonths.length > 0 ? dynamicMonths : ["APR '26", "MAY '26", "JUN '26", "JUL '26", "AUG '26", "SEP '26", "OCT '26"]))
    .map(m => {
      // Enhanced normalization: "JUNE 26" -> "JUN '26", "MAY 2025" -> "MAY '25"
      let normalized = m.trim().toUpperCase();
      
      // Match parts: [Month (3+ letters)] [Optional separator] [Year (2 or 4 digits)]
      const match = normalized.match(/^([A-Z]{3,10})[\s']*(20\d{2}|\d{2})$/);
      if (match) {
        const month = match[1].substring(0, 3);
        const year = match[2].length === 4 ? match[2].substring(2) : match[2];
        normalized = `${month} '${year}`;
      }
      
      return normalized;
    });

  const [activeMonth, setActiveMonth] = useState(displayMonths[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="overflow-hidden section-wrapper bg-transparent relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      
      <div className="max-w-[1440px] mx-auto">
        {/* ... (rest of component) */}
        {/* Header Section */}
        <div className="flex flex-col mb-12">
          {topLabel && (
            <span className="section-label">
              {topLabel}
            </span>
          )}
          
          <div className="flex flex-row items-center justify-between gap-2 md:gap-4 mb-8 md:mb-12">
            <div className={cn(
              "flex-1",
              titleStyle === 'boxed' && "p-6 md:px-10 md:py-8 rounded-[20px] md:rounded-[32px] border border-slate-200 bg-white shadow-sm max-w-fit"
            )}>
              <h2 
                className="section-heading text-slate-900"
                style={{ 
                  fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
                  fontWeight: titleWeight || undefined
                }}
              >
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden lg:flex items-center gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Link href="/trips" className="flex items-center gap-2 text-navy font-black hover:text-primary-orange transition-all group">
                <span className="text-[10px] md:text-xs uppercase tracking-widest">View All</span>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-navy flex items-center justify-center text-white group-hover:bg-primary-orange shadow-lg transition-colors">
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-2">
          {displayMonths.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`px-8 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
                activeMonth === m 
                ? "bg-navy text-white border-navy shadow-lg" 
                : "bg-transparent text-zinc-400 border-zinc-100 hover:border-navy/20"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8"
        >
          <AnimatePresence mode="wait">
            {baseTrips.filter(trip => {
              if (!activeMonth) return true;
              try {
                const dates = typeof trip.availableDates === 'string' ? JSON.parse(trip.availableDates) : trip.availableDates;
                return (dates || []).some((d: any) => {
                  const date = new Date(d.date || d);
                  const mName = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  const mYear = date.toLocaleString('en-US', { year: '2-digit' });
                  const mStr = `${mName} '${mYear}`;
                  return mStr === activeMonth;
                });
              } catch (e) { return false; }
            }).map((trip, i) => {
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-none w-[72vw] md:w-[400px] snap-start"
                >
                  <div className="group relative h-[400px] md:h-[550px] rounded-[32px] overflow-hidden shadow-2xl bg-zinc-100 border border-zinc-100">
                    <OptimizedImage 
                      src={normalizeImageUrl(trip.heroImage) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"} 
                      alt={trip.title} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Top Badge - Now Location */}
                    <div className="absolute top-5 right-5 z-10">
                      <div className="bg-white/90 backdrop-blur-md text-navy font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-white/20">
                        <MapPin className="w-3.5 h-3.5 text-primary-orange" />
                        {trip.location}
                      </div>
                    </div>

                    {/* Bottom Content with Cinematic Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight uppercase break-words">
                        {trip.title}
                      </h3>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white/90">
                              <Clock className="w-4 h-4 text-primary-orange" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{trip.duration}</span>
                            </div>
                            
                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-black text-[#FF3D00] tracking-tighter">
                                    ₹{trip.price.toLocaleString()}
                                  </span>
                                  <span className="text-sm font-medium text-white/40 line-through decoration-white/60">
                                    ₹{(trip.price + 4000).toLocaleString()}
                                  </span>
                                </div>
                          </div>
                          <div className="w-14 h-14 bg-white text-navy rounded-2xl flex items-center justify-center hover:bg-primary-orange hover:text-white transition-all shadow-2xl group/btn">
                            <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invisible Link Overlay - Moved to very end for top-layer priority */}
                    <Link 
                      href={`/trips/${trip.slug}`} 
                      className="absolute inset-0 z-[50] cursor-pointer"
                      aria-label={`View ${trip.title}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {wavyEdges && <WavyEdges color={bottomColor} position="bottom" />}
    </div>
  );
}
