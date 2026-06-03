"use client";

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
  const activeList = (items && items.length > 0) ? items : defaultItems;

  if (activeList.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="bg-white border border-zinc-100 rounded-[40px] p-10 md:p-14 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-navy">{title}</h2>
        </div>
        
        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-6 md:gap-8 no-scrollbar scroll-smooth">
          {activeList.map((item, i) => {
            const isString = typeof item === "string";
            const name = isString ? item : ((item as any).name || (item as any).title || "Highlight");
            const imageUrl = isString ? "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6" : ((item as any).image || (item as any).img || (item as any).url || "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6");
            const slug = isString ? i.toString() : ((item as any).slug || (item as any).id || i.toString());
            const desc = isString ? "" : ((item as any).description || (item as any).desc || "");
            
            const isClickable = title.toLowerCase().includes('attractions') || title.toLowerCase().includes('activities');
            
            const cardContent = (
              <>
                <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4 shadow-sm bg-zinc-50 border border-zinc-100">
                  <OptimizedImage 
                     src={normalizeImageUrl(imageUrl) || "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6"} 
                     alt={name} 
                     loading="lazy"
                     className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-bold text-navy text-sm mb-1 line-clamp-1">{name}</h3>
                {desc && <p className="text-[10px] text-zinc-400 font-medium line-clamp-2 leading-relaxed">{desc}</p>}
              </>
            );

            const cardClass = "group shrink-0 w-[240px] md:w-[280px] select-none";

            if (isClickable) {
              return (
                <Link 
                  key={i} 
                  href={
                    title.toLowerCase().includes('attractions') 
                    ? `/attractions/${slug}` 
                    : `/blogs/${slug}`
                  } 
                  className={cardClass}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div 
                key={i} 
                className={cardClass}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
