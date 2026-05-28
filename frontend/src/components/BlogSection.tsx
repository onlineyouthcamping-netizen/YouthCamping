"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { WavyEdges } from "./ui/WavyEdges";

interface BlogItem {
  title: string;
  author: string;
  authorImage?: string;
  readTime: string;
  image: string;
  status: string;
  slug?: string;
  content: string;
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

  const scrollRight = () => {
    const el = document.getElementById('blog-slider-container');
    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section className="section-wrapper bg-transparent overflow-hidden relative">
      {wavyEdges && <WavyEdges color={topColor} position="top" />}
      <div className="max-w-[1440px] mx-auto relative">
        <div className="flex flex-col mb-12">
          {topLabel && (
            <span className="section-label">
              {topLabel}
            </span>
          )}
          <div className={cn(
            titleStyle === 'boxed' && "p-6 md:px-10 md:py-8 rounded-[20px] md:rounded-[32px] border border-slate-200 bg-white shadow-sm max-w-fit"
          )}>
            <h2 className="section-heading text-navy capitalize">
              {title}
            </h2>
          </div>
        </div>

        <div className="relative group">
          <div 
            id="blog-slider-container"
            className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x scroll-smooth"
          >
            {displayBlogs.map((art, i) => (
              <BlogCard key={art.slug || i} art={art} i={i} />
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

function BlogCard({ art, i }: { art: BlogItem, i: number }) {
  const isVideo = art.content.includes('youtube.com') || art.content.includes('youtu.be') || art.content.includes('iframe');
  const linkPath = isVideo ? `/watch/${art.slug}` : `/read/${art.slug}`;

  const initials = art.author ? art.author.charAt(0).toUpperCase() : "Y";
  const getAvatarColor = (name: string) => {
    const colors = ["#E87A00", "#5C6BC0", "#4CAF50", "#E91E63", "#00BCD4"];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };
  const avatarBg = getAvatarColor(art.author);

  // Strip HTML for snippet
  const snippet = art.content.replace(/<[^>]*>/g, '').slice(0, 80) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
      viewport={{ once: true }}
      className="flex-none snap-start bg-white border border-zinc-50 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden group/card"
      style={{ width: '380px', height: '450px', minWidth: '380px', minHeight: '450px' }}
    >
      <Link href={linkPath} className="flex flex-col h-full w-full text-left">
        {/* Top Image Area */}
        <div 
          className="relative w-full bg-zinc-100 overflow-hidden group"
          style={{ height: '220px', minHeight: '220px' }}
        >
          <OptimizedImage 
            src={normalizeImageUrl(art.image) || "https://images.unsplash.com/photo-1597037750734-450f6f406560"} 
            alt={art.title} 
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
