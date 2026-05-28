"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutTripProps {
  description: string;
}

export default function AboutTrip({ description }: AboutTripProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Truncate text for preview
  const previewText = description.length > 280 
    ? description.substring(0, 280) + "..." 
    : description;

  return (
    <section className="mb-24 relative">
      <h2 className="text-3xl font-semibold text-navy mb-6">About this Trip</h2>
      <div className="relative">
        <p className="text-zinc-600 font-normal leading-relaxed text-lg italic">
          {previewText}
        </p>
        {description.length > 280 && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-zinc-400 font-medium hover:text-primary-orange transition-all mt-4 float-right"
          >
            Read More
          </button>
        )}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-24 bg-navy/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-full overflow-y-auto rounded-[40px] p-10 md:p-20 shadow-2xl relative animate-scale-up">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-3 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all"
            >
              <X className="w-6 h-6 text-navy" />
            </button>
            
            <h2 className="text-3xl font-semibold text-navy mb-10 capitalize tracking-tight">The Full Story</h2>
            <div className="prose prose-zinc lg:prose-xl max-w-none text-zinc-600 font-normal leading-relaxed italic">
              {description}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
