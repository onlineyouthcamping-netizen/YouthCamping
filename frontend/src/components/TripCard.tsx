"use client";

import { Trip } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";

import { Clock, MapPin, ArrowUpRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface TripCardProps {
  trip: Trip;
  index: number;
}

export default function TripCard({ trip, index }: TripCardProps) {


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[32px] overflow-hidden border border-zinc-100 hover:border-primary-orange/20 transition-all shadow-sm hover:shadow-2xl h-full"
    >
      {/* Invisible Link Overlay - Ensures 100% clickability */}
      <Link 
        href={`/trips/${trip.slug}`} 
        className="absolute inset-0 z-30 cursor-pointer"
        aria-label={`View ${trip.title}`}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedImage
          src={normalizeImageUrl(trip.heroImage) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Hover Arrow */}
        <div className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-2xl z-10">
          <ArrowUpRight className="w-6 h-6 text-navy" />
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 text-primary-orange text-xs font-semibold uppercase tracking-wide mb-4">
          <MapPin className="w-4 h-4" />
          {trip.location}
        </div>
        
        <h3 
          className="text-xl text-navy mb-4 md:mb-6 leading-tight tracking-tight group-hover:text-primary-orange transition-colors break-words"
          style={{ fontWeight: 'var(--font-weight-heading, 500)' }}
        >
          {trip.title}
        </h3>

        <div className="space-y-4 pt-6 border-t border-zinc-50">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wide">
              <Clock className="w-5 h-5 text-primary-orange" />
              {trip.duration}
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 font-normal uppercase tracking-wide mb-1">Starts at</p>
              <p className="text-xl font-semibold tracking-wide text-navy">₹{trip.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
