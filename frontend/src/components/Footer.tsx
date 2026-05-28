"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  companyName?: string;
  cin?: string;
}

const footerSections = [
  {
    title: "International Trips",
    links: ["Europe", "Bali", "Vietnam", "Thailand", "Kazakhstan", "Singapore", "Bhutan", "Maldives", "Dubai", "Malaysia"]
  },
  {
    title: "India Trips",
    links: ["Ladakh", "Spiti Valley", "Meghalaya", "Kashmir", "Himachal Pradesh", "Andaman", "Kerala", "Rajasthan", "Nagaland"]
  },
  {
    title: "YouthCamping Special",
    links: ["Community Trips", "Honeymoon Trips", "Corporate Trips", "Weekend Getaways"]
  },
  {
    title: "Quick Links",
    links: ["About Us", "Privacy Policy", "Terms & Conditions", "Customer Success & Support", "Disclaimer", "Careers", "Blogs", "Payments"]
  }
];

export default function Footer({ 
  logoUrl,
  address = "Money Plant High Street, A 738, Jagatpur Rd, Gota, Ahmedabad, Gujarat 382470",
  phone = "+91-99242 46267",
  email = "info@youthcamping.com",
  website = "youthcamping.in",
  companyName = "YOUTHCAMPING EXPERIENCES PVT LTD",
  cin = "CIN-U12345GJ2026PTC987654"
}: FooterProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const brandName = companyName.split(' ')[0];
  const specialSectionTitle = `${brandName} Special`;

  return (
    <footer className="bg-[#0F1820] text-white pt-20 relative overflow-hidden flex flex-col items-center text-center font-montserrat border-t border-white/5">
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Top Links Grid (Desktop) */}
        <div className="w-full hidden md:grid grid-cols-4 gap-8 text-left mb-16 border-b border-white/10 pb-16">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-white font-bold text-[15px] mb-3 tracking-wide">
                {section.title === "YouthCamping Special" ? specialSectionTitle : section.title}
              </h3>
              {section.links.map((link) => (
                <Link 
                  key={link} 
                  href={section.title === "Quick Links" ? `/${link.toLowerCase().replace(/\s+/g, '-')}` : "/trips"} 
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Accordions (Mobile) */}
        <div className="w-full flex flex-col md:hidden mb-12 border-t border-white/10">
          {footerSections.map((section, idx) => {
            const isOpen = openSection === idx;
            const displayTitle = section.title === "YouthCamping Special" ? specialSectionTitle : section.title;
            return (
              <div key={idx} className="w-full border-b border-white/10">
                <button
                  onClick={() => toggleSection(idx)}
                  className="w-full flex items-center justify-between py-4 text-left font-bold text-white text-[15px] tracking-wide focus:outline-none"
                >
                  <span>{displayTitle}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
                
                {/* Accordion Content Container */}
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 flex flex-col gap-3 text-left pl-2",
                    isOpen ? "max-h-[400px] pb-6" : "max-h-0"
                  )}
                >
                  {section.links.map((link) => (
                    <Link 
                      key={link} 
                      href={section.title === "Quick Links" ? `/${link.toLowerCase().replace(/\s+/g, '-')}` : "/trips"} 
                      className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Company Name & Details */}
        <div className="flex flex-col items-center mb-6 px-4">
          <h2 className="text-base md:text-lg font-bold tracking-widest text-white mb-3 uppercase">{brandName}</h2>
          <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-md text-center">
            {address}
          </p>
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-8 text-zinc-400 text-[12px] md:text-[13px] font-medium tracking-wide max-w-xl px-6 text-center leading-relaxed">
          <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
          <span className="text-white/10">•</span>
          <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
          <span className="text-white/10">•</span>
          <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{website}</a>
        </div>

        {/* Social Pill Container */}
        <div className="bg-[#1E293B]/40 border border-white/5 rounded-[32px] px-8 py-3 flex items-center gap-6 mb-12 shadow-2xl">
          <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1877F2]" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#E4405F]" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#FF0000]" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>

        {/* One Trip At A Time Branding Slogan */}
        <div className="mb-10 select-none pointer-events-none opacity-45">
          <p className="font-montserrat font-light text-[10px] md:text-[12px] tracking-[0.25em] uppercase text-white/80">
            One Trip At A Time.
          </p>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div 
        className="w-full border-t border-white/10 mt-auto"
        style={{ backgroundColor: '#090F14' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative">
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} {brandName.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
          
          {/* Scroll to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-9 h-9 rounded-full bg-[#1E293B]/60 border border-white/10 flex items-center justify-center text-white hover:bg-primary-orange hover:text-white transition-all shadow-lg active:scale-95 shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
