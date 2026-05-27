"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface FooterProps {
  logoUrl?: string;
  address?: string;
  phone?: string;
}

export default function Footer({ 
  logoUrl = "/footer-logo.png",
  address = "Money Plant High Street, A 738, Jagatpur Rd, Gota, Ahmedabad, Gujarat 382470",
  phone = "99242 46267"
}: FooterProps) {
  return (
    <footer className="bg-[#2C2C2C] text-white pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand & Contact */}
          <div className="md:col-span-5">
            <Link href="/" className="block mb-8">
              <OptimizedImage 
                src={logoUrl} 
                alt="Avian Experiences" 
                width={320} 
                height={100} 
                className="h-24 w-auto object-contain" 
              />
            </Link>
            
            <div className="space-y-6 max-w-sm">
              <div className="flex gap-4 items-start">
                <MapPin className="w-6 h-6 text-white shrink-0 mt-1" />
                <p className="text-zinc-300 text-sm font-bold leading-relaxed tracking-tight">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3">
            <h4 className="text-xl font-black mb-8 tracking-tight uppercase">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Home</Link></li>
              <li><Link href="/trips" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Tour Packages</Link></li>
              <li><Link href="/trips" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Group Trips</Link></li>

              <li><Link href="/about" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Contact Us</Link></li>
              <li><Link href="/terms" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-zinc-300 hover:text-white transition-all font-bold text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <h4 className="text-xl font-black mb-6 tracking-tight uppercase">Get Updates & more!</h4>
            <p className="text-zinc-400 text-sm font-bold mb-8">Subscribe to the free newsletter and stay up to date.</p>
            
            <form className="space-y-4">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full bg-transparent border-2 border-zinc-700 rounded-xl px-6 py-4 focus:outline-none focus:border-white transition-all placeholder:text-zinc-600 font-bold"
              />
              <button 
                type="submit" 
                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-sm hover:bg-zinc-200 transition-all shadow-xl"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-widest text-zinc-500">
          <p>© 2026 YouthCamping</p>
          <div className="flex gap-2 items-center">
            <span>Made with ❤️ in India</span>
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/20px-Flag_of_India.svg.png" alt="India Flag" className="h-3 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
