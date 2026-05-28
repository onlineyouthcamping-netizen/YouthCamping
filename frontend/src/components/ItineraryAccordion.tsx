"use client";

import { useState } from "react";

import { ChevronDown, MapPin, Utensils, BedDouble, Hotel, Home, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItineraryDay } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ItineraryAccordionProps {
  itinerary: ItineraryDay[];
  startDate?: string | null;
  skipDays?: number;
}

export default function ItineraryAccordion({ itinerary, startDate, skipDays = 0 }: ItineraryAccordionProps) {
  const [openDays, setOpenDays] = useState<number[]>([1]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Apply skipDays filter and re-index
  const displayItinerary = (itinerary || [])
    .slice(skipDays)
    .map((day, index) => ({
      ...day,
      displayDay: index + 1,
      originalDay: day.day
    }));

  const toggleDay = (day: number) => {
    setOpenDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setOpenDays([1]);
    } else {
      setOpenDays(displayItinerary.map(d => d.displayDay));
    }
    setIsAllExpanded(!isAllExpanded);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-navy">Itinerary</h2>
        </div>
        <button 
          onClick={toggleExpandAll}
          className="flex items-center gap-2 px-5 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all shadow-sm"
        >
          <div className="flex flex-col -space-y-1">
             <ChevronDown className={cn("w-3 h-3 transition-transform", isAllExpanded ? "rotate-180" : "")} />
             <ChevronDown className={cn("w-3 h-3 transition-transform", isAllExpanded ? "" : "rotate-180")} />
          </div>
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="space-y-4">
      {(displayItinerary).map((day) => (
        <div 
          key={day.displayDay} 
          className="group border border-blue-100 rounded-[20px] bg-gradient-to-r from-[#F0F5FF] to-[#D6E4FF] overflow-hidden transition-all duration-300 shadow-sm"
        >
          <button
            onClick={() => toggleDay(day.displayDay)}
            className="w-full flex items-center p-2.5 md:p-3.5 text-left gap-3 md:gap-5"
          >
            {/* Left Section: Day Badge & Dynamic Date */}
            <div className="shrink-0 flex flex-row items-center gap-3 md:gap-5 min-w-[90px] md:min-w-[140px]">
              <div className="px-4 py-2 bg-[#525B60] text-white rounded-[12px] md:rounded-[14px] text-[11px] md:text-[13px] font-bold text-center shadow-sm border border-white/10 shrink-0">
                Day {day.displayDay}
              </div>
              {startDate && (
                <div className="flex flex-col items-start leading-none shrink-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-[#D84E2D] capitalize tracking-wider">
                    {(() => {
                        const d = new Date(startDate);
                        // Add skipDays to start date offset
                        d.setDate(d.getDate() + day.originalDay - 1);
                        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      })()}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-medium text-navy/40 capitalize tracking-tighter">
                      {(() => {
                        const d = new Date(startDate);
                        d.setDate(d.getDate() + day.originalDay - 1);
                        return d.toLocaleDateString('en-GB', { weekday: 'short' });
                      })()}
                    </span>
                  </div>
                )}
              </div>
  
              {/* Middle Section: Title */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] md:text-sm font-bold text-navy leading-tight line-clamp-2">
                  {day.title}
                </span>
              </div>
  
              {/* Right Section: Stay & Meals */}
              {(day.stay || day.meals) && (
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="w-[1.5px] md:w-[2px] h-8 md:h-10 bg-navy/60 md:bg-navy/80 rounded-full" />
                  <div className="flex flex-col gap-0.5 md:gap-1 min-w-[90px] md:min-w-[140px]">
                    {day.meals && (
                      <div className="flex items-center gap-1.5 md:gap-2 text-navy/80">
                        <Utensils className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 shrink-0" />
                        <span className="text-[8px] md:text-[10px] font-medium leading-none">{day.meals}</span>
                      </div>
                    )}
                    {day.stay && (
                      <div className="flex items-center gap-1.5 md:gap-2 text-navy">
                        <BedDouble className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 shrink-0 text-navy/60" />
                        <span className="text-[8px] md:text-[10px] font-bold leading-none truncate max-w-[70px] md:max-w-none">
                          {day.stay}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 md:w-4 md:h-4 text-navy/40 transition-transform duration-300", openDays.includes(day.displayDay) && "rotate-180")} />
                </div>
              )}
  
              {!day.stay && !day.meals && (
                <ChevronDown className={cn("w-3.5 h-3.5 md:w-4 md:h-4 text-navy/40 ml-auto transition-transform duration-300", openDays.includes(day.displayDay) && "rotate-180")} />
              )}
          </button>
          
          <div className={cn(
            "grid transition-all duration-500 ease-in-out",
            openDays.includes(day.displayDay) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="px-4 pb-6 pt-2">
                <div className="p-6 bg-white/60 backdrop-blur-md rounded-[24px] border border-white shadow-lg">
                  {/* Bullet Points / Description */}
                  <div className="space-y-4 mb-8">
                    {day.activities && day.activities.length > 0 ? (
                      <ul className="space-y-2.5">
                        {day.activities.map((act, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium text-zinc-600 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    ) : day.description ? (
                      <div className="space-y-3">
                        {day.description.split('\n').filter(Boolean).map((line, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm font-medium text-zinc-600 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>


                  {/* Sightseeing Places Gallery */}
                  {day.photos && day.photos.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-navy capitalize tracking-widest flex items-center gap-2">
                        Sightseeing Places
                      </h4>
                      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {day.photos.map((photo, i) => {
                          const [url, caption] = photo.split('|');
                          const displayName = caption || day.activities?.[i] || "Explore";
                          return (
                            <div key={i} className="w-24 md:w-32 shrink-0 group/photo">
                              <div className="relative aspect-square rounded-[14px] md:rounded-[18px] overflow-hidden mb-2 border-2 border-white shadow-sm transition-transform group-hover/photo:scale-105">
                                <OptimizedImage 
                                  src={normalizeImageUrl(url) || ""} 
                                  alt={displayName} className="object-cover" 
                                />
                              </div>
                              <p className="text-[8px] md:text-[9px] font-bold text-navy capitalize tracking-widest px-1 line-clamp-1">
                                {displayName}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
