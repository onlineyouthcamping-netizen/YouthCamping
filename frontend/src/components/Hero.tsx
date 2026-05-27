"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// Custom Typewriter Component
function Typewriter({ phrases, typingSpeed = 100, deletingSpeed = 50, pauseDelay = 2000 }: { phrases: string[], typingSpeed?: number, deletingSpeed?: number, pauseDelay?: number }) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeedState, setTypingSpeedState] = useState(typingSpeed);

  useEffect(() => {
    if (phrases.length === 0) return;

    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i].trim();

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeedState(isDeleting ? deletingSpeed : typingSpeed);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), pauseDelay);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeedState);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed, deletingSpeed, pauseDelay, typingSpeedState]);

  return (
    <span className="text-primary-orange">{text}</span>
  );
}

interface HeroProps {
  headline?: string;
  subheadline?: string;
  videoUrl?: string;
  backgroundImage?: string;
  titleSize?: string | number;
  titleWeight?: string | number;
}

export default function Hero({ 
  headline = "Every great story starts with someone who decided to go.",
  subheadline = "10,000+ travelers. Trusted since 2019. Government registered.",
  videoUrl,
  backgroundImage,
  titleSize,
  titleWeight,
}: HeroProps) {
  const hasVideo = videoUrl && videoUrl.trim() !== "" && videoUrl.includes("http");
  const normalizedBg = normalizeImageUrl(backgroundImage);
  
  // Parse subheadline as comma-separated phrases for typing effect
  const typingPhrases = subheadline ? subheadline.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

  return (
    <div className="relative w-full h-[56.25vw] md:h-screen overflow-hidden bg-navy">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {hasVideo ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <iframe
              className="w-full aspect-video md:w-[115%] md:h-[115%] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 opacity-60"
              src={`${videoUrl.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
              title="Hero Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        ) : normalizedBg ? (
          <OptimizedImage 
            src={normalizedBg} 
            className="w-full h-full object-cover" 
            alt="Hero Background"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy via-charcoal to-navy" />
        )}
        
        {/* Dynamic Overlay */}
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-700" />
      </div>

      {/* Content Over the Frame */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-white mt-10 md:mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[84px] font-black tracking-tight mb-6 drop-shadow-2xl leading-[1.1] md:leading-[1.05]"
            style={{ 
              fontSize: titleSize ? (isNaN(Number(titleSize)) ? titleSize : `${titleSize}px`) : undefined,
              fontWeight: titleWeight || undefined
            }}
          >
            {headline}
          </motion.h1>

        {typingPhrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center justify-center text-3xl md:text-5xl lg:text-7xl font-bold mt-4"
          >
            <Typewriter phrases={typingPhrases} />
            <span className="font-light opacity-80 animate-pulse ml-2 text-white">|</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
