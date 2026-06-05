"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Database,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Clock,
  Lock,
  Layers,
  SparklesIcon,
} from "lucide-react";

// Trust Badge
function TrustBadge({ icon: Icon, label }: { icon: typeof Brain; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-[#e8e0d0] shadow-sm">
      <Icon className="h-3.5 w-3.5 text-emerald-600" />
      <span className="text-xs font-medium text-charcoal-700">{label}</span>
    </div>
  );
}

// Translation Example Chips
function TranslationExample({ lampung, indonesia }: { lampung: string; indonesia: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#e8e0d0] shadow-sm">
      <span className="text-xs font-mono text-charcoal-700 font-medium">{lampung}</span>
      <ChevronRight className="h-3 w-3 text-emerald-500" />
      <span className="text-xs font-mono text-emerald-700 font-semibold">{indonesia}</span>
    </div>
  );
}

// Solid Premium Translation Widget
function QuickTranslationWidget() {
  const [direction, setDirection] = useState<"lampung" | "indonesia">("lampung");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [message, setMessage] = useState("");

  const flaskUrl = process.env.NEXT_PUBLIC_NLP_SERVICE_URL || 'http://127.0.0.1:5000';

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    setError("");
    setOutput("");
    setAutoSwitched(false);
    setMessage("");

    const apiDirection = direction === "lampung" ? "lampung-to-indonesia" : "indonesia-to-lampung";

    try {
      const response = await fetch(`${flaskUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, direction: apiDirection, auto_detect: true }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.translated_text || "Terjemahan tidak tersedia");
        setAutoSwitched(data.auto_switched || false);
        setMessage(data.message || "");
      } else {
        setOutput("");
        setError(data.error || "Terjemahan gagal");
      }
    } catch {
      setOutput("");
      setError("Koneksi gagal. Pastikan Flask service berjalan.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-full max-w-[480px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e8e0d0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-charcoal-900">Terjemahan Cepat</span>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5">
          Real-time
        </Badge>
      </div>

      {/* Direction Tabs */}
      <div className="flex border-b border-[#e8e0d0]">
        <button
          onClick={() => setDirection("lampung")}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors duration-150 ${
            direction === "lampung"
              ? "text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600"
              : "text-charcoal-600 hover:bg-gray-50"
          }`}
        >
          Lampung → Indonesia
        </button>
        <button
          onClick={() => setDirection("indonesia")}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors duration-150 ${
            direction === "indonesia"
              ? "text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600"
              : "text-charcoal-600 hover:bg-gray-50"
          }`}
        >
          Indonesia → Lampung
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Input */}
        <div>
          <Textarea
            placeholder={direction === "lampung" ? "Ketik dalam Bahasa Lampung..." : "Ketik dalam Bahasa Indonesia..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[72px] resize-none border-[#e8e0d0] bg-gray-50 focus:bg-white transition-colors duration-150 text-sm"
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-muted-foreground">{input.length}/500</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={!input.trim() || isTranslating}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md transition-all duration-150 text-sm font-medium py-2.5"
        >
          {isTranslating ? (
            <>
              <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
              Menerjemahkan...
            </>
          ) : (
            <>
              <SparklesIcon className="mr-2 h-3.5 w-3.5" />
              Terjemahkan
            </>
          )}
        </Button>

        {/* Output */}
        {output && (
          <div className="p-4 bg-gray-50 rounded-xl border border-[#e8e0d0]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">Hasil Terjemahan</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 transition-colors duration-150"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <p className="text-charcoal-800 text-sm leading-relaxed font-medium">{output}</p>
          </div>
        )}

        {/* Auto-switch Message */}
        {autoSwitched && message && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs">
            {message}
          </div>
        )}

        {/* Footer Link */}
        <div className="pt-3 border-t border-[#e8e0d0] text-center">
          <Link
            href="/translate"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-150 flex items-center justify-center gap-1"
          >
            Lihat proses NLP detail
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Feature Card
function FeatureCard({ icon: Icon, title, description }: { icon: typeof Brain; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-[#e8e0d0] shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-emerald-700" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-2 font-[family-name:var(--font-heading)]">{title}</h3>
      <p className="text-sm text-charcoal-700 leading-relaxed">{description}</p>
    </div>
  );
}

const features = [
  { icon: Brain, title: "Terjemahan Akurat", description: "Menggunakan kamus dinamis dan pemetaan kata untuk menghasilkan terjemahan yang konsisten dan bermakna." },
  { icon: Database, title: "Kamus Dinamis", description: "Admin dapat menambah dan memperbarui kosakata Bahasa Lampung secara langsung melalui dashboard." },
  { icon: Layers, title: "Proses NLP Transparan", description: "Setiap proses seperti case folding, tokenization, normalization, dan dictionary mapping dapat ditampilkan." },
  { icon: Lock, title: "Privasi Terjamin", description: "Teks diproses melalui engine internal tanpa LLM generatif, memastikan privasi data pengguna." },
];

// NLP Pipeline Step
function PipelineStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
        <span className="text-sm font-bold text-emerald-700">{number}</span>
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-semibold text-charcoal-900 mb-1">{title}</h4>
        <p className="text-sm text-charcoal-700">{description}</p>
      </div>
    </div>
  );
}

// Value Card
function ValueCard({ icon: Icon, title, description }: { icon: typeof Brain; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-[#e8e0d0] shadow-sm hover:shadow-md transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-emerald-700" />
      </div>
      <h3 className="text-base font-semibold text-charcoal-900 mb-2 font-[family-name:var(--font-heading)]">{title}</h3>
      <p className="text-sm text-charcoal-700 leading-relaxed">{description}</p>
    </div>
  );
}

const valueCards = [
  { icon: Lock, title: "Pelestarian Bahasa Lampung", description: "Membantu menjaga dan melestarikan Bahasa Lampung agar tidak hilang di era digital." },
  { icon: Database, title: "Kamus Dinamis dari Admin", description: "Kosakata dapat ditambahkan dan diperbarui secara real-time oleh administrator." },
  { icon: Layers, title: "Proses NLP Transparan", description: "Setiap langkah terjemahan dapat dilihat dan dipahami, bukan kotak hitam." },
  { icon: Brain, title: "Tanpa LLM Generatif", description: "Tidak menggunakan AI generatif — semua hasil berasal dari rule-based engine." },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4]">
      <Header />

      <main className="flex-1">
        {/* ===== HERO SECTION - LAYERED BACKGROUND ===== */}
        <section className="relative min-h-[520px] lg:min-h-[720px] overflow-hidden">
          {/* ===== LAYER 1: Base Background ===== */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f4] to-[#f5f0e6]" />

          {/* ===== LAYER 2: House Image as Decorative Background ===== */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Desktop house image */}
            <img
              src="/images/rumah-adat-lampung.png"
              alt="Rumah Adat Lampung"
              className="
                absolute
                object-contain
                select-none
                pointer-events-none
                hidden lg:block
                w-[80%]
                max-w-[1100px]
                h-auto
                bottom-0
                left-1/2
                -translate-x-[40%]
                opacity-80
                blur-[1px]
              "
            />
            {/* Mobile house image - centered, lifted up */}
            <img
              src="/images/rumah-adat-lampung.png"
              alt="Rumah Adat Lampung"
              className="
                absolute
                object-contain
                select-none
                pointer-events-none
                block lg:hidden
                w-[100%]
                h-auto
                bottom-[180px]
                left-1/2
                -translate-x-1/2
                opacity-100
              "
            />
          </div>

          {/* ===== LAYER 3: Gradient Overlay for Readability ===== */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Mobile gradient - vertical fade */}
            <div
              className="lg:hidden absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(250, 248, 244, 0.95) 0%, rgba(250, 248, 244, 0.88) 40%, rgba(250, 248, 244, 0.50) 100%)`
              }}
            />
            {/* Desktop gradient - horizontal fade */}
            <div
              className="hidden lg:block absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    to right,
                    rgba(250, 248, 244, 0.97) 0%,
                    rgba(250, 248, 244, 0.92) 30%,
                    rgba(250, 248, 244, 0.80) 50%,
                    rgba(250, 248, 244, 0.55) 70%,
                    rgba(250, 248, 244, 0.30) 100%
                  )
                `
              }}
            />
          </div>

          {/* ===== LAYER 3.5: Bottom Fade for House Image (Mobile only) ===== */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 lg:hidden pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(250, 248, 244, 1) 0%, rgba(250, 248, 244, 0.70) 5%, transparent 0%)'
            }}
          />

          {/* ===== LAYER 4: Subtle Ambient Glow ===== */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-br from-emerald-100/15 via-amber-50/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* ===== CONTENT ===== */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px] pt-2 pb-10 lg:pt-0 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] min-h-[520px] lg:min-h-[720px] items-center">

              {/* LEFT COLUMN: Hero Text */}
              <div className="space-y-4 sm:space-y-5">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm border border-[#e8e0d0] rounded-full shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Platform NLP Bahasa Daerah</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-charcoal-900 leading-[1.2] font-[family-name:var(--font-heading)]">
                  Terjemahan Bahasa Lampung yang{" "}
                  <span className="text-[#b8860b]">Akurat</span> dan{" "}
                  <span className="text-[#b8860b]">Bermakna</span>
                </h1>

                {/* Gold ornament line */}
                <div className="flex items-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#b8860b]/60" />
                  <div className="w-2 h-2 rounded-full bg-[#b8860b]/60" />
                  <div className="h-px w-32 bg-gradient-to-l from-transparent to-[#b8860b]/40" />
                </div>

                {/* Description */}
                <p className="text-base text-charcoal-700 leading-[1.75] max-w-[520px]">
                  Desa Bicara membantu menerjemahkan Bahasa Lampung dan Bahasa Indonesia menggunakan pendekatan{" "}
                  <span className="font-semibold text-emerald-700">rule-based NLP</span> dan{" "}
                  <span className="font-semibold text-emerald-700">dictionary-based translation</span>,
                  sehingga proses terjemahan lebih transparan, cepat, dan mudah dipahami.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/translate">
                    <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium px-6 py-3">
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Mulai Terjemahan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  <TrustBadge icon={Brain} label="Berbasis NLP" />
                  <TrustBadge icon={Clock} label="Akurat & Cepat" />
                  <TrustBadge icon={Lock} label="Privasi Terjamin" />
                </div>
              </div>

              {/* RIGHT COLUMN: Translation Card */}
              <div className="hidden lg:flex items-center justify-center py-8">
                <div className="w-full max-w-[460px]">
                  <QuickTranslationWidget />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

        {/* ===== TRUST STRIP ===== */}
        <section className="py-6 bg-[#f5f0e6]/50 border-y border-[#e8e0d0]/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: Brain, label: "Berbasis NLP", desc: "Rule-based processing" },
                { icon: Database, label: "Kamus Dinamis", desc: "Update real-time" },
                { icon: Layers, label: "Proses Transparan", desc: "Full NLP visibility" },
                { icon: Lock, label: "Privasi Terjamin", desc: "No external LLM" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 justify-center">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900 text-xs">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground hidden sm:block">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== NLP PIPELINE SECTION ===== */}
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-700 text-xs px-3 py-1">
                  NLP Pipeline
                </Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-5 font-[family-name:var(--font-heading)]">
                  Bagaimana Desa Bicara Memproses Bahasa?
                </h2>
                <p className="text-base text-charcoal-700 mb-8 leading-[1.7]">
                  Setiap teks diproses melalui pipeline NLP yang transparan, memastikan hasil terjemahan yang akurat dan dapat dipahami langkah-langkahnya.
                </p>
                <div className="space-y-5">
                  <PipelineStep number="1" title="Input Teks" description="Masukkan teks dalam Bahasa Lampung atau Indonesia" />
                  <PipelineStep number="2" title="Case Folding" description="Konversi semua huruf menjadi huruf kecil" />
                  <PipelineStep number="3" title="Tokenization" description="Pecah teks menjadi unit-unit kata" />
                  <PipelineStep number="4" title="Normalization" description="Standarisasi bentuk kata" />
                  <PipelineStep number="5" title="Dictionary Lookup" description="Cari terjemahan di database kamus" />
                  <PipelineStep number="6" title="Rekonstruksi" description="Gabungkan hasil terjemahan" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 shadow-lg border border-[#e8e0d0]">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-charcoal-900 text-sm">Contoh Proses Terjemahan</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Original", value: "Nyak mengan", color: "charcoal" },
                    { label: "Case Folded", value: "nyak mengan", color: "muted" },
                    { label: "Tokens", value: '["nyak", "mengan"]', color: "muted" },
                    { label: "Normalized", value: '["nyak", "mengan"]', color: "muted" },
                    { label: "Dictionary", value: '["saya", "makan"]', color: "gold" },
                    { label: "Result", value: "saya makan", color: "emerald", highlight: true },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3.5 rounded-xl ${
                        step.highlight ? "bg-emerald-50 border-2 border-emerald-200" : "bg-[#f5f0e6]/50"
                      }`}
                    >
                      <span className="text-xs text-charcoal-700 font-medium">{step.label}</span>
                      <span className={`font-mono text-xs ${
                        step.highlight ? "text-emerald-700 font-bold" : step.color === "gold" ? "text-[#b8860b] font-semibold" : "text-charcoal-600"
                      }`}>{step.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-[#e8e0d0]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Lampung → Indonesia</span>
                    <Link href="/translate" className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                      Coba terjemahan
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VALUE PROPOSITION SECTION ===== */}
        <section className="py-14 lg:py-20 bg-[#f5f0e6]/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
            <div className="text-center mb-10 lg:mb-14">
              <Badge variant="outline" className="mb-4 border-amber-200 text-amber-700 bg-amber-50/50 text-xs px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Nilai Unggulan
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-4 font-[family-name:var(--font-heading)]">
                Mengapa Desa Bicara?
              </h2>
              <p className="text-base text-charcoal-700 max-w-2xl mx-auto">
                Dirancang untuk pelestarian budaya dan kemudahan komunikasi antarbahasa dengan teknologi yang transparan.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {valueCards.map((card, index) => (
                <ValueCard key={index} {...card} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-4 font-[family-name:var(--font-heading)]">
                Teknologi NLP untuk Komunikasi Tanpa Batas
              </h2>
              <p className="text-base text-charcoal-700 max-w-2xl mx-auto">
                Dibangun dengan pendekatan rule-based dan dictionary-based translation untuk membantu masyarakat memahami Bahasa Lampung dan Bahasa Indonesia dengan lebih mudah.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 rounded-2xl p-10 lg:p-16 text-center">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
                  Siap Menerjemahkan?
                </h2>
                <p className="text-base text-emerald-100 max-w-2xl mx-auto mb-8">
                  Mulai terjemahan Bahasa Lampung ke Indonesia sekarang dengan teknologi NLP modern. Gratis dan mudah digunakan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/translate">
                    <Button className="bg-white text-emerald-700 hover:bg-cream-50 shadow-lg hover:shadow-xl transition-all duration-150 text-sm font-medium px-8 py-3">
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Mulai Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-150 text-sm font-medium px-8 py-3">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Pelajari NLP
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}