"use client";

import React, { useState, useMemo } from "react";
import {
  Maximize2,
  MapPin,
  X,
  BedDouble,
  Utensils,
  Building,
  Bath,
  Sparkles,
} from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface AccommodationGallery {
  url: string;
  category: string;
  title?: string;
}

interface Accommodation {
  name: string;
  location: string;
  nights: string;
  type: string;
  starRating?: string;
  roomType?: string;
  meals?: string;
  image: string;
  amenities?: string[];
  gallery?: AccommodationGallery[];
}

interface StaySectionProps {
  accommodations?: Accommodation[];
}

const STAY_TYPE_WORDS = [
  "cottage",
  "cottages",
  "hotel",
  "homestay",
  "camp",
  "camping",
  "resort",
  "villa",
  "tent",
  "tents",
];

function isRedundantStayTypeChip(amenity: string, stay: Accommodation) {
  const text = amenity.toLowerCase().trim();
  if (!text) return true;
  const name = (stay.name || "").toLowerCase();
  const type = (stay.type || "").toLowerCase();
  const isTypeWord = STAY_TYPE_WORDS.includes(text);
  if (!isTypeWord) return false;
  if (name.includes(text.replace(/s$/, "")) || name.includes(text)) return true;
  if (type && (type.includes(text) || text.includes(type.replace(/s$/, "")))) {
    return name.includes(type.replace(/s$/, "")) || name.includes(type);
  }
  return false;
}


