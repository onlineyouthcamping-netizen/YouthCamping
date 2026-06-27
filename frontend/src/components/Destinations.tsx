"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";
import { useIsMobile } from "@/hooks/useIsMobile";

const DestinationInquiryModal = dynamic(() => import("./DestinationInquiryModal"), { ssr: false });

interface Destination {
  name: string;
  img: string;
  duration?: string;
  subtext?: string;
}

interface DestinationsProps {
  title?: string;
  subtitle?: string;
  destinations?: Destination[];
  titleSize?: string | number;
  titleWeight?: string | number;
  topLabel?: string;
  titleStyle?: 'standard' | 'boxed';
  wavyEdges?: boolean;
  topColor?: string;
  bottomColor?: string;
}

const DESTINATION_FALLBACK = "/page-builder-defaults/destination-card.svg";

const defaultDestinations: Destination[] = [
  { 
    name: "Maldives", 
    img: DESTINATION_FALLBACK,
    duration: "5 Days 4 Nights",
    subtext: "Luxury overwater villas and crystal clear lagoons"
  },
  { 
    name: "Singapore", 
    img: DESTINATION_FALLBACK,
    duration: "4 Days 3 Nights",
    subtext: "City in a garden and world-class attractions"
  },
  { 
    name: "Thailand", 
    img: DESTINATION_FALLBACK,
    duration: "6 Days 5 Nights",
    subtext: "Tropical beaches and vibrant street life"
  },
  { 
    name: "Malaysia", 
    img: DESTINATION_FALLBACK,
    duration: "5 Days 4 Nights",
    subtext: "Modern skyscrapers and ancient rainforests"
  },
  { 
    name: "Bali", 
    img: DESTINATION_FALLBACK,
    duration: "7 Days 6 Nights",
    subtext: "Spiritual retreats and world-famous surf breaks"
  },
];

/** Individual destination card with loading skeleton and error fallback */
function DestinationCard({ dest, index, reduceMotion, onClick }: {
  dest: Destination;
  index: number;
  reduceMotion: boolean;
  onClick: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = imgError
    ? DESTINATION_FALLBACK
    : (dest.img ? normalizeImageUrl(dest.img) : DESTINATION_FALLBACK);

  return (
    <motion.div
      key={index}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="relative min-w-[280px] md:min-w-[340px] flex-1 aspect-[3/4.2] rounded-[32px] overflow-hidden group snap-start shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer bg-[#E2EBE5]"
    >
      {/* Skeleton loading background — visible until image loads */}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4DFD8] to-[#C4DAD2] animate-pulse" />
      )}
      <OptimizedImage
        src={imgSrc}
        alt={dest.name}
        width={680}
        height={952}
        cloudinaryWidth={640}
        bunnyVariant="x540gt"
        sizes="(max-width: 768px) 280px, 340px"
        onLoad={() => setImgLoaded(true)}
        onError={() => { setImgError(true); setImgLoaded(true); }}
        className={cn(
          "w-full h-full object-cover transition-all duration-1000 group-hover:scale-110",
          imgLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3
          className="text-2xl md:text-3xl text-white tracking-tighter text-center capitalize"
          style={{ fontWeight: 'var(--font-weight-card, 500)' }}
        >
          {dest.name}
        </h3>
      </div>
    </motion.div>
  );
}

export default function Destinations({ 
  title = "Top Destinations",
  subtitle,
  destinations = [],
  titleSize,
  titleWeight,
  topLabel,
  titleStyle = 'standard',
  wavyEdges = false,
  topColor = "#ffffff",
  bottomColor = "#ffffff",
}: DestinationsProps) {
  const items = (destinations && destinations.length > 0) ? destinations : defaultDestinations;
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduceMotion = prefersReducedMotion || isMobile;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-wrapper bg-[#f3f4f6] overflow-hidden relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-row items-end justify-between mb-8">
          <div className="flex flex-col">
            {topLabel && (
              <span className="section-label">
                {topLabel}
              </span>
            )}
            <div className={cn(
              titleStyle === 'boxed' && "p-6 md:px-10 md:py-8 rounded-[20px] md:rounded-[32px] border border-slate-200 bg-white shadow-sm max-w-fit"
            )}>
              <h2 
                className="section-heading text-navy capitalize"
                style={{ 
                  fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
                  fontWeight: titleWeight ? titleWeight : undefined
                }}
              >
                {title}
              </h2>
            </div>
          </div>
          <div className="hidden md:flex gap-3 pb-2">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-navy hover:text-white transition-all bg-white shadow-sm" aria-label="Scroll Left">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-navy hover:text-white transition-all bg-white shadow-sm" aria-label="Scroll Right">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 md:gap-[28px] overflow-x-auto no-scrollbar pb-6 snap-x">
          {items.map((dest, i) => (
            <DestinationCard
              key={i}
              dest={dest}
              index={i}
              reduceMotion={reduceMotion}
              onClick={() => setSelectedDest(dest)}
            />
          ))}
        </div>
      </div>

      <DestinationInquiryModal 
        isOpen={!!selectedDest}
        onClose={() => setSelectedDest(null)}
        destination={selectedDest}
      />
      {wavyEdges && <WavyEdges color={bottomColor} position="bottom" />}
    </section>
  );
}
