import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Server, Wifi } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card className="glass-card border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          Terjadi Kesalahan
        </CardTitle>
        <CardDescription>
          Gagal memproses terjemahan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        )}
        
        <div className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground font-medium">Solusi yang mungkin:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Server className="h-3 w-3" />
              Pastikan Flask NLP service berjalan di port 5000
            </p>
            <p className="flex items-center gap-2">
              <Wifi className="h-3 w-3" />
              Periksa koneksi internet Anda
            </p>
            <p className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3" />
              Refresh halaman dan coba lagi
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
