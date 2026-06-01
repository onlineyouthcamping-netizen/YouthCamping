"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useTheme } from "@/components/DynamicThemeProvider";

import { useIsMobile } from "@/hooks/useIsMobile";

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
    <span className="text-primary-orange" style={{ display: 'inline-block', minHeight: '1.2em' }}>{text || "\u00A0"}</span>
  );
}

interface HeroProps {
  headline?: string;
  subheadline?: string;
  videoUrl?: string;
  backgroundImage?: string;
  titleSize?: string | number;
  titleWeight?: string | number;
  settings?: any;
  videoEnabled?: boolean;
  videoPosterUrl?: string;
}

export default function Hero({ 
  headline = "One Trip At a Time",
  subheadline,
  videoUrl,
  backgroundImage,
  titleSize,
  titleWeight,
  settings,
  videoEnabled,
  videoPosterUrl,
}: HeroProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const [playClicked, setPlayClicked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const normalizedBg = normalizeImageUrl(backgroundImage);
  
  const selfHostedEnabled = !!((settings?.heroVideoEnabled && settings?.heroVideoUrl) || (videoEnabled && videoUrl && !videoUrl.includes('youtube') && !videoUrl.includes('youtu.be')));
  
  const resolvedVideoUrl = (settings?.heroVideoEnabled && settings?.heroVideoUrl) 
    ? settings.heroVideoUrl 
    : (videoEnabled && videoUrl && !videoUrl.includes('youtube') && !videoUrl.includes('youtu.be') ? videoUrl : "");
    
  const resolvedPosterUrl = (settings?.heroVideoEnabled && settings?.heroVideoPosterUrl) 
    ? settings.heroVideoPosterUrl 
    : (videoPosterUrl || normalizedBg);
  
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

  const mobileVideoHeight = theme?.mobileHeroVideoHeight || 'aspect-video';
  const isCustomVideoSize = selfHostedEnabled && mobileVideoHeight !== 'aspect-video';
  const reduceMotion = prefersReducedMotion || isMobile;

  return (
    <div 
      className={`hero-container relative w-full overflow-hidden bg-navy ${
        selfHostedEnabled ? 'hero-has-video' : ''
      } ${
        isCustomVideoSize ? 'video-custom-size' : 'max-md:aspect-video'
      }`}
      style={{ 
        transform: 'scale(1.001)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        aspectRatio: '16/9',
        minHeight: '100svh',
      }}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0" style={{ transform: 'scale(1.01)', backfaceVisibility: 'hidden' }}>
        {selfHostedEnabled && resolvedVideoUrl ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Poster image always underneath and visible until video is ready */}
            {resolvedPosterUrl && !videoLoaded && (
              <OptimizedImage
                src={resolvedPosterUrl}
                priority={true}
                cloudinaryWidth={1920}
                className="w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-500"
                alt="Hero Background Poster"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            )}
            
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={() => setVideoLoaded(true)}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src={resolvedVideoUrl} type="video/mp4" />
            </video>
          </div>
        ) : normalizedBg ? (
          <OptimizedImage 
            src={normalizedBg} 
            priority={true}
            cloudinaryWidth={1920}
            className="w-full h-full object-cover" 
            alt="Hero Background"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy via-charcoal to-navy" />
        )}
        
        {/* Subtle Premium Dark Overlay (Capped at 15-25% to showcase vibrant natural colors) */}
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-700" 
          style={{ 
            opacity: overlayOpacity != null 
              ? Math.min(overlayOpacity, 0.25) 
              : 0.20 
          }} 
        />
      </div>

      <div className={`absolute inset-0 z-10 flex flex-col justify-center px-4 py-3 md:px-10 md:py-8 text-white max-md:items-center max-md:text-center ${alignClass}`}>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title mb-3 md:mb-8"
            style={{ 
              ['--title-size-desktop' as any]: titleSize 
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
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.5, duration: 1 }}
            className="flex items-center justify-center font-medium mt-2 md:mt-6 hero-subheadline"
            style={{ 
              ['--subheadline-size-desktop' as any]: 'clamp(1rem, 2.5vw, 1.875rem)'
            }}
          >
            <Typewriter phrases={typingPhrases} />
            <span className="font-light opacity-80 animate-pulse ml-2 text-primary-orange">|</span>
          </motion.div>
        )}

        {ctaText && ctaLink && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 1, duration: 0.8 }}
            className="mt-2.5 md:mt-8"
          >
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 md:px-8 md:py-4 bg-primary-orange text-white font-semibold rounded-lg hover:opacity-90 transition-opacity hero-btn"
              style={{
                ['--btn-padding' as any]: `var(--button-padding-y) var(--button-padding-x)`,
                ['--btn-font-size' as any]: 'var(--button-font-size)',
                borderRadius: 'var(--radius-button)',
                textTransform: 'var(--button-text-transform)' as any,
                letterSpacing: 'var(--button-letter-spacing)',
              }}
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div></div>
  );
}
