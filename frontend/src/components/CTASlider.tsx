"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { normalizeImageUrl } from "@/lib/api";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface Slide {
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
}

interface CTASliderProps {
  title?: string;
  items?: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

export default function CTASlider({
  items = [],
  autoPlay = true,
  interval = 5000
}: CTASliderProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const displayItems = items.length > 0 ? items : [
    {
      subtitle: "It's time for",
      title: "Winter Trips",
      image: "https://youthcamping.online/wp-content/uploads/2024/05/winter-trips-banner.jpg", // generic snowy mountain placeholder
      link: "/trips"
    },
    {
      subtitle: "Ready for",
      title: "Summer Escapes",
      image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3",
      link: "/trips"
    }
  ];

  const index = Math.abs(page % displayItems.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (!autoPlay || displayItems.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, interval);
    return () => clearInterval(timer);
  }, [displayItems.length, autoPlay, interval, page]);

  const current = displayItems[index];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative z-10 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="relative h-[300px] md:h-[400px] w-full rounded-[32px] overflow-hidden group shadow-2xl bg-zinc-900 border border-zinc-50">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              <Link href={current.link || "/trips"} className="block w-full h-full relative">
                <OptimizedImage 
                  src={normalizeImageUrl(current.image)} 
                  alt={current.title || "Cinematic View"} 
                  className="w-full h-full object-cover transition-transform duration-1000"
                />
                
                {/* Subtle Gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40" />
                
                {/* Decorative Icon (Leaf/Bird) Top Right */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 opacity-80">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="white" fillOpacity="0.8"/>
                    <path d="M16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12Z" fill="white" fillOpacity="0.4"/>
                  </svg>
                </div>

                {/* Content Overlay - Right Aligned */}
                <div className="absolute inset-0 flex flex-col justify-center items-end text-center md:text-right p-8 md:pr-24 lg:pr-32">
                  
                  {current.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-base md:text-lg font-medium tracking-wide mb-1 drop-shadow-md font-sans"
                    >
                      {current.subtitle}
                    </motion.p>
                  )}
                  
                  {current.title && (
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 md:mb-8 capitalize tracking-tighter"
                      style={{ fontWeight: 'var(--font-weight-heading, 300)' }}
                    >
                      {current.title}
                    </motion.h2>
                  )}

                  {/* Assuming 'link' or we derive 'tags' for the pill container. Using standard text for now. */}
                  {current.title === "Winter Trips" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-md px-6 py-2 md:py-2.5 rounded-full shadow-xl"
                    >
                      <span className="text-navy font-bold text-[11px] md:text-sm tracking-widest text-[#1B2A4A] capitalize">
                        Kashmir • Spiti Valley • Kasol Manali
                      </span>
                    </motion.div>
                  ) : current.subtitle ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-md px-6 py-2 md:py-2.5 rounded-full shadow-xl"
                    >
                      <span className="text-navy font-bold text-[11px] md:text-sm tracking-widest text-[#1B2A4A] capitalize">
                        {current.subtitle}
                      </span>
                    </motion.div>
                  ) : null}
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          {displayItems.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {displayItems.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setPage([i, i > index ? 1 : -1])}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
