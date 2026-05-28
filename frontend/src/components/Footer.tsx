"use client";

import Link from "next/link";


interface FooterProps {
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  companyName?: string;
  cin?: string;
}

const footerLinks = {
  column1: ["Europe", "Bali", "Vietnam", "Thailand", "Kazakhstan", "Singapore", "Bhutan", "Maldives", "Dubai", "Malaysia"],
  column2: ["Ladakh", "Spiti Valley", "Meghalaya", "Kashmir", "Himachal Pradesh", "Andaman", "Kerala", "Rajasthan", "Nagaland"],
  column3: ["Community Trips", "Honeymoon Trips", "Corporate Trips", "Weekend Getaways"],
  column4: ["About Us", "Privacy Policy", "Terms & Conditions", "Customer Success & Support", "Pillar Sitemap", "Blog Sitemap", "Trip Sitemap", "Disclaimer", "Careers", "Blogs", "Payments", "Investor Relations"]
};

export default function Footer({ 
  logoUrl,
  address = "Money Plant High Street, A 738, Jagatpur Rd, Gota, Ahmedabad, Gujarat 382470",
  phone = "+91-99242 46267",
  email = "hello@youthcamping.com",
  website = "www.youthcamping.com",
  companyName = "YOUTHCAMPING EXPERIENCES PVT LTD",
  cin = "CIN-U12345GJ2026PTC987654"
}: FooterProps) {
  return (
    <footer className="bg-[#111827] text-white pt-20 relative overflow-hidden flex flex-col items-center text-center font-montserrat">
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Top Links Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 text-left mb-16 border-b border-white/10 pb-16">
          <div className="flex flex-col gap-3">
            {footerLinks.column1.map((link) => (
              <Link key={link} href="/trips" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{link}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {footerLinks.column2.map((link) => (
              <Link key={link} href="/trips" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{link}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {footerLinks.column3.map((link) => (
              <Link key={link} href="/trips" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{link}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {footerLinks.column4.map((link) => (
              <Link key={link} href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{link}</Link>
            ))}
          </div>
        </div>

        {/* Company Name & Details */}
        <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-wide">{companyName}</h2>
        <p className="text-zinc-400 text-sm font-medium mb-4">{cin}</p>
        <p className="text-zinc-300 text-[15px] font-medium mb-8 max-w-2xl mx-auto">
          {address}
        </p>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-10 text-zinc-300 text-[15px] font-medium">
          <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
          <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
          <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{website}</a>
        </div>

        {/* Social Pill Container */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-6 mb-24">
          <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>

      {/* Skyline Image */}
      <div className="w-full relative z-10 flex flex-col items-center mt-auto">
        {/* Placeholder for the skyline. In production, this would be an SVG or PNG of a skyline */}
        <div 
          className="w-full h-16 md:h-24 bg-repeat-x bg-bottom pointer-events-none opacity-80"
          style={{ 
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/City_skyline_silhouette_icon.svg/1024px-City_skyline_silhouette_icon.svg.png')`,
            backgroundSize: 'auto 100%',
            filter: 'invert(1) opacity(0.8)'
          }}
        />
        
        {/* Bottom Bar */}
        <div className="w-full border-t border-white/20">
          <div className="max-w-5xl mx-auto px-6 py-6 text-center">
            <p className="text-zinc-400 text-sm font-medium tracking-wide">
              © {new Date().getFullYear()} {companyName}, All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
