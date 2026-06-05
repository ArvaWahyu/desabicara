"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Languages, Sparkles } from "lucide-react";

interface TranslationFormProps {
  onTranslate: (text: string, dialect: "Api" | "Nyo", simplify: boolean) => void;
  isLoading?: boolean;
}

export function TranslationForm({ onTranslate, isLoading = false }: TranslationFormProps) {
  const [text, setText] = useState("");
  const [dialect, setDialect] = useState<"Api" | "Nyo">("Api");
  const [simplify, setSimplify] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTranslate(text, dialect, simplify);
    }
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Terjemahan Bahasa Lampung
        </CardTitle>
        <CardDescription>
          Masukkan teks Bahasa Lampung untuk diterjemahkan ke Bahasa Indonesia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Teks Bahasa Lampung</Label>
            <Textarea
              id="text"
              placeholder="Contoh: Nyak mengan khom nasi"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{text.length} karakter</span>
              {text.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Hapus
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dialect">Dialek</Label>
              <Select
                value={dialect}
                onValueChange={(value: "Api" | "Nyo" | null) => {
                  if (value) setDialect(value);
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="dialect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Api">Api (A)</SelectItem>
                  <SelectItem value="Nyo">Nyo (O)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simplify">Sederhanakan</Label>
              <Select
                value={simplify ? "true" : "false"}
                onValueChange={(value: string | null) => {
                  if (value) setSimplify(value === "true");
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="simplify">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ya</SelectItem>
                  <SelectItem value="false">Tidak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!text.trim() || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Terjemahkan
              </>
            )}
          </Button>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Case Folding
            </Badge>
            <Badge variant="outline" className="text-xs">
              Tokenization
            </Badge>
            <Badge variant="outline" className="text-xs">
              Normalization
            </Badge>
            <Badge variant="outline" className="text-xs">
              Translation
            </Badge>
            {simplify && (
              <Badge variant="outline" className="text-xs">
                Simplification
              </Badge>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
