"use client";

import { useState } from "react";

import Link from "next/link";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface HighlightItem {
  name: string;
  description?: string;
  image: string;
  slug: string;
  order?: number;
}

interface TripHighlightsListProps {
  title: string;
  items?: HighlightItem[];
  defaultItems?: any[];
}

export default function TripHighlightsList({ title, items, defaultItems = [] }: TripHighlightsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeList = (items && items.length > 0) ? items : defaultItems;
  const displayedItems = isExpanded ? activeList : activeList.slice(0, 4);

  if (activeList.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="bg-white border border-zinc-100 rounded-[40px] p-10 md:p-14 shadow-sm relative">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-navy">{title}</h2>
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="px-6 py-2 border border-zinc-200 rounded-xl text-[10px] font-bold capitalize tracking-widest text-zinc-400 hover:bg-zinc-50 transition-all"
            >
              Collapse All
            </button>
          )}
        </div>
        
        <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-x-auto pb-6 md:pb-0 scroll-mt-32 no-scrollbar">
          {displayedItems.map((item, i) => {
            const name = item.name || (item as any).title || "Highlight";
            const imageUrl = item.image || (item as any).img || (item as any).url || "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6";
            const slug = item.slug || (item as any).id || i.toString();
            
            return (
              <Link 
                key={i} 
                href={
                  title.toLowerCase().includes('attractions') 
                  ? `/attractions/${slug}` 
                  : title.toLowerCase().includes('activities') || title.toLowerCase().includes('highlights')
                  ? `/blogs/${slug}`
                  : `/blogs/${slug}`
                } 
                className="group cursor-pointer shrink-0 w-[260px] md:w-auto"
              >
                <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4 shadow-md">
                  <OptimizedImage 
                    src={normalizeImageUrl(imageUrl) || "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6"} 
                    alt={name} 
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-bold text-navy text-sm mb-1">{name}</h3>
                <p className="text-[10px] text-zinc-400 font-medium line-clamp-2">{item.description || (item as any).desc}</p>
              </Link>
            );
          })}
        </div>

        {!isExpanded && activeList.length > 4 && (
          <div className="flex justify-center">
            <button 
              onClick={() => setIsExpanded(true)}
              className="px-10 py-4 border border-zinc-200 rounded-2xl text-[10px] font-bold capitalize tracking-widest text-zinc-400 hover:bg-zinc-50 transition-all hover:scale-105"
            >
              View All {title}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
