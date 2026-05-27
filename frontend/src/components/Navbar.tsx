"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";

interface NavLink {
  name: string;
  href: string;
}

interface NavbarProps {
  logoUrl?: string;
  navLinks?: NavLink[];
}

const defaultNavLinks = [
  { name: "Home", href: "/" },
  { name: "Trips", href: "/trips" },
];

export default function Navbar({ 
  logoUrl = "/logo.png",
  navLinks = defaultNavLinks
}: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 bg-white/95 backdrop-blur-md shadow-lg py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="relative z-[60] flex items-center h-12 w-[180px] md:w-[280px] shrink-0">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <img 
                src={normalizeImageUrl(logoUrl) || "/logo.png"} 
                alt="Youthcamping Logo" 
                fetchPriority="high"
                loading="eager"
                className="h-24 md:h-40 w-auto max-w-[450px] object-contain drop-shadow-lg scale-110 pointer-events-auto transition-transform hover:scale-115"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="relative z-20 hidden md:flex items-center gap-10">
            {(navLinks || defaultNavLinks).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-bold uppercase tracking-[0.15em] transition-colors text-navy hover:text-primary-orange"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/contact" className="transition-colors text-sm font-bold uppercase tracking-widest text-navy hover:text-primary-orange">Contact</Link>
            <Link
              href="/login"
              className="px-8 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all bg-navy text-white hover:bg-primary-orange shadow-lg"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden relative z-[60] p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-navy" />
            ) : (
              <Menu className="w-6 h-6 text-navy" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-0 bg-white z-50 transition-transform duration-500 md:hidden flex flex-col pt-32 px-8 gap-8",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {(navLinks || defaultNavLinks).map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl font-black text-navy uppercase tracking-tighter"
          >
            {link.name}
          </Link>
        ))}
        <Link 
          href="/contact" 
          onClick={() => setIsMenuOpen(false)}
          className="text-2xl font-black text-navy uppercase tracking-tighter"
        >
          Contact
        </Link>
        <Link
          href="/login"
          onClick={() => setIsMenuOpen(false)}
          className="mt-4 bg-navy text-white py-4 rounded-2xl text-center font-bold uppercase tracking-widest"
        >
          Login
        </Link>
      </div>
    </>
  );
}
