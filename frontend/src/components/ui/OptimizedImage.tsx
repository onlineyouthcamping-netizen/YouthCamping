'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  priority?: boolean;
  /** Cloudinary width transform — default 1200. Use 800 for cards, 400 for thumbnails. */
  cloudinaryWidth?: number;
}

export function OptimizedImage({ 
  src, 
  alt, 
  fallbackSrc = '/logo.png', 
  className = '', 
  priority,
  cloudinaryWidth,
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(priority ? true : false);
  const [errorObj, setErrorObj] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsLoaded(true);
    } else if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src, priority]);

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
  }

  let srcSet: string | undefined = undefined;

  const isCloudinary = finalSrc && finalSrc.includes('res.cloudinary.com');
  const isUnsplash = finalSrc && finalSrc.includes('images.unsplash.com');
  const hasCloudinaryWidth = cloudinaryWidth !== undefined;

  if (isUnsplash && hasCloudinaryWidth) {
    const cloudName = "ddkndagvp";
    const baseFetch = `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,c_limit`;
    const cleanUrl = finalSrc;
    
    // Form fetch url
    finalSrc = `${baseFetch},w_${cloudinaryWidth}/${cleanUrl}`;
    
    const widths = [320, 480, 640, 800, 1200];
    srcSet = widths
      .map(w => `${baseFetch},w_${w}/${cleanUrl} ${w}w`)
      .join(', ');
  } else if (isCloudinary && !finalSrc.includes('w_') && hasCloudinaryWidth) {
    const uploadIndex = finalSrc.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const before = finalSrc.substring(0, uploadIndex + 8);
      const after = finalSrc.substring(uploadIndex + 8);
      const template = `${before}f_auto,q_auto,w_1200,c_limit/${after}`.replace(/([^:]\/)\/+/g, "$1");
      
      finalSrc = template.replace(/w_\d+/, `w_${cloudinaryWidth}`);
      
      const widths = [320, 480, 640, 800, 1200];
      srcSet = widths
        .map(w => `${template.replace(/w_\d+/, `w_${w}`)} ${w}w`)
        .join(', ');
    }
  }

  const currentSrc = errorObj ? fallbackSrc : finalSrc;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={srcSet}
      sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
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
