"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";
import { useIsMobile } from "@/hooks/useIsMobile";

interface BlogItem {
  title: string;
  author: string;
  authorImage?: string;
  readTime: string;
  image: string;
  status: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  hasVideo?: boolean;
  createdAt?: string;
}

interface BlogSectionProps {
  blogs?: BlogItem[];
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

export default function BlogSection({ 
  blogs = [],
  title = "Watch & Read",
  subtitle,
  titleSize,
  titleWeight,
  topLabel,
  titleStyle = 'standard',
  wavyEdges = false,
  topColor = "#ffffff",
  bottomColor = "#ffffff",
}: BlogSectionProps) {
  const displayBlogs = blogs.length > 0 ? blogs : [];
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduceMotion = prefersReducedMotion || isMobile;

  const scrollRight = () => {
    const el = document.getElementById('blog-slider-container');
    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section className="section-wrapper bg-transparent overflow-hidden relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      <div className="max-w-[1440px] mx-auto relative">
        <div className="flex flex-col mb-8">
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

        <div className="relative group">
          <div 
            id="blog-slider-container"
            className="flex gap-4 md:gap-[28px] overflow-x-auto no-scrollbar pb-6 snap-x scroll-smooth"
          >
            {displayBlogs.map((art, i) => (
              <BlogCard key={art.slug || i} art={art} i={i} reduceMotion={reduceMotion} />
            ))}
            {displayBlogs.length === 0 && (
              <div className="w-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-[32px]">
                <p className="text-zinc-400 font-bold text-sm">No stories published yet.</p>
              </div>
            )}
          </div>

          {/* Floating Next Button */}
          {displayBlogs.length > 0 && (
            <button 
              onClick={scrollRight}
              className="absolute -right-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-navy hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      {wavyEdges && <WavyEdges color={bottomColor} position="bottom" />}
    </section>
  );
}

const BLOG_PHOTO_MAP: Record<string, string> = {
  kasol: "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&w=800&q=80",
  parvati: "https://images.unsplash.com/photo-1597037750734-450f6f406560?auto=format&fit=crop&w=800&q=80",
  spiti: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
  zanskar: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  chadar: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  kedarnath: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"
};

function getBlogCover(art: BlogItem): string {
  if (art.image) {
    const normalized = normalizeImageUrl(art.image);
    if (normalized) return normalized;
  }
  const titleKey = (art.title || "").toLowerCase();
  for (const [key, photoUrl] of Object.entries(BLOG_PHOTO_MAP)) {
    if (titleKey.includes(key)) return photoUrl;
  }
  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
}

function BlogCard({ art, i, reduceMotion }: { art: BlogItem, i: number, reduceMotion: boolean }) {
  const content = art.content || '';
  const isVideo = Boolean(art.hasVideo || content.includes('youtube.com') || content.includes('youtu.be') || content.includes('iframe'));
  const linkPath = isVideo ? `/watch/${art.slug}` : `/read/${art.slug}`;

  const initials = art.author ? art.author.charAt(0).toUpperCase() : "Y";
  const getAvatarColor = (name: string) => {
    const colors = ["#E87A00", "#5C6BC0", "#4CAF50", "#E91E63", "#00BCD4"];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };
  const avatarBg = getAvatarColor(art.author);

  // Strip HTML for snippet
  const snippet = (art.excerpt || content.replace(/<[^>]*>/g, '')).slice(0, 80) + "...";
  const blogImageSrc = getBlogCover(art);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={reduceMotion ? { duration: 0 } : { delay: i * 0.1 }}
      viewport={{ once: true }}
      className="flex-none snap-start bg-white border border-zinc-50 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden group/card"
      style={{ width: '380px', height: '450px', minWidth: '380px', minHeight: '450px' }}
    >
      <Link href={linkPath} prefetch={false} className="flex flex-col h-full w-full text-left">
        {/* Top Image Area */}
        <div 
          className="relative w-full bg-zinc-100 overflow-hidden group"
          style={{ height: '220px', minHeight: '220px' }}
        >
          <OptimizedImage 
            src={blogImageSrc} 
            alt={art.title} 
            cloudinaryWidth={600}
            bunnyVariant="x540gt"
            sizes="380px"
            width={600}
            height={340}
            priority={true}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          {/* Magazine Icon Overlay */}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
             <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14a2 2 0 002 2h14v-2H4V6zm16-4H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
             </svg>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex gap-3 items-start flex-1">
             <div 
              className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-[12px] shadow-sm mt-0.5"
              style={{ backgroundColor: avatarBg }}
            >
              {art.authorImage ? (
                <OptimizedImage 
                  src={normalizeImageUrl(art.authorImage)} 
                  alt={art.author} 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col h-full">
              <h3 className="text-sm md:text-base font-bold text-navy leading-[1.4] mb-2 line-clamp-1 group-hover/card:text-primary transition-colors">
                {art.title}
              </h3>
              
              <p className="text-[12px] md:text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2 mb-3">
                {snippet} <span className="text-primary hover:underline">Read more...</span>
              </p>
              
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-50 pt-3">
                <div className="flex flex-col">
                   <span className="text-[9px] text-zinc-400 font-bold capitalize tracking-widest leading-none mb-0.5">Author</span>
                   <span className="text-[10px] text-navy font-bold truncate">{art.author}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[9px] text-zinc-400 font-bold capitalize tracking-widest leading-none mb-0.5">Time</span>
                   <span className="text-[10px] text-navy font-bold shrink-0">{art.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
