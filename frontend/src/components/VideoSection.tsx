"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface VideoSectionProps {
  title?: string;
  subtitle?: string;
  videos?: { id: string; title: string }[];
}

const VIDEOS = [
  { 
    id: "j6hb-iOZalE", 
    title: "Spiti Valley - A Cinematic Journey", 
    channel: "YouthCamping Official" 
  },
  { 
    id: "8XJ9kU4WJTo", 
    title: "Winter Spiti in 4K", 
    channel: "Mountain Souls" 
  },
  { 
    id: "X2X5nC5yC6w", 
    title: "What to Carry for Spiti Expedition", 
    channel: "Gear Guide" 
  },
  { 
    id: "r7PzL7H8T8A", 
    title: "Culture and People of Spiti", 
    channel: "Himalayan Stories" 
  },
];

export default function VideoSection({ 
  title = "Videos", 
  subtitle = "Exclusive footage from our expeditions",
  videos 
}: VideoSectionProps) {
  const activeVideos = (videos && videos.length > 0) ? videos : VIDEOS;
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <>
      <section className="py-16 bg-[#E5E8EB] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-navy capitalize tracking-tighter">{title}</h2>
            <p className="text-zinc-500 font-bold mt-2 tracking-widest text-[10px] capitalize">{subtitle}</p>
          </div>

          <div className="relative group">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-10 no-scrollbar">
              {activeVideos.map((video, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveVideoId(video.id)}
                  className="flex-shrink-0 w-[280px] md:w-[400px] cursor-pointer group/video active:scale-[0.98] transition-transform"
                >
                  <div className="relative aspect-video rounded-[20px] md:rounded-[32px] overflow-hidden mb-4 shadow-xl border border-zinc-100">
                    <OptimizedImage 
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title} className="object-cover transition-transform duration-700 group-hover/video:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/video:bg-black/10 transition-colors" />
                    
                    {/* YouTube Style Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-10 md:w-16 md:h-12 bg-[#FF0000] rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover/video:scale-110 shadow-2xl">
                         <Play className="w-5 h-5 md:w-6 md:h-6 -current" />
                      </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent">
                       <p className="text-[11px] md:text-xs font-bold text-white line-clamp-1">{video.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20"
            onClick={() => setActiveVideoId(null)}
          >
            <button 
              onClick={() => setActiveVideoId(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-10 p-2"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl md:rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,87,34,0.2)] border-2 md:border-4 border-white/10"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
