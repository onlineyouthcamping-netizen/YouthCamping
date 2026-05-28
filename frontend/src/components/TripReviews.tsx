"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { Review } from "@/types";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface TripReviewsProps {
  reviews: Review[];
}

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  
  if (diffInMonths <= 0) return "Just now";
  if (diffInMonths === 1) return "1 month ago";
  return `${diffInMonths} months ago`;
};

export default function TripReviews({ reviews }: TripReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-navy capitalize tracking-tighter">Reviews</h2>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-8 snap-x">
          {reviews.map((review) => (
            <ReviewCard key={review.id || review._id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowReadMore = review.comment && review.comment.length > 120;
  const displayedComment = isExpanded ? review.comment : (review.comment || "").slice(0, 120) + (shouldShowReadMore ? " " : "");

  const coverPhoto = review.photos && review.photos.length > 0 
    ? review.photos[0] 
    : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070";

  const defaultAvatar = review.userImage ? normalizeImageUrl(review.userImage) : null;
  const initials = review.userName ? review.userName.charAt(0).toUpperCase() : "U";

  const getAvatarColor = (name: string) => {
    const colors = ["#E87A00", "#5C6BC0", "#4CAF50", "#E91E63", "#00BCD4"];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };
  const avatarBg = getAvatarColor(review.userName);

  return (
    <div className="flex-none w-[260px] md:w-[280px] min-h-[400px] snap-start bg-white border border-zinc-100 rounded-[16px] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Top Image */}
      <div className="relative w-full h-[160px] shrink-0 bg-zinc-100 overflow-hidden">
        <OptimizedImage 
          src={normalizeImageUrl(coverPhoto) || "https://images.unsplash.com/photo-1501785888041-af3ef285b470"} 
          alt="Review cover" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-[14px] h-[14px] ${i < (review.rating || 5) ? "fill-[#F4B400] text-[#F4B400]" : "fill-zinc-200 text-zinc-200"}`} 
            />
          ))}
        </div>

        {/* Comment */}
        <div className="mb-4 flex-1">
          <p className="text-[#333333] text-[13px] leading-[1.5] line-clamp-4">
            {displayedComment}
            {shouldShowReadMore && !isExpanded && (
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-[#999999] text-[13px] cursor-pointer hover:text-navy transition-colors ml-1"
              >
                Read more...
              </button>
            )}
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-2 mt-auto pt-4">
          <div 
            className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-medium text-[14px]"
            style={{ backgroundColor: avatarBg }}
          >
            {defaultAvatar ? (
              <OptimizedImage 
                src={defaultAvatar} 
                alt={review.userName} 
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="text-[13px] font-bold text-[#222222] leading-tight truncate">{review.userName}</h4>
            {review.instagram && (
              <a 
                href={`https://instagram.com/${review.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary-orange font-bold lowercase truncate hover:underline decoration-primary-orange"
              >
                {review.instagram}
              </a>
            )}
            <span className="text-[11px] text-[#888888] mt-0.5 truncate">
              {review.tripName || review.tripType || "Adventure Trip"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
