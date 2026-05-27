"use client";

import Hero from "./Hero";
import SocialProofBar from "./SocialProofBar";
import CommunityTrips from "./CommunityTrips";
import BestieSection from "./BestieSection";
import RealitySection from "./RealitySection";
import Destinations from "./Destinations";
import BlogSection from "./BlogSection";
import ReviewsSection from "./ReviewsSection";
import VibeSection from "./VibeSection";
import CTABanner from "./CTABanner";
import PhotoGrid from "./PhotoGrid";
import ImageGallery from "./ImageGallery";
import VideoSection from "./VideoSection";
import CTASlider from "./CTASlider";
import CinematicBanner from "./CinematicBanner";
import PhotoSlider from "./PhotoSlider";

import { Trip, Review, Blog } from "@/types";

interface PageRendererProps {
  sections: any[];
  trips?: Trip[];
  reviews?: Review[];
  blogs?: Blog[];
}

export default function PageRenderer({ sections = [], trips = [], reviews = [], blogs = [] }: PageRendererProps) {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <div className="flex flex-col">
      {sections.map((section, index) => {
        const { type, data, visible } = section;
        
        if (visible === false) return null;

        const getBgColor = (idx: number) => {
          const s = sections[idx];
          if (!s || s.visible === false) return '#ffffff';
          if (['hero', 'cta_banner', 'cinematic_banner'].includes(s.type)) return 'transparent';
          if (s.type === 'destinations') return '#ffffff';
          
          const patterns = ['#ffffff', '#f2f2f2'];
          return patterns[idx % patterns.length];
        };

        const renderSection = () => {
          const prevBg = index > 0 ? getBgColor(index - 1) : '#ffffff';
          const nextBg = index < sections.length - 1 ? getBgColor(index + 1) : '#ffffff';
          const commonProps = { 
            topColor: prevBg, 
            bottomColor: nextBg,
            ...data 
          };

          switch (type) {
            case 'hero':
              return <Hero key={index} {...commonProps} />;
            case 'social_proof':
              return <SocialProofBar key={index} {...commonProps} />;
            case 'trips':
            case 'upcoming_trips':
            case 'featured_trips':
            case 'trending_trips':
              return <CommunityTrips key={index} trips={trips} {...commonProps} />;
            case 'bestie':
              return <BestieSection key={index} {...commonProps} />;
            case 'destinations':
              return <Destinations key={index} {...commonProps} />;
            case 'reality':
              return <RealitySection key={index} {...commonProps} />;
            case 'blogs':
            case 'journal':
              return <BlogSection key={index} blogs={blogs} {...commonProps} />;
            case 'reviews':
              return <ReviewsSection key={index} reviews={reviews} {...commonProps} />;
            case 'vibe':
              return <VibeSection key={index} {...commonProps} />;
            case 'cta_banner':
              return <CTABanner key={index} {...commonProps} />;
            case 'photo_grid':
              return <PhotoGrid key={index} {...commonProps} />;
            case 'image_gallery':
              return <ImageGallery key={index} {...commonProps} />;
            case 'cta_slider':
              return <CTASlider key={index} {...commonProps} />;
            case 'cinematic_banner':
              return <CinematicBanner key={index} {...commonProps} />;
            case 'photo_slider':
              return <PhotoSlider key={index} {...commonProps} />;
            case 'video_section':
              return <VideoSection key={index} {...commonProps} />;
            case 'rich_text':
              return (
                <div key={index} className="max-w-4xl mx-auto px-6 py-20">
                  {data.title && (
                    <h2 className="text-3xl md:text-4xl font-black mb-12 uppercase tracking-tighter text-[#ff4e00]">
                      {data.title}
                    </h2>
                  )}
                  <div 
                    className="rich-content prose prose-stone prose-lg max-w-none 
                               prose-headings:text-[#ff4e00] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                               prose-p:text-gray-700 prose-p:leading-relaxed 
                               prose-strong:text-gray-900 prose-strong:font-black
                               prose-li:text-gray-700
                               prose-h1:text-4xl prose-h1:mb-8
                               prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                               prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4" 
                    dangerouslySetInnerHTML={{ __html: data.body || '' }} 
                  />
                </div>
              );
            default:
              return null;
          }
        };

        const getBackgroundClass = (idx: number) => {
          if (['hero', 'cta_banner', 'cinematic_banner'].includes(type)) return 'bg-transparent';
          if (type === 'destinations') return 'bg-[#ffffff]';
          
          // Split background for CTA Slider to merge with gray sections below
          if (type === 'cta_slider') {
            return 'bg-gradient-to-b from-white from-50% to-[#f2f2f2] to-50%';
          }
          
          const patterns = ['bg-[#ffffff]', 'bg-[#f2f2f2]'];
          return patterns[idx % patterns.length];
        };

        return (
          <div key={index} className={`${getBackgroundClass(index)} transition-colors duration-500`}>
            {renderSection()}
          </div>
        );
      })}
    </div>
  );
}
