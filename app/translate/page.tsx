"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TranslationSkeleton } from "@/components/features/loading-skeleton";
import { ErrorState } from "@/components/features/error-state";
import {
  ArrowRightLeft,
  Sparkles,
  Copy,
  Check,
  Globe,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Database,
  Shield,
  Zap,
  ArrowLeftRight,
} from "lucide-react";

interface NLPStep {
  label: string;
  value: string;
  type: "input" | "process" | "output";
}

interface TranslationResult {
  original: string;
  translation: string;
  nlpSteps: NLPStep[];
  notFound: string[];
  selectedDirection: string;
  detectedDirection: string;
  directionUsed: string;
  detectedLanguage: string;
  detectedDialect: string | null;
  detectedDialects: string[] | null;
  autoSwitched: boolean;
  message: string | null;
  languageDetection: {
    lampung: {
      total: number;
      exact: number;
      phrase: number;
      partial: number;
    };
    indonesia: {
      total: number;
      exact: number;
      phrase: number;
    };
    dialect_scores: {
      A: number;
      O: number;
    };
    total_tokens: number;
  };
  translationsByDialect: Record<string, string> | null;
  displayMode: string | null;
  // New fields for direction-aware matching
  matchType: string | null;
  confidenceScore: number;
  suggestedWord: string | null;
  matchedEntry: {
    lampung_word: string;
    indonesia_word: string;
    dialect: string;
    description: string;
    part_of_speech: string;
  } | null;
  searchScope: string | null;
  normalizedPhrase: string | null;
}

export default function TranslatePage() {
  const [direction, setDirection] = useState<"lampung-id" | "id-lampung">("lampung-id");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Convert frontend direction to API direction format
    const apiDirection = direction === "lampung-id" ? "lampung-to-indonesia" : "indonesia-to-lampung";

    // Flask API URL from env
    const flaskUrl = process.env.NEXT_PUBLIC_NLP_SERVICE_URL || 'http://127.0.0.1:5000';

    try {
      const response = await fetch(`${flaskUrl}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          direction: apiDirection,
          auto_detect: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Format direction display
        const formatDirection = (dir: string) => {
          return dir === "lampung-to-indonesia" ? "Lampung → Indonesia" : "Indonesia → Lampung";
        };

        // Format dialect display
        const formatDialect = (d: string | null) => {
          if (!d) return "";
          if (d === "A") return "Dialek A";
          if (d === "O") return "Dialek O";
          if (d === "mixed") return "Campuran";
          return d;
        };

        // Build NLP steps with auto-detect info
        const nlpSteps: NLPStep[] = [
          { label: "Original", value: data.input, type: "input" },
          { label: "Case Folding", value: data.case_folding, type: "process" },
          { label: "Tokenization", value: data.tokens?.join(" → ") || "[]", type: "process" },
          { label: "Normalization", value: data.normalized_tokens?.join(" → ") || "[]", type: "process" },
          {
            label: "Language Detection",
            value: data.detected_language?.toUpperCase() || "UNKNOWN",
            type: "process"
          },
          {
            label: "Dialect Detection",
            value: formatDialect(data.detected_dialect) || "-",
            type: "process"
          },
          {
            label: "Dictionary Lookup",
            value: data.mapping?.map((m: { source: string; target?: string; targets?: Record<string, string>; found: boolean }) => {
              if (!m.found) return `${m.source} → tidak ditemukan`;
              if (m.targets) {
                const parts = Object.entries(m.targets).map(([d, t]) => `${formatDialect(d)}: ${t}`);
                return `${m.source} → ${parts.join(", ")}`;
              }
              return `${m.source} → ${m.target}`;
            }).join(", ") || "[]",
            type: "process"
          },
          { label: "Final Result", value: data.translated_text, type: "output" },
        ];

        setResult({
          original: data.input,
          translation: data.translated_text,
          nlpSteps,
          notFound: data.not_found || [],
          selectedDirection: data.selected_direction || apiDirection,
          detectedDirection: data.detected_direction || apiDirection,
          directionUsed: data.direction_used || apiDirection,
          detectedLanguage: data.detected_language || "unknown",
          detectedDialect: data.detected_dialect,
          detectedDialects: data.detected_dialects || null,
          autoSwitched: data.auto_switched || false,
          message: data.message || null,
          languageDetection: data.language_detection || { lampung_matches: 0, indonesia_matches: 0, dialect_matches: { A: 0, O: 0 }, total_tokens: 0 },
          translationsByDialect: data.translations_by_dialect || null,
          displayMode: data.display_mode || null,
          // New fields for advanced matching
          matchType: data.match_type || null,
          confidenceScore: data.confidence_score || 0,
          suggestedWord: data.suggested_word || null,
          matchedEntry: data.matched_entry || null,
          searchScope: data.search_scope || null,
          normalizedPhrase: data.normalized_phrase || null,
        });
      } else {
        setError(data.error || "Terjadi kesalahan saat menerjemahkan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal terhubung ke Flask NLP service. Pastikan service berjalan di port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapDirection = () => {
    setDirection((prev) => (prev === "lampung-id" ? "id-lampung" : "lampung-id"));
    setText("");
    setResult(null);
  };

  const handleCopy = () => {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && text.trim()) {
        handleTranslate();
      }
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  // Format dialect badges for display
  const formatDialectBadges = (dialects: string[] | null) => {
    if (!dialects || dialects.length === 0) return null;
    if (dialects.length === 1) {
      return dialects[0] === "A" ? "Dialek A" : "Dialek O";
    }
    if (dialects.length === 2) {
      return "Dialek A dan O";
    }
    return dialects.map(d => d === "A" ? "A" : "O").join(", ");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-700 bg-emerald-50">
                <Globe className="w-3 h-3 mr-1" />
                Terjemahan
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 mb-3 font-[family-name:var(--font-heading)]">
                Terjemahkan Bahasa Lampung
              </h1>
              <p className="text-lg text-charcoal-700 max-w-2xl mx-auto">
                Masukkan teks untuk diterjemahkan menggunakan pipeline NLP rule-based
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Input */}
              <div className="space-y-6">
                {/* Input Card */}
                <Card className="premium-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        Input Teks
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSwapDirection}
                        className="text-charcoal-700 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Direction Tabs */}
                    <div className="flex rounded-lg border border-border/50 overflow-hidden">
                      <button
                        onClick={() => setDirection("lampung-id")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                          direction === "lampung-id"
                            ? "bg-emerald-700 text-white"
                            : "bg-beige-50 text-charcoal-700 hover:bg-beige-100"
                        }`}
                      >
                        Lampung → Indonesia
                      </button>
                      <button
                        onClick={() => setDirection("id-lampung")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                          direction === "id-lampung"
                            ? "bg-emerald-700 text-white"
                            : "bg-beige-50 text-charcoal-700 hover:bg-beige-100"
                        }`}
                      >
                        Indonesia → Lampung
                      </button>
                    </div>

                    {/* Auto Detect Info */}
                    <div className="flex items-center h-10 px-3 rounded-md border border-border/50 bg-beige-50 text-sm text-emerald-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Auto-detect bahasa & dialek aktif
                    </div>

                    {/* Textarea */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder={
                          direction === "lampung-id"
                            ? "Ketik dalam Bahasa Lampung... (Contoh: api)"
                            : "Ketik dalam Bahasa Indonesia... (Contoh: apa)"
                        }
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[120px] resize-none border-border/50 bg-beige-50 focus:bg-white transition-colors duration-200"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{text.length} karakter</span>
                        <span>Maks. 500 karakter</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleTranslate}
                        disabled={!text.trim() || isLoading}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Menerjemahkan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Terjemahkan
                          </>
                        )}
                      </Button>
                      {text.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={handleClear}
                          disabled={isLoading}
                          className="border-border/50 text-charcoal-700 hover:bg-beige-100"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Error State */}
                {error && <ErrorState error={error} onRetry={() => setError(null)} />}
              </div>

              {/* Right Column - Output */}
              <div className="space-y-6">
                {/* Loading State */}
                {isLoading && <TranslationSkeleton />}

                {/* Result Card */}
                {result && !error && (
                  <Card className="premium-card">
                    <CardHeader className="pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Globe className="h-5 w-5 text-emerald-600" />
                          Hasil Terjemahan
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.autoSwitched && (
                            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                              <ArrowLeftRight className="h-3 w-3 mr-1" />
                              Disesuaikan Otomatis
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                            {result.directionUsed === "lampung-to-indonesia" ? "Lampung → Indonesia" : "Indonesia → Lampung"}
                          </Badge>
                          {result.detectedDialects && result.detectedDialects.length === 1 && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              {result.detectedDialects[0] === "A" ? "Dialek A" : "Dialek O"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Auto-switch Message */}
                      {result.message && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-sm">
                          {result.message}
                        </div>
                      )}

                      {/* Original Text */}
                      <div className="p-4 bg-beige-50 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Teks Asli</p>
                        <p className="text-lg font-medium text-charcoal-900">{result.original}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ChevronRight className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>

                      {/* Translated Text - Main Result */}
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-emerald-600 font-medium">Hasil Terjemahan</p>
                          {result.detectedDialects && (
                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-100">
                              {formatDialectBadges(result.detectedDialects)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-emerald-800">{result.translation}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopy}
                          className="mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Salin
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Translations by Dialect - Different words */}
                      {result.displayMode === "different_words_by_dialect" && result.translationsByDialect && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 mb-2 font-medium">Hasil per Dialek:</p>
                          <div className="space-y-2">
                            {Object.entries(result.translationsByDialect).map(([dialect, translation]) => (
                              <div key={dialect} className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  dialect === "A" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                                }`}>
                                  Dialek {dialect}
                                </span>
                                <span className="text-charcoal-900 font-medium">{translation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meaning Search Matched Entry */}
                      {result.matchType === 'meaning_search' && result.matchedEntry && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 mb-2 font-medium">Detail Hasil Pencarian Makna:</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-charcoal-700">Kata Lampung:</span>
                              <span className="font-semibold text-charcoal-900">{result.matchedEntry.lampung_word}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-charcoal-700">Arti Indonesia:</span>
                              <span className="text-charcoal-900">{result.matchedEntry.indonesia_word}</span>
                            </div>
                            {result.matchedEntry.description && (
                              <div className="mt-2 p-2 bg-white rounded border border-blue-100">
                                <p className="text-xs text-blue-600 mb-1">Deskripsi:</p>
                                <p className="text-sm text-charcoal-700">{result.matchedEntry.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Not Found Words */}
                      {result.notFound.length > 0 && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-600 mb-2 font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Kata tidak ditemukan di kamus
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.notFound.map((word, index) => (
                              <Badge key={index} variant="outline" className="bg-white border-amber-200 text-amber-700">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {!result && !error && !isLoading && (
                  <Card className="premium-card">
                    <CardContent className="py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-beige-100 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-charcoal-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                        Belum ada hasil terjemahan
                      </h3>
                      <p className="text-sm text-charcoal-700 max-w-sm mx-auto">
                        Masukkan teks di panel kiri untuk memulai terjemahan
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* NLP Process Panel */}
                {result && !error && (
                  <Card className="premium-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Database className="h-5 w-5 text-emerald-600" />
                        Proses NLP
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.nlpSteps.map((step, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 ${
                              step.type === "input"
                                ? "bg-beige-50 border border-border/50"
                                : step.type === "output"
                                ? "bg-emerald-50 border border-emerald-200"
                                : "bg-white border border-border/50 hover:border-emerald-200"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.type === "input"
                                  ? "bg-charcoal-200 text-charcoal-700"
                                  : step.type === "output"
                                  ? "bg-emerald-700 text-white"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">{step.label}</p>
                              <p className={`text-sm font-mono truncate ${
                                step.type === "output" ? "text-emerald-700 font-semibold" : "text-charcoal-800"
                              }`}>
                                {step.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                                          </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-beige-100 rounded-xl border border-border/50">
              <h3 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Tips Penggunaan
              </h3>
              <ul className="space-y-2 text-sm text-charcoal-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  Sistem akan otomatis mendeteksi bahasa input dan dialek
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  Untuk input Bahasa Indonesia, hasil ditampilkan per dialek A dan O
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  Kata yang tidak ditemukan akan ditampilkan dalam tanda []
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  Tambahkan kata baru melalui halaman Admin Kamus
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}