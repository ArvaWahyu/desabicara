"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dictionary } from "@/lib/db";

interface DictionaryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  entry?: Dictionary | null;
  mode: "add" | "edit";
}

export function DictionaryModal({
  open,
  onClose,
  onSubmit,
  entry,
  mode,
}: DictionaryModalProps) {
  const [lampungWord, setLampungWord] = useState("");
  const [indonesiaWord, setIndonesiaWord] = useState("");
  const [dialectA, setDialectA] = useState(true); // Default A checked
  const [dialectO, setDialectO] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry && mode === "edit") {
      setLampungWord(entry.lampungWord || "");
      setIndonesiaWord(entry.indonesiaWord || "");
      setDialectA(entry.dialect === "A");
      setDialectO(entry.dialect === "O");
    } else {
      // Reset for add mode
      setLampungWord("");
      setIndonesiaWord("");
      setDialectA(true); // Default A checked
      setDialectO(false);
    }
    setError(null);
  }, [entry, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Collect selected dialects
    const selectedDialects: string[] = [];
    if (dialectA) selectedDialects.push("A");
    if (dialectO) selectedDialects.push("O");

    // Validation: at least one dialect must be selected
    if (selectedDialects.length === 0) {
      setError("Pilih minimal satu dialek");
      setIsSubmitting(false);
      return;
    }

    // For edit mode, need at least one dialect checked
    if (mode === "edit" && !dialectA && !dialectO) {
      setError("Pilih minimal satu dialek");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("lampungWord", lampungWord.trim().toLowerCase());
    data.append("indonesiaWord", indonesiaWord.trim().toLowerCase());

    if (mode === "edit") {
      // Edit mode: send single dialect
      const singleDialect = dialectA ? "A" : "O";
      data.append("dialect", singleDialect);
    } else {
      // Add mode: send comma-separated dialects
      data.append("dialects", selectedDialects.join(","));
    }

    const result = await onSubmit(data);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Terjadi kesalahan");
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Kata Baru" : "Edit Kata"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Tambahkan kata Bahasa Lampung baru ke kamus"
              : "Edit kata yang ada di kamus"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lampungWord">Kata Lampung *</Label>
              <Input
                id="lampungWord"
                value={lampungWord}
                onChange={(e) => setLampungWord(e.target.value)}
                placeholder="Contoh: nyak"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indonesiaWord">Arti Indonesia *</Label>
              <Input
                id="indonesiaWord"
                value={indonesiaWord}
                onChange={(e) => setIndonesiaWord(e.target.value)}
                placeholder="Contoh: saya"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dialek *</Label>
            <div className="flex flex-row items-start space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dialectA"
                  checked={dialectA}
                  onCheckedChange={(checked) => setDialectA(checked === true)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="dialectA"
                  className="text-sm font-normal cursor-pointer"
                >
                  Dialek A
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dialectO"
                  checked={dialectO}
                  onCheckedChange={(checked) => setDialectO(checked === true)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="dialectO"
                  className="text-sm font-normal cursor-pointer"
                >
                  Dialek O
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Centang satu atau lebih dialek untuk kata ini
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : mode === "add"
                ? "Tambah"
                : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}