"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/DynamicThemeProvider";

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
  headline = "One Trip At a Time",
  subheadline,
  videoUrl,
  backgroundImage,
  titleSize,
  titleWeight,
}: HeroProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasVideo = videoUrl && videoUrl.trim() !== "" && videoUrl.includes("http");
  const normalizedBg = normalizeImageUrl(backgroundImage);
  
  // Theme-driven animated texts with hardcoded fallback
  const defaultPhrases = [
    "Find Freedom",
    "Collect Stories",
    "Meet Strangers",
    "Feel Alive",
    "Escape Routines",
    "Explore Deeply"
  ];
  const typingPhrases: string[] = theme?.heroAnimatedTexts?.length
    ? theme.heroAnimatedTexts
    : defaultPhrases;

  // Props override theme, theme overrides defaults
  const resolvedHeadline = headline !== "One Trip At a Time" ? headline : (theme?.heroTitle || headline);
  const displayHeadline = !resolvedHeadline || resolvedHeadline === "Every great story starts with someone who decided to go." || resolvedHeadline === "Global Community of Travelers"
    ? "One Trip At a Time"
    : resolvedHeadline;

  // Hero overlay: theme value (0-100) converted to 0-1 opacity, CSS var as fallback
  const overlayOpacity = theme?.heroOverlayDarkness != null
    ? theme.heroOverlayDarkness / 100
    : undefined;

  // CTA from theme
  const ctaText = theme?.heroCtaText;
  const ctaLink = theme?.heroCtaLink;

  // Alignment from theme (default: center)
  const heroAlign = theme?.heroAlign || "center";
  const alignClass = heroAlign === "left" ? "items-start text-left" : heroAlign === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <div 
      className="hero-container relative w-full overflow-hidden bg-navy" 
      style={{ 
        height: 'var(--hero-height)', 
        minHeight: '400px',
        transform: 'scale(1.001)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0" style={{ transform: 'scale(1.01)', backfaceVisibility: 'hidden' }}>
        {hasVideo ? (
          <div className="hero-video-wrapper">
            <iframe
              className="hero-video-iframe opacity-60"
              src={`${videoUrl.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
              title="Hero Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        ) : normalizedBg ? (
          <OptimizedImage 
            src={normalizedBg} 
            className="w-full h-full object-cover" 
            alt="Hero Background"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy via-charcoal to-navy" />
        )}
        
        {/* Dynamic Overlay */}
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-700" style={overlayOpacity != null ? { opacity: overlayOpacity } : undefined} />
      </div>

      {/* Content Over the Frame — identical layout desktop & mobile, proportionally scaled */}
      <div className={`absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-10 py-8 text-white ${alignClass}`}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title mb-4 md:mb-8"
            style={{ 
              fontSize: titleSize 
                ? (isNaN(Number(titleSize)) 
                    ? `calc(var(--title-size-multiplier, 1) * ${titleSize})` 
                    : `calc(var(--title-size-multiplier, 1) * ${titleSize}px)`) 
                : undefined,
              fontWeight: titleWeight || undefined
            }}
          >
            {displayHeadline}
          </motion.h1>

        {typingPhrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center justify-center font-medium mt-3 md:mt-6"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.875rem)' }}
          >
            <Typewriter phrases={typingPhrases} />
            <span className="font-light opacity-80 animate-pulse ml-2 text-primary-orange">|</span>
          </motion.div>
        )}

        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-6 md:mt-8"
          >
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-primary-orange text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
              style={{
                padding: `var(--button-padding-y) var(--button-padding-x)`,
                borderRadius: 'var(--radius-button)',
                textTransform: 'var(--button-text-transform)' as any,
                letterSpacing: 'var(--button-letter-spacing)',
                fontSize: 'var(--button-font-size)',
              }}
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
