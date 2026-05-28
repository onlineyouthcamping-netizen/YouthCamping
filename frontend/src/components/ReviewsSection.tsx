"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight, Quote, Camera } from "lucide-react";
import Link from "next/link";
import { Review } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import ReviewModal from "./ReviewModal";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
  subtitle?: string;
  titleSize?: string | number;
  titleWeight?: string | number;
  topLabel?: string;
  titleStyle?: 'standard' | 'boxed';
  wavyEdges?: boolean;
  topColor?: string;
  bottomColor?: string;
}

export default function ReviewsSection({ 
  reviews = [],
  title = "What Our Travelers Say",
  subtitle,
  titleSize,
  titleWeight,
  topLabel,
  titleStyle = 'standard',
  wavyEdges = false,
  topColor = "#ffffff",
  bottomColor = "#ffffff",
}: ReviewsSectionProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const finalAlign = 'left';

  const openReview = (rev: Review) => {
    setSelectedReview(rev);
    setIsModalOpen(true);
  };
  return (
    <div className="overflow-hidden relative section-wrapper bg-transparent">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      <div className="max-w-[1440px] mx-auto relative">
        <div className="flex flex-row items-end justify-between mb-12">
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
                className="section-heading text-navy"
                style={{ 
                  fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
                  fontWeight: titleWeight || undefined
                }}
              >
                {title}
              </h2>
            </div>
          </div>
          <Link href="/reviews" className="flex items-center gap-2 text-navy font-bold hover:text-primary transition-all capitalize text-sm tracking-tight pb-2 mr-1">
            View All
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-12 snap-x">
          {reviews.map((rev, i) => (
            <ReviewCard key={rev._id || rev.id || i} rev={rev} i={i} onClick={() => openReview(rev)} />
          ))}
          {reviews.length === 0 && (
            <div className="w-full py-20 text-center border-4 border-dashed border-zinc-200 rounded-[40px]">
              <p className="text-zinc-400 font-bold capitalize tracking-widest">No verified reviews yet.</p>
            </div>
          )}
        </div>
      </div>

      <ReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
      />
      {wavyEdges && <WavyEdges color={bottomColor} position="bottom" />}
    </div>
  );
}

function ReviewCard({ rev, i, onClick }: { rev: Review, i: number, onClick: () => void }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Use photos array or fallback to user image or default
  const images = rev.photos && rev.photos.length > 0 
    ? rev.photos 
    : [rev.userImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"];

  const currentImage = images[activeImageIdx];
  const profileImage = rev.userImage ? normalizeImageUrl(rev.userImage) : null;
  const initials = rev.userName ? rev.userName.charAt(0).toUpperCase() : "U";

  const getAvatarColor = (name: string) => {
    const colors = ["#E87A00", "#5C6BC0", "#4CAF50", "#E91E63", "#00BCD4"];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };
  const avatarBg = getAvatarColor(rev.userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="flex-none w-[320px] md:w-[420px] snap-start bg-white border border-zinc-50 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden group cursor-pointer"
    >
      {/* Visual Header - Gallery */}
      <div className="relative w-full h-[280px] bg-zinc-100 overflow-hidden">
        <OptimizedImage 
          src={normalizeImageUrl(currentImage)} 
          alt="Travel location" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gallery Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIdx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-8 flex flex-col flex-1 space-y-6">
        {/* Rating & Comment */}
        <div className="space-y-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, idx) => (
              <Star 
                key={idx} 
                className={`w-[14px] h-[14px] ${idx < (rev.rating || 5) ? "fill-primary text-primary" : "fill-zinc-100 text-zinc-100"}`} 
              />
            ))}
          </div>
          
          <div className="relative">
            <Quote className="w-8 h-8 text-primary/10 absolute -top-4 -left-2" />
            <p className="text-navy text-sm md:text-base font-medium leading-relaxed line-clamp-4 relative z-10">
              "{rev.comment}"
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 pt-6 border-t border-zinc-50 mt-auto">
          <div 
            className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-inner border-2 border-white"
            style={{ backgroundColor: avatarBg }}
          >
            {profileImage ? (
              <OptimizedImage 
                src={profileImage} 
                alt={rev.userName} 
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm md:text-base font-bold text-navy leading-tight truncate">{rev.userName}</h4>
            {rev.instagram && (
              <a 
                href={rev.instagram.startsWith('http') ? rev.instagram : `https://instagram.com/${rev.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group/insta mt-0.5"
              >
                <span className="text-[10px] text-primary font-bold capitalize tracking-widest hover:underline truncate">
                  {rev.instagram.includes('instagram.com/') 
                    ? `@${rev.instagram.split('instagram.com/').pop()?.split('/')[0].split('?')[0]}` 
                    : (rev.instagram.startsWith('@') ? rev.instagram : `@${rev.instagram}`)
                  }
                </span>
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform">
                  <Camera className="w-3 h-3" />
                </div>
              </a>
            )}
            <span className="text-[10px] text-zinc-400 font-medium capitalize tracking-widest mt-1 truncate">
              {rev.tripName && rev.city ? `${rev.tripName} • ${rev.city}` : (rev.tripName || rev.city || "Adventure Trip")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

