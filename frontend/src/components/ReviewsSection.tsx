"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Star, ChevronRight, Quote, Camera } from "lucide-react";
import Link from "next/link";
import { Review } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";
import { useIsMobile } from "@/hooks/useIsMobile";

const ReviewModal = dynamic(() => import("./ReviewModal"), { ssr: false });

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

const defaultReviews: Review[] = [
  {
    id: "rev-1",
    userName: "Abhinav Sharma",
    tripName: "Kedarnath & Chopta Trek",
    city: "Delhi",
    userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    comment: "An absolutely spiritual and exhilarating journey with YouthCamping! The trek leads and campsite arrangements were top-notch.",
    isFeatured: true,
    photos: ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"],
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-2",
    userName: "Ananya Deshmukh",
    tripName: "Spiti Valley Winter Expedition",
    city: "Mumbai",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    comment: "Exploring frozen waterfalls and ancient monasteries in Spiti was a dream come true. Highly professional team and cozy homestays!",
    isFeatured: true,
    photos: ["https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80"],
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-3",
    userName: "Siddharth Verma",
    tripName: "Manali to Kasol Camping",
    city: "Chandigarh",
    userImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    comment: "Perfect weekend getaway with amazing riverside camping vibes, bonfire sessions, and brilliant co-travelers!",
    isFeatured: true,
    photos: ["https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&w=800&q=80"],
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-4",
    userName: "Priya Nair",
    tripName: "Chadar Frozen River Trek",
    city: "Bengaluru",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    comment: "Walking on the frozen Zanskar river was thrilling! YouthCamping's safety protocols and hot meals on ice kept us warm throughout.",
    isFeatured: true,
    photos: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"],
    createdAt: new Date().toISOString()
  }
];

export default function ReviewsSection({ 
  reviews = [],
  title = "Reviews",
  subtitle,
  titleSize,
  titleWeight,
  topLabel,
  titleStyle = 'standard',
  wavyEdges = false,
  topColor = "#ffffff",
  bottomColor = "#ffffff",
}: ReviewsSectionProps) {
  const displayReviews = (reviews && reviews.length > 0) ? reviews : defaultReviews;
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const finalAlign = 'left';
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduceMotion = prefersReducedMotion || isMobile;

  const openReview = (rev: Review) => {
    setSelectedReview(rev);
    setIsModalOpen(true);
  };
  return (
    <div className="overflow-hidden relative section-wrapper reviews-section bg-transparent">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      <div className="max-w-[1440px] mx-auto relative">
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
                className="section-heading text-navy"
                style={{ 
                  fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
                  fontWeight: titleWeight ? titleWeight : undefined
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

        <div className="flex gap-4 md:gap-[28px] overflow-x-auto no-scrollbar pb-6 snap-x">
          {displayReviews.map((rev, i) => (
            <ReviewCard key={rev._id || rev.id || i} rev={rev} i={i} onClick={() => openReview(rev)} reduceMotion={reduceMotion} />
          ))}
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

function ReviewCard({ rev, i, onClick, reduceMotion }: { rev: Review, i: number, onClick: () => void, reduceMotion: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowReadMore = rev.comment && rev.comment.length > 120;
  const displayedComment = isExpanded ? rev.comment : (rev.comment || "").slice(0, 120) + (shouldShowReadMore ? " " : "");

  const coverPhoto = rev.photos && rev.photos.length > 0 
    ? rev.photos[0] 
    : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070";

  const defaultAvatar = rev.userImage ? normalizeImageUrl(rev.userImage) : null;
  const initials = rev.userName ? rev.userName.charAt(0).toUpperCase() : "U";

  const getAvatarColor = (name: string) => {
    const colors = ["#E87A00", "#5C6BC0", "#4CAF50", "#E91E63", "#00BCD4"];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };
  const avatarBg = getAvatarColor(rev.userName);

  return (
    <div 
      onClick={onClick}
      className="flex-none w-[260px] md:w-[280px] min-h-[400px] snap-start bg-white border border-zinc-150 rounded-[16px] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group cursor-pointer"
    >
      {/* Top Image */}
      <div className="relative w-full h-[160px] shrink-0 bg-zinc-100 overflow-hidden">
        <OptimizedImage 
          src={normalizeImageUrl(coverPhoto) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470"} 
          alt="Review cover" 
          cloudinaryWidth={480}
          bunnyVariant="x540gt"
          sizes="280px"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, idx) => (
            <Star 
              key={idx} 
              className={`w-[14px] h-[14px] ${idx < (rev.rating || 5) ? "fill-[#fbbc05] text-[#fbbc05]" : "fill-zinc-200 text-zinc-200"}`} 
            />
          ))}
        </div>

        {/* Comment */}
        <div className="mb-4 flex-1">
          <p className="text-[#333333] text-[13px] leading-[1.5]">
            {displayedComment}
            {shouldShowReadMore && !isExpanded && (
              <span className="text-[#999999] text-[13px] hover:text-[#222222] ml-1">
                Read more...
              </span>
            )}
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-50">
          <div 
            className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-medium text-[14px]"
            style={{ backgroundColor: avatarBg }}
          >
            {defaultAvatar ? (
              <OptimizedImage 
                src={defaultAvatar} 
                alt={rev.userName} 
                cloudinaryWidth={80}
                sizes="36px"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="text-[13px] font-bold text-[#222222] leading-tight truncate">{rev.userName}</h4>
            <span className="text-[11px] text-[#888888] mt-0.5 truncate">
              {rev.tripName || rev.tripType || "Adventure Trip"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

