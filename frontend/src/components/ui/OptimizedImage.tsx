'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  fallbackSrc = '/logo.png', 
  className = '', 
  priority,
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorObj, setErrorObj] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  // 1. Validation and Normalization (Synchronous)
  let finalSrc = src;

  if (!finalSrc || typeof finalSrc !== 'string') {
    finalSrc = fallbackSrc;
  } else if (finalSrc.startsWith('/uploads/')) {
    finalSrc = fallbackSrc; // Block local /uploads/
  } else if (finalSrc.includes('unsplash.com') && !finalSrc.startsWith('https://')) {
    finalSrc = fallbackSrc; // Block incomplete unsplash
  } else if (!finalSrc.startsWith('http') && !finalSrc.startsWith('/')) {
    finalSrc = fallbackSrc; // Block invalid URLs
  } else if (finalSrc.includes('res.cloudinary.com')) {
    // 2. Cloudinary Optimization
    const uploadIndex = finalSrc.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const before = finalSrc.substring(0, uploadIndex + 8);
      const after = finalSrc.substring(uploadIndex + 8);
      if (!finalSrc.includes('f_auto') || !finalSrc.includes('q_auto')) {
        finalSrc = `${before}f_auto,q_auto,w_1200,c_limit/${after}`;
      }
    }
  }

  const currentSrc = errorObj ? fallbackSrc : finalSrc;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn(
        "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => { setErrorObj(true); setIsLoaded(true); }}
      {...props}
    />
  );
}
