"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";

// Lampung House Icon SVG
function LampungHouseIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Roof - Traditional Nuwo Sesat shape */}
      <path
        d="M20 4L4 18H8L20 8L32 18H36L20 4Z"
        fill="currentColor"
        className="text-emerald-700"
      />
      {/* Roof base detail */}
      <path
        d="M6 18L20 10L34 18H6Z"
        fill="currentColor"
        className="text-emerald-800"
      />
      {/* House body */}
      <rect x="10" y="18" width="20" height="16" fill="currentColor" className="text-emerald-600" />
      {/* Door */}
      <rect x="17" y="24" width="6" height="10" fill="currentColor" className="text-amber-500" />
      {/* Window left */}
      <rect x="12" y="22" width="4" height="4" fill="currentColor" className="text-amber-400" />
      {/* Window right */}
      <rect x="24" y="22" width="4" height="4" fill="currentColor" className="text-amber-400" />
      {/* Decorative pattern on roof */}
      <path
        d="M12 16L20 12L28 16"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-amber-500"
        fill="none"
      />
    </svg>
  );
}

// Decorative motif pattern
function LampungMotif() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.02]" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="lampung-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M60 10L70 30L60 50L50 30Z" fill="#065f46" />
          <path d="M60 70L70 90L60 110L50 90Z" fill="#b8860b" />
          <path d="M10 60L30 70L50 60L30 50Z" fill="#065f46" />
          <path d="M70 60L90 70L110 60L90 50Z" fill="#b8860b" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lampung-pattern)" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/translate", label: "Terjemahan" },
  { href: "/documentation", label: "Dokumentasi" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-cream-50/95 backdrop-blur-sm border-b border-border/50">
      <div className="absolute inset-0 overflow-hidden">
        <LampungMotif />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md group-hover:opacity-80 transition-opacity duration-200">
              <img
                src="/images/logo.png"
                alt="Desa Bicara Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-charcoal-900 font-[family-name:var(--font-heading)] tracking-tight">
                Desa Bicara
              </span>
              <span className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">
                Bahasa Lampung
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive ? "text-emerald-700" : "text-charcoal-700 hover:text-emerald-700"}
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link href="/translate" className="hidden sm:flex">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium">
                Mulai Terjemahan
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-charcoal-700 hover:bg-emerald-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive ? "bg-emerald-50 text-emerald-700" : "text-charcoal-700 hover:bg-beige-100"}
                  `}
                >
                  {isActive && (
                    <span className="w-1 h-4 bg-gold-500 rounded-full" />
                  )}
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 px-4">
              <Link href="/translate" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md font-medium">
                  Mulai Terjemahan
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}