"use client";

import { useState, useEffect, useRef } from "react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

interface CTASliderProps {
  title?: string;
  showTitle?: boolean;
  videoUrl?: string;
  videoPosterUrl?: string;
  borderRadius?: string;
  topColor?: string;
  bottomColor?: string;
}

export default function CTASlider({
  title = "",
  showTitle = false,
  videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-a-mountain-road-41916-large.mp4",
  videoPosterUrl = "https://images.unsplash.com/photo-1581793745862-99f579601e1b?q=80&w=2070",
  borderRadius = "rounded-[20px] md:rounded-[32px]",
  topColor = "#ffffff",
  bottomColor = "#f4f4f5",
}: CTASliderProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Preload when video is 200px close to entering viewport
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  const posterSrc = videoPosterUrl ? normalizeImageUrl(videoPosterUrl) : undefined;
  const normalizedVideoUrl = videoUrl ? normalizeImageUrl(videoUrl) : undefined;

  // Map admin custom values or handle direct tailwind class strings
  const radiusClass = borderRadius || "rounded-[20px] md:rounded-[32px]";

  return (
    <section 
      className="relative py-6 md:py-10 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${topColor} 0%, ${topColor} 50%, ${bottomColor} 50%, ${bottomColor} 100%)`
      }}
    >
      {showTitle && title && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-20 mb-6 md:mb-10 text-center">
          <h2 className="section-heading text-navy capitalize">
            {title}
          </h2>
        </div>
      )}
      <div className="max-w-[1440px] mx-auto px-4 md:px-20">
        <div 
          ref={containerRef}
          className={cn(
            "relative w-full max-w-[1200px] aspect-[21/9] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-zinc-900 border border-zinc-200/20 mx-auto",
            radiusClass
          )}
        >
          {isInView ? (
            <video
              src={normalizedVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-a-mountain-road-41916-large.mp4"}
              autoPlay
              muted
              loop
              playsInline
              poster={posterSrc}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            posterSrc && (
              <OptimizedImage
                src={posterSrc}
                alt={title || "Cinematic Travel Video"}
                cloudinaryWidth={1200}
                className="w-full h-full object-cover object-center"
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
