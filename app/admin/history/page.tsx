"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { History, Search, Calendar, Clock, Eye, Download, Loader2, ChevronLeft, ChevronRight, RefreshCw, LogOut } from "lucide-react";
import { getTranslationHistory } from "@/app/actions/translation-actions";
import { toast } from "sonner";

interface TranslationHistoryItem {
  id: string;
  inputText: string;
  translatedText: string;
  simplifiedText: string | null;
  direction: string;
  nlpSteps: any;
  processingTime: number | null;
  createdAt: string;
}

interface DialogState {
  isOpen: boolean;
  item: TranslationHistoryItem | null;
}

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyData, setHistoryData] = useState<TranslationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, item: null });
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await getTranslationHistory(100);
      if (result.success && result.history) {
        setHistoryData(result.history as TranslationHistoryItem[]);
      } else {
        toast.error(result.error || "Gagal memuat riwayat terjemahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication from cookie
    if (!isAuthChecked) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('adminAuth='));
      if (!authCookie || authCookie.split('=')[1] !== 'true') {
        window.location.href = "/admin/login";
        return;
      }
      setIsAuthChecked(true);
      loadHistory();
    }
  }, [isAuthChecked]);

  const filteredData = historyData.filter(
    (item) =>
      item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDirection = (direction: string) => {
    if (direction.includes("api")) return "Api (A)";
    if (direction.includes("nyo")) return "Nyo (O)";
    return direction;
  };

  const openDetailDialog = (item: TranslationHistoryItem) => {
    setDialog({ isOpen: true, item });
  };

  const closeDetailDialog = () => {
    setDialog({ isOpen: false, item: null });
  };

  const exportToCSV = () => {
    const headers = ["ID", "Input", "Output", "Waktu", "Durasi"];
    const rows = filteredData.map((item) => [
      item.id,
      item.inputText,
      item.translatedText,
      formatDate(item.createdAt),
      item.processingTime ? `${item.processingTime}ms` : "N/A",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat-terjemahan-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLogout = () => {
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Riwayat Terjemahan</h1>
                <p className="text-muted-foreground">Lihat semua riwayat terjemahan yang telah dilakukan</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Daftar Terjemahan</CardTitle>
                  <CardDescription>
                    {isLoading ? "Memuat..." : `Total ${filteredData.length} riwayat terjemahan`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={loadHistory}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={exportToCSV} disabled={filteredData.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Ekspor Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari riwayat terjemahan..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada riwayat terjemahan"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Input</TableHead>
                          <TableHead>Output</TableHead>
                          <TableHead>Dialek</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Proses</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/50">
                            <TableCell className="max-w-[200px] truncate">
                              {item.inputText}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {item.translatedText}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{formatDirection(item.direction)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.processingTime ? (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.processingTime}ms
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDetailDialog(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Halaman {currentPage} dari {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {dialog.isOpen && dialog.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeDetailDialog} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detail Terjemahan</h3>
              <Button variant="ghost" size="icon" onClick={closeDetailDialog}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">ID Transaksi</label>
                <div className="p-2 rounded-md bg-muted/50 border text-xs font-mono">
                  {dialog.item.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Waktu</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(dialog.item.createdAt)}
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Durasi</label>
                  <Badge variant="outline" className="gap-1 w-fit">
                    <Clock className="h-3 w-3" />
                    {dialog.item.processingTime ? `${dialog.item.processingTime}ms` : "N/A"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Teks Bahasa Lampung</label>
                <div className="p-3 rounded-md bg-muted/50 border font-medium">
                  {dialog.item.inputText}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Teks Bahasa Indonesia</label>
                <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                  {dialog.item.translatedText}
                </div>
              </div>

              {dialog.item.simplifiedText && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Teks Tersederhanakan</label>
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    {dialog.item.simplifiedText}
                  </div>
                </div>
              )}

              {dialog.item.nlpSteps && Object.keys(dialog.item.nlpSteps).length > 0 && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Langkah NLP</label>
                  <div className="p-3 rounded-md bg-muted/50 border text-xs font-mono overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(dialog.item.nlpSteps, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeDetailDialog}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}