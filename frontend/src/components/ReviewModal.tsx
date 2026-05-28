"use client";

import React from "react";
import { X, Star, Quote, Camera, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Review } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

export default function ReviewModal({ isOpen, onClose, review }: ReviewModalProps) {
  if (!review) return null;

  const images = review.photos && review.photos.length > 0 
    ? review.photos 
    : [review.userImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"];

  const initials = review.userName ? review.userName.charAt(0).toUpperCase() : "U";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90dvh]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black transition-all backdrop-blur-md"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Left Side: Photo Gallery / Main Photo */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-zinc-100 shrink-0">
              <OptimizedImage 
                src={normalizeImageUrl(images[0])} 
                alt="Review photo" 
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/50 shadow-lg shrink-0">
                       <OptimizedImage src={normalizeImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Review Details */}
            <div className="flex-1 p-6 sm:p-10 md:p-16 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 mb-8 sm:mb-12">
                 <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[32px] overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-xl sm:text-3xl border-2 border-white shadow-xl">
                   {review.userImage ? (
                     <OptimizedImage src={normalizeImageUrl(review.userImage)} alt={review.userName} className="w-full h-full object-cover" />
                   ) : initials}
                 </div>
                 <div>
                   <h2 className="text-2xl sm:text-4xl font-bold text-navy capitalize tracking-tighter leading-none mb-2">{review.userName}</h2>
                   <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-1 text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < (review.rating || 5) ? "fill-current" : "opacity-20"}`} />
                        ))}
                      </div>
                      {review.city && (
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold capitalize tracking-widest text-zinc-400">
                          <MapPin className="w-3 h-3 text-primary" /> {review.city}
                        </span>
                      )}
                   </div>
                 </div>
              </div>

              <div className="relative mb-8 sm:mb-12">
                <Quote className="w-12 h-12 sm:w-20 sm:h-20 text-primary/5 absolute -top-6 -left-4 sm:-top-10 sm:-left-8" />
                <p className="text-lg sm:text-2xl font-bold text-navy leading-relaxed relative z-10 italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-auto space-y-6 sm:space-y-8">
                <div className="p-4 sm:p-6 bg-zinc-50 rounded-[24px] sm:rounded-[32px] border border-zinc-100">
                   <span className="text-[10px] sm:text-[11px] font-bold capitalize tracking-[0.2em] text-zinc-400 block mb-3">Expedition Details</span>
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-lg font-bold text-navy capitalize tracking-tight">{review.tripName || "Adventure Trip"}</h4>
                      <span className="px-3 py-1 bg-white rounded-full border border-zinc-200 text-[10px] font-bold capitalize text-primary tracking-widest shadow-sm">Verified Experience</span>
                   </div>
                </div>

                {review.instagram && (
                  <a 
                    href={review.instagram.startsWith('http') ? review.instagram : `https://instagram.com/${review.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] sm:rounded-[20px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold capitalize tracking-widest text-zinc-400 block mb-0.5">Follow The Journey</span>
                      <span className="text-sm sm:text-base font-bold text-navy group-hover:text-primary transition-colors">
                        {review.instagram.startsWith('@') ? review.instagram : `@${review.instagram}`}
                      </span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
