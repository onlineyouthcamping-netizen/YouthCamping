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
        <div className="flex items-center gap-2 text-primary-orange text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {trip.location}
        </div>
        
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-4 md:mb-8 leading-[1.1] tracking-tight group-hover:text-primary-orange transition-colors break-words">
          {trip.title}
        </h3>

        <div className="space-y-4 pt-6 border-t border-zinc-50">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Clock className="w-4 h-4 text-primary-orange" />
              {trip.duration}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Starts at</p>
              <p className="text-2xl font-black text-navy tracking-tighter">₹{trip.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
