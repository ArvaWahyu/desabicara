import Link from "next/link";
import { Heart, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-beige-100 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                <img
                  src="/images/logo.png"
                  alt="Desa Bicara Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                  Desa Bicara
                </span>
              </div>
            </Link>
            <p className="text-sm text-charcoal-700 leading-relaxed mb-4">
              Platform terjemahan Bahasa Lampung berbasis Natural Language Processing untuk menjembatani komunikasi antar budaya.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Lampung, Indonesia</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900 mb-4 uppercase tracking-wider">
              Navigasi
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/translate" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Terjemahan
                </Link>
              </li>
              <li>
                <Link href="/admin/dictionary" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Kamus
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Dokumentasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900 mb-4 uppercase tracking-wider">
              Teknologi
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/documentation" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  NLP Pipeline
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Case Folding
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Dictionary-Based Translation
                </Link>
              </li>
              <li>
                <Link href="/admin/dictionary" className="text-sm text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                  Kelola Kamus
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900 mb-4 uppercase tracking-wider">
              Kontak
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-charcoal-700">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-emerald-600" />
                </div>
                <span>info@desabicara.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-charcoal-700">
              <span>&copy; 2026 Desa Bicara.</span>
              <span className="hidden sm:inline">Dibuat dengan</span>
              <Heart className="h-4 w-4 text-gold-500 hidden sm:inline" />
              <span className="hidden sm:inline">untuk pelestarian Bahasa Lampung</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/documentation" className="text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                Dokumentasi
              </Link>
              <Link href="/admin/dictionary" className="text-charcoal-700 hover:text-emerald-700 transition-colors duration-200">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}