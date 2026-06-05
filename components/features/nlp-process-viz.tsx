import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, GitBranch, RefreshCw, Languages, Zap, AlertTriangle, Copy, Check, Timer, BarChart3 } from "lucide-react";
import { useState } from "react";

interface NLPProcessVizProps {
  caseFolding: string;
  tokens: string[];
  normalizedTokens: string[];
  translatedTokens: string[];
  notFound?: string[];
  processingTimeMs?: number;
}

export function NLPProcessViz({
  caseFolding,
  tokens,
  normalizedTokens,
  translatedTokens,
  notFound = [],
  processingTimeMs,
}: NLPProcessVizProps) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  const totalWords = tokens.length;
  const foundWords = tokens.length - notFound.length;
  const accuracy = totalWords > 0 ? Math.round((foundWords / totalWords) * 100) : 0;

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const steps = [
    {
      name: "Case Folding",
      icon: FileText,
      description: "Konversi ke huruf kecil",
      result: caseFolding,
      status: "completed",
      color: "bg-blue-500",
      explanation: "Semua karakter dikonversi ke huruf kecil untuk konsistensi. Contoh: 'Nyak' → 'nyak'",
    },
    {
      name: "Tokenization",
      icon: GitBranch,
      description: "Pemecahan kata",
      result: tokens.join(", "),
      status: "completed",
      color: "bg-purple-500",
      explanation: "Teks dipecah menjadi unit-unit kata (tokens) menggunakan spasi sebagai delimiter.",
    },
    {
      name: "Normalization",
      icon: RefreshCw,
      description: "Normalisasi karakter",
      result: normalizedTokens.join(", "),
      status: "completed",
      color: "bg-green-500",
      explanation: "Menghapus karakter berulang berlebihan. Contoh: 'mangaann' → 'mangan'",
    },
    {
      name: "Dictionary Lookup",
      icon: Languages,
      description: "Pencarian di kamus",
      result: translatedTokens.join(", "),
      status: "completed",
      color: "bg-orange-500",
      explanation: "Setiap token dicari di database kamus Lampung-Indonesia.",
    },
  ];

  const finalTranslation = translatedTokens.join(" ");

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Proses NLP
            </CardTitle>
            <CardDescription>
              Pipeline pemrosesan bahasa alami (rule-based dictionary translation)
            </CardDescription>
          </div>
          {processingTimeMs !== undefined && (
            <Badge variant="outline" className="gap-1 bg-primary/10">
              <Timer className="h-3 w-3" />
              {processingTimeMs}ms
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.name} className="relative group">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-10 w-10 rounded-full ${step.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{step.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {step.description}
                      </Badge>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 relative group">
                      <p className="text-sm font-mono break-words">{step.result || "(tidak ada perubahan)"}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(step.result, step.name)}
                      >
                        {copiedStep === step.name ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {step.explanation}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="ml-5 mt-2 h-6 border-l-2 border-dashed border-primary/30" />
                )}
              </div>
            );
          })}
        </div>

        {/* Final Result */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Hasil Terjemahan
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyResult(finalTranslation)}
            >
              {copiedResult ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Salin
                </>
              )}
            </Button>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
            <p className="text-lg font-semibold">{finalTranslation}</p>
          </div>
        </div>

        {/* Token Comparison */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Perbandingan Token
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <p className="text-xs font-medium">Token Original (setelah preprocessing)</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {normalizedTokens.length > 0 ? normalizedTokens.map((token, i) => (
                  <Badge key={i} variant="secondary" className="text-xs border-purple-200 dark:border-purple-800">
                    {token}
                  </Badge>
                )) : (
                  <span className="text-sm text-muted-foreground italic">Tidak ada token</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <p className="text-xs font-medium">Token Terjemahan</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {translatedTokens.length > 0 ? translatedTokens.map((token, i) => (
                  <Badge key={i} variant="default" className="text-xs bg-orange-500 hover:bg-orange-600">
                    {token}
                  </Badge>
                )) : (
                  <span className="text-sm text-muted-foreground italic">Tidak ada terjemahan</span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h5 className="font-semibold text-sm">Statistik Pengolahan</h5>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalWords}</div>
                <div className="text-xs text-muted-foreground">Total Kata</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{foundWords}</div>
                <div className="text-xs text-muted-foreground">Ditemukan di Kamus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{notFound.length}</div>
                <div className="text-xs text-muted-foreground">Tidak Ditemukan</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Akurasi Terjemahan:</span>
                <Badge variant={accuracy >= 80 ? "default" : "outline"} className="bg-green-500">
                  {accuracy}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Not Found Tokens */}
        {notFound.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Kata Tidak Ditemukan di Kamus ({notFound.length})
            </h4>
            <div className="flex flex-wrap gap-1 mb-3">
              {notFound.map((token, i) => (
                <Badge key={i} variant="outline" className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300">
                  {token}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-800">
              Kata-kata ini tidak ditemukan di kamus dan ditampilkan apa adanya. Anda dapat menambahkan kata-kata tersebut melalui panel Admin untuk meningkatkan akurasi terjemahan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
