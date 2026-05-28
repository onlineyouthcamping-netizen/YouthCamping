"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Trip } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";
import { useTheme } from "@/components/DynamicThemeProvider";

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
  const { theme } = useTheme();

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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    isDraggingRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    
    // Disable snapping and scroll instantly during active drag
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseLeave = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const overlayOpacity = theme?.cardOverlayDarkness != null ? theme.cardOverlayDarkness / 100 : 0.5;

  return (
    <div className="overflow-hidden section-wrapper bg-transparent relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      
      <div className="max-w-[1440px] mx-auto relative px-2">
        {/* Header Section */}
        <div className="flex flex-col mb-8">
          {topLabel && (
            <span className="section-label">
              {topLabel}
            </span>
          )}
          
          <div className="flex flex-row items-center justify-between gap-4 mb-2">
            <div className={cn(
              "flex-1",
              titleStyle === 'boxed' && "p-6 md:px-10 md:py-8 rounded-[20px] md:rounded-[32px] border border-slate-200 bg-white shadow-sm max-w-fit"
            )}>
              <h2 
                className="section-heading text-navy force-single-line"
                style={{ 
                  fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
                  fontWeight: titleWeight ? titleWeight : undefined
                }}
              >
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link href="/trips" className="flex items-center gap-3 text-navy font-semibold hover:text-primary-orange transition-all group">
                <span className="text-[14px] md:text-[15px] capitalize tracking-wide font-semibold hidden sm:inline">View All Trips</span>
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-navy flex items-center justify-center text-white group-hover:bg-primary-orange shadow-md transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Month Pills */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-1">
          {displayMonths.map((m) => {
            const isActive = activeMonth === m;
            return (
              <button
                key={m}
                onClick={() => setActiveMonth(m)}
                className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isActive 
                  ? "bg-navy text-white border-navy shadow-sm" 
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-navy/20 hover:bg-zinc-50"
                }`}
              >
                {isActive && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                {m}
              </button>
            );
          })}
        </div>

        {/* Trips Slider Wrapper */}
        <div className="relative group/slider">
          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white hover:bg-zinc-50 text-navy items-center justify-center shadow-lg border border-zinc-200/80 pointer-events-auto cursor-pointer transition-all hover:scale-105"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Scroll List Container */}
          <div 
            ref={scrollRef}
            className={cn(
              "flex gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-8 select-none",
              isMouseDown ? "cursor-grabbing scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"
            )}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
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
                const hoverScaleClass = theme?.cardHoverAnimation === 'scale' || !theme?.cardHoverAnimation ? "group-hover:scale-105" : "";
                
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-none snap-start"
                    style={{ width: 'var(--card-width)' }}
                  >
                    <div 
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 border border-zinc-200/50",
                        theme?.cardHoverAnimation === 'lift' ? "hover:-translate-y-2 shadow-2xl" : "",
                        theme?.cardHoverAnimation === 'shadow' ? "hover:shadow-2xl" : ""
                      )}
                      style={{
                        height: 'var(--card-height)',
                        borderRadius: 'var(--radius-card)',
                        backgroundColor: 'var(--card)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <OptimizedImage 
                        src={normalizeImageUrl(trip.heroImage) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"} 
                        alt={trip.title} 
                        loading="lazy"
                        className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-1000", hoverScaleClass)}
                        style={{
                          filter: 'brightness(var(--card-brightness))',
                        }}
                      />
                      
                      {/* Top Badge - Location */}
                      <div className="absolute top-5 right-5 z-10">
                        <div 
                          className="font-bold text-[10px] md:text-xs uppercase tracking-wide px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-zinc-100"
                          style={{
                            backgroundColor: 'var(--card-badge-bg)',
                            color: 'var(--card-badge-text)',
                          }}
                        >
                          <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                          {trip.location}
                        </div>
                      </div>
 
                      {/* Bottom Content with Cinematic Gradient */}
                      <div 
                        className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white"
                        style={{
                          background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity * 1.7}) 0%, rgba(0,0,0,${overlayOpacity * 0.5}) 50%, transparent 100%)`
                        }}
                      >
                        <h3 
                          className="mb-4 leading-tight tracking-tight capitalize break-words text-white"
                          style={{
                            fontSize: 'var(--card-title-size)',
                            fontWeight: 'var(--font-weight-heading, 500)'
                          }}
                        >
                          {trip.title}
                        </h3>
                        
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-white/90">
                                <Clock className="w-4 h-4 text-primary-orange" style={{ color: 'var(--accent-color)' }} />
                                <span className="text-[11px] md:text-xs font-semibold tracking-wide uppercase">{trip.duration}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span 
                                  className="text-lg md:text-xl font-bold tracking-wide"
                                  style={{
                                    color: 'var(--card-price-color)',
                                  }}
                                >
                                  ₹{trip.price.toLocaleString()}
                                </span>
                                <span className="text-xs md:text-sm font-normal text-white/40 line-through decoration-white/60">
                                  ₹{(trip.price + 4000).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* CTA/Button style */}
                            {theme?.cardButtonStyle === 'pill' ? (
                              <div className="px-5 py-2 bg-white text-navy hover:bg-primary-orange hover:text-white transition-all shadow-md font-semibold text-xs rounded-full flex items-center gap-1">
                                Book Now <ChevronRight className="w-3 h-3" />
                              </div>
                            ) : theme?.cardButtonStyle === 'none' ? null : (
                              <div className="w-11 h-11 bg-white text-navy rounded-full flex items-center justify-center hover:bg-primary-orange hover:text-white transition-all shadow-md group/btn">
                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Invisible Link Overlay - Moved to very end for top-layer priority */}
                      <Link 
                        href={`/trips/${trip.slug}`} 
                        className="absolute inset-0 z-[50] cursor-pointer"
                        aria-label={`View ${trip.title}`}
                        onClick={handleLinkClick}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-navy hover:bg-[#1E3A8A] text-white items-center justify-center shadow-lg pointer-events-auto cursor-pointer transition-all hover:scale-105"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {wavyEdges && <WavyEdges color={bottomColor} position="bottom" />}
    </div>
  );
}
