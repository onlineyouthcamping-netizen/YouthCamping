"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { normalizeImageUrl } from "@/lib/api";
import { useTheme } from "@/components/DynamicThemeProvider";

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
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSticky = theme?.navbarSticky ?? true;
  const isTransparent = theme?.navbarTransparent ?? false;
  const blurClass = (theme?.navbarBlur ?? true) ? "backdrop-blur-md" : "backdrop-blur-none";

  // Determine bg color class based on scroll and transparency settings
  const bgClass = isScrolled 
    ? "bg-white/95 shadow-lg" 
    : isTransparent 
      ? "bg-transparent" 
      : "bg-white shadow-md";

  const textColorClass = isScrolled || !isTransparent ? "text-navy" : "text-white";

  return (
    <>
      <nav
        className={cn(
          "top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 flex items-center",
          isSticky ? "sticky" : "relative",
          bgClass,
          blurClass
        )}
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <Link 
            href="/" 
            className="relative z-[60] flex items-center shrink-0"
            style={{ width: 'var(--navbar-logo-size)', height: 'calc(var(--navbar-height) * 0.8)' }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <img 
                src={normalizeImageUrl(logoUrl) || "/logo.png"} 
                alt="Youthcamping Logo" 
                fetchPriority="high"
                loading="eager"
                className="w-auto object-contain drop-shadow-lg pointer-events-auto transition-transform hover:scale-105"
                style={{ height: 'calc(var(--navbar-height) * 1.2)' }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div 
            className="relative z-20 hidden md:flex items-center"
            style={{ gap: 'var(--navbar-spacing)' }}
          >
            {(navLinks || defaultNavLinks).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-[15px] font-medium capitalize tracking-wide transition-colors",
                    isActive ? "text-primary-orange font-semibold" : textColorClass
                  )}
                  style={{
                    color: isActive ? 'var(--navbar-active-color)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--navbar-hover-color)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '';
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link 
              href="/contact" 
              className={cn("transition-colors text-[15px] font-medium capitalize tracking-wide hover:text-primary-orange", textColorClass)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--navbar-hover-color)'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full text-[15px] font-medium capitalize tracking-wide transition-all bg-navy text-white hover:bg-primary-orange shadow-lg h-11 flex items-center justify-center"
              style={{
                borderRadius: 'var(--radius-button)',
                padding: 'var(--button-padding-y) var(--button-padding-x)',
                fontSize: 'var(--button-font-size)',
                textTransform: 'var(--button-text-transform)' as any,
                letterSpacing: 'var(--button-letter-spacing)',
              }}
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
              <X className={cn("w-6 h-6", textColorClass)} />
            ) : (
              <Menu className={cn("w-6 h-6", textColorClass)} />
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
            className="text-2xl font-medium text-navy capitalize tracking-tighter"
          >
            {link.name}
          </Link>
        ))}
        <Link 
          href="/contact" 
          onClick={() => setIsMenuOpen(false)}
          className="text-2xl font-medium text-navy capitalize tracking-tighter"
        >
          Contact
        </Link>
        <Link
          href="/login"
          onClick={() => setIsMenuOpen(false)}
          className="mt-4 bg-navy text-white py-4 rounded-2xl text-center font-medium capitalize tracking-widest"
          style={{
            borderRadius: 'var(--radius-button)',
            fontSize: 'var(--button-font-size)',
            textTransform: 'var(--button-text-transform)' as any,
            letterSpacing: 'var(--button-letter-spacing)',
          }}
        >
          Login
        </Link>
      </div>
    </>
  );
}