export default function StaySection({ accommodations }: StaySectionProps) {
  const [selectedStay, setSelectedStay] = useState<Accommodation | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const staysList = accommodations || [];

  const modalCategories = useMemo(() => {
    if (!selectedStay) return ["All"];
    const gallery = selectedStay.gallery || [];
    const catSet = new Set<string>();
    gallery.forEach((img) => {
      if (img && img.category) catSet.add(img.category);
    });
    if (catSet.size === 0) return ["All", "Property & Views"];
    return ["All", ...Array.from(catSet)];
  }, [selectedStay]);

  const filteredImages = useMemo(() => {
    if (!selectedStay) return [];
    const gallery =
      selectedStay.gallery && selectedStay.gallery.length > 0
        ? selectedStay.gallery
        : [
            {
              url: selectedStay.image,
              category: "Property & Views",
              title: selectedStay.name,
            },
          ];
    if (activeCategory === "All") return gallery;
    return gallery.filter((img) => img && img.category === activeCategory);
  }, [selectedStay, activeCategory]);

  const highlightAmenities = useMemo(() => {
    if (!selectedStay?.amenities) return [];
    return selectedStay.amenities.filter(
      (amenity) =>
        Boolean(String(amenity || "").trim()) &&
        !isRedundantStayTypeChip(String(amenity), selectedStay),
    );
  }, [selectedStay]);

  if (staysList.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 scroll-mt-[140px]" id="stay">
      {/* Header System */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0B1528] tracking-tight font-montserrat leading-none">
          Stay &{" "}
          <span className="text-[#D4541A] font-caveat italic">
            Accommodations
          </span>
        </h2>
      </div>

      {/* Stays Horizontal 1.5 Cards Peek Slider on Mobile & Grid on Desktop */}
      <div
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden no-scrollbar py-2 scroll-smooth snap-x snap-mandatory touch-manipulation flex-nowrap sm:flex-wrap"
        style={{ touchAction: "pan-x" }}
      >
        {staysList.map((stay, i) => (
          <div
            key={i}
            className="flex-none snap-start w-[58vw] min-w-[200px] sm:w-auto sm:min-w-0 sm:max-w-none max-w-[220px] flex flex-col"
          >
            <div
              onClick={() => {
                setSelectedStay(stay);
                setActiveCategory("All");
              }}
              className="bg-white border border-zinc-200/80 rounded-[14px] overflow-hidden shadow-[0_6px_20px_rgba(11,21,40,0.06)] hover:shadow-[0_12px_28px_rgba(11,21,40,0.1)] hover:border-[#D4541A]/60 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* Photo */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                <OptimizedImage
                  src={normalizeImageUrl(stay.image)}
                  alt={stay.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 hidden sm:flex bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 px-3 pt-2.5 pb-2 sm:px-3.5 sm:pt-3 sm:pb-2.5">
                <h3 className="text-[13px] sm:text-sm font-extrabold text-[#0B1528] font-montserrat line-clamp-2 leading-snug group-hover:text-[#D4541A] transition-colors min-h-[2.5rem] sm:min-h-0">
                  {stay.name}
                </h3>

                <div className="flex items-start gap-1 mt-1.5 text-[11px] text-zinc-500 font-medium font-montserrat leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-[#D4541A] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{stay.location}</span>
                </div>

                {stay.amenities && stay.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stay.amenities
                      .filter(
                        (amenity) =>
                          Boolean(String(amenity || "").trim()) &&
                          !isRedundantStayTypeChip(String(amenity), stay),
                      )
                      .slice(0, 2)
                      .map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex max-w-full items-center rounded-md bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 font-montserrat"
                        >
                          <span className="truncate">{amenity}</span>
                        </span>
                      ))}
                  </div>
                )}

                <div className="mt-auto pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-semibold text-zinc-500 font-montserrat">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate text-zinc-600">{stay.type}</span>
                  </div>
                  {stay.starRating &&
                    stay.starRating.toLowerCase().trim() !==
                      (stay.type || "").toLowerCase().trim() && (
                      <span className="shrink-0 rounded-md bg-[#FFF7F2] px-1.5 py-0.5 text-[10px] font-bold text-[#C2410C]">
                        {stay.starRating}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stay detail modal */}
      <AnimatePresence>
        {selectedStay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pt-20 sm:p-6 md:p-8 overflow-hidden"
          >
            <div
              className="fixed inset-0 bg-[#0B1528]/75 backdrop-blur-sm"
              onClick={() => setSelectedStay(null)}
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="stay-modal-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={`relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_24px_64px_rgba(11,21,40,0.18)] sm:rounded-[22px] ${
                activeCategory === "All"
                  ? "max-h-[min(78vh,820px)] sm:max-h-[min(88vh,820px)]"
                  : "max-h-[min(72vh,640px)]"
              }`}
            >
              {/* Header */}
              <div className="relative shrink-0 border-b border-zinc-100">
                {activeCategory === "All" ? (
                  <>
                    <div className="relative h-[112px] sm:h-[128px] w-full overflow-hidden bg-zinc-100">
                      <OptimizedImage
                        src={normalizeImageUrl(selectedStay.image)}
                        alt={selectedStay.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
                      <button
                        type="button"
                        onClick={() => setSelectedStay(null)}
                        aria-label="Close stay details"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#0B1528] shadow-md transition-colors hover:bg-white cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                      <h3
                        id="stay-modal-title"
                        className="font-montserrat text-base sm:text-lg font-extrabold leading-snug text-[#0B1528] pr-10"
                      >
                        {selectedStay.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                          <MapPin className="h-3 w-3 shrink-0 text-[#D4541A]" />
                          <span className="truncate">{selectedStay.location}</span>
                        </span>
                        {selectedStay.nights && (
                          <span className="rounded-full bg-[#FFF1E8] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                            {selectedStay.nights}
                          </span>
                        )}
                        {selectedStay.type && (
                          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0B1528]">
                            {selectedStay.type}
                          </span>
                        )}
                        {selectedStay.starRating &&
                          selectedStay.starRating.toLowerCase().trim() !==
                            (selectedStay.type || "").toLowerCase().trim() && (
                            <span className="rounded-full bg-[#FFF7F2] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                              {selectedStay.starRating}
                            </span>
                          )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        {selectedStay.name}
                      </p>
                      <h3 className="mt-0.5 font-montserrat text-sm font-extrabold text-[#0B1528]">
                        {activeCategory}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStay(null)}
                      aria-label="Close stay details"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-[#0B1528] transition-colors hover:bg-zinc-50 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Category filters */}
              <div className="shrink-0 border-b border-zinc-100 px-4 py-2.5 sm:px-5">
                <div
                  className="flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
                  style={{ touchAction: "pan-x" }}
                >
                  {modalCategories.map((cat) => {
                    const active = activeCategory === cat;
                    const Icon =
                      cat === "Interior / Rooms"
                        ? BedDouble
                        : cat === "Bathroom"
                          ? Bath
                          : cat === "Dining Area"
                            ? Utensils
                            : cat === "Property & Views"
                              ? Sparkles
                              : null;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-montserrat transition-colors cursor-pointer ${
                          active
                            ? "bg-[#0B1528] text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80"
                        }`}
                      >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable body */}
              <div
                className={`overflow-y-auto overscroll-contain custom-scrollbar ${
                  activeCategory === "All"
                    ? "flex-1 space-y-6 px-4 py-4 pb-16 sm:px-5 sm:py-5 sm:pb-20"
                    : "px-3 py-3 pb-4 sm:px-4 sm:py-4"
                }`}
              >
                {activeCategory === "All" && highlightAmenities.length > 0 && (
                  <section>
                    <h4 className="mb-2.5 font-montserrat text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Highlights
                    </h4>
                    <ul className="flex flex-wrap gap-2">
                      {highlightAmenities.map((amenity, idx) => (
                        <li
                          key={idx}
                          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-700 font-montserrat"
                        >
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {activeCategory === "All" &&
                  ((selectedStay as any).mealsBreakdown ||
                    (selectedStay as any).meals) && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-[#D4541A]" />
                      <h4 className="font-montserrat text-sm font-bold text-[#0B1528]">
                        Meals included
                      </h4>
                    </div>
                    {((selectedStay as any).mealsBreakdown?.breakfast ||
                      (selectedStay as any).mealsBreakdown?.lunch ||
                      (selectedStay as any).mealsBreakdown?.dinner) ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-montserrat">
                        {(
                          [
                            ["Breakfast", (selectedStay as any).mealsBreakdown?.breakfast],
                            ["Lunch", (selectedStay as any).mealsBreakdown?.lunch],
                            ["Dinner", (selectedStay as any).mealsBreakdown?.dinner],
                          ] as const
                        )
                          .filter(([, text]) => Boolean(text))
                          .map(([label, text]) => (
                            <div
                              key={label}
                              className="rounded-xl border border-zinc-200/80 bg-white p-3.5"
                            >
                              <p className="text-[11px] font-bold uppercase tracking-wide text-[#D4541A]">
                                {label}
                              </p>
                              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600">
                                {text}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-[13px] leading-relaxed text-zinc-600 font-montserrat">
                        {(selectedStay as any).meals}
                      </p>
                    )}
                    {(selectedStay as any).disclaimer && (
                      <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-400 font-montserrat">
                        {(selectedStay as any).disclaimer}
                      </p>
                    )}
                  </section>
                )}

                <section>
                  {activeCategory === "All" && (
                    <h4 className="mb-3 font-montserrat text-sm font-bold text-[#0B1528]">
                      Property photos
                    </h4>
                  )}
                  <div
                    className={`grid gap-2.5 sm:gap-3 ${
                      activeCategory === "All"
                        ? "grid-cols-2 md:grid-cols-3"
                        : "grid-cols-2 sm:grid-cols-3"
                    }`}
                  >
                    {filteredImages.map((img, idx) => (
                      <figure
                        key={`${img.url}-${idx}`}
                        className="group overflow-hidden rounded-xl bg-zinc-100"
                      >
                        <div className="relative aspect-[4/3] w-full">
                          <OptimizedImage
                            src={normalizeImageUrl(img.url) || selectedStay.image}
                            alt={img.title || selectedStay.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          {activeCategory === "All" && img.category && (
                            <figcaption className="absolute left-2 top-2 rounded-md bg-[#0B1528]/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                              {img.category}
                            </figcaption>
                          )}
                        </div>
                        {activeCategory === "All" && img.title && (
                          <p className="truncate px-2 py-1.5 text-[11px] font-semibold text-zinc-600 font-montserrat">
                            {img.title}
                          </p>
                        )}
                      </figure>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
