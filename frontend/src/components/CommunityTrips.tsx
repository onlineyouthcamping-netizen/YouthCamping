"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Clock, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Trip } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";
import { useTheme } from "@/components/DynamicThemeProvider";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

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

  const reduceMotion = prefersReducedMotion || isMobile;

  const displayTitle = (!title || title.trim() === "" || title === "-" || title === "—") 
    ? "Upcoming Community Trips" 
    : title;

  return (
    <div className="overflow-hidden section-wrapper bg-white relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      
      <div className="max-w-[1440px] mx-auto relative px-2">
        {/* Header Section */}
        <div className="flex flex-col mb-5">
          {topLabel && (
            <span className="section-label">
              {topLabel}
            </span>
          )}
          
          <div className="flex flex-row items-center justify-between gap-4 mb-2">
            <div className={cn(
              "flex-1 min-w-0",
              titleStyle === 'boxed' && "p-4 md:px-10 md:py-8 rounded-[20px] md:rounded-[32px] border border-slate-200 bg-white shadow-sm max-w-fit"
            )}>
              <h2 
                className="section-heading text-navy force-single-line truncate max-md:!text-[16px] max-md:!leading-none"
                style={{ 
                  fontSize: isMobile 
                    ? '16px' 
                    : (titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined),
                  fontWeight: titleWeight ? titleWeight : undefined
                }}
              >
                {displayTitle}
              </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link href="/trips" className="flex items-center gap-2 text-navy font-bold hover:text-primary-orange transition-all group">
                <span className="text-xs md:text-sm capitalize tracking-wide font-bold">View All</span>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-navy flex items-center justify-center text-white group-hover:bg-primary-orange transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Month Pills */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-1">
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
              "flex gap-4 md:gap-[28px] overflow-x-auto no-scrollbar pb-6 select-none",
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
                    initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
                    className="flex-none snap-start"
                    style={{ width: 'var(--card-width)' }}
                  >
                    <div 
                      className={cn(
                        "avian-card group relative overflow-hidden transition-all duration-300 border border-zinc-200/50 flex flex-col justify-between",
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
                      {/* Image Section */}
                      <div 
                        className="relative w-full overflow-hidden rounded-t-[inherit]"
                        style={{ height: 'var(--card-image-height, 65%)' }}
                      >
                        <OptimizedImage 
                          src={normalizeImageUrl(trip.heroImage) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"} 
                          alt={trip.title} 
                          loading="lazy"
                          cloudinaryWidth={800}
                          width={400}
                          height={240}
                          className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-1000", hoverScaleClass)}
                          style={{
                            filter: 'brightness(var(--card-brightness))',
                          }}
                        />
                        
                        {/* Top Badge - Location (Floating on Image) */}
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
                      </div>
 
                      {/* Content Section */}
                      <div 
                        className="w-full bg-white rounded-b-[inherit] p-4 md:py-4 md:px-5 flex flex-col justify-between text-zinc-900 border-t border-zinc-100/50"
                        style={{ height: 'var(--card-content-height, 35%)' }}
                      >
                        <div className="space-y-1 md:space-y-2">
                          <h3 
                            className="leading-tight tracking-tight capitalize break-words text-[#0B1F3A] hover:text-[#FF6B00] group-hover:text-[#FF6B00] transition-colors line-clamp-2"
                            style={{
                              fontSize: 'var(--card-title-size)',
                              fontWeight: 'var(--font-weight-heading, 600)'
                            }}
                          >
                            {trip.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="text-[10px] md:text-xs font-semibold tracking-wide uppercase">{trip.duration}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between w-full pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span 
                              className="text-xs md:text-sm font-bold tracking-wide"
                              style={{
                                color: '#FF6B00',
                                fontWeight: 700
                              }}
                            >
                              ₹{trip.price.toLocaleString()}
                            </span>
                            <span className="text-[9px] md:text-[11px] font-normal text-zinc-400 line-through decoration-zinc-400">
                              ₹{(trip.price + 4000).toLocaleString()}
                            </span>
                          </div>
                          
                          {/* CTA/Button style */}
                          {theme?.cardButtonStyle === 'pill' ? (
                            <div className="px-4 py-2 bg-white text-navy hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm font-semibold text-[10px] rounded-full flex items-center gap-1 border border-zinc-200/50">
                              Book Now <ChevronRight className="w-3 h-3" />
                            </div>
                          ) : theme?.cardButtonStyle === 'none' ? null : (
                            <div className="w-9 h-9 bg-white text-navy rounded-full flex items-center justify-center hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm group/btn border border-zinc-200/50 shrink-0">
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </div>
                          )}
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
