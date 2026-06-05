import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Clock, Languages } from "lucide-react";
import { useState } from "react";

interface TranslationResultProps {
  original: string;
  translatedText: string;
  simplifiedText: string | null;
  processingTimeMs: number;
  dialect: string;
}

export function TranslationResult({
  original,
  translatedText,
  simplifiedText,
  processingTimeMs,
  dialect,
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Original Text */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="h-4 w-4" />
            Teks Asli
          </CardTitle>
          <CardDescription>Bahasa Lampung - Dialek {dialect}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{original}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{processingTimeMs}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Translated Text */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="h-4 w-4" />
            Hasil Terjemahan
          </CardTitle>
          <CardDescription>Bahasa Indonesia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{translatedText}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => handleCopy(translatedText)}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-3 w-3" />
                Disalin
              </>
            ) : (
              <>
                <Copy className="mr-2 h-3 w-3" />
                Salin
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Simplified Text */}
      {simplifiedText && (
        <Card className="glass-card border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-4 w-4 text-green-600" />
              Teks Sederhana
            </CardTitle>
            <CardDescription>
              Versi yang lebih mudah dipahami
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-green-700 dark:text-green-400">
              {simplifiedText}
            </p>
            <Badge variant="outline" className="mt-3 border-green-200 text-green-700">
              Simplified
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
