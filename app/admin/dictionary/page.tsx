"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { BookOpen, Plus, Search, Database, Globe, LogOut } from "lucide-react";
import { DictionaryTable } from "@/components/admin/dictionary-table";
import { DictionaryModal } from "@/components/admin/dictionary-modal";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { Pagination } from "@/components/admin/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Dictionary } from "@/lib/db";
import {
  getDictionaryEntries,
  createDictionaryEntry,
  updateDictionaryEntry,
  deleteDictionaryEntry,
} from "@/app/actions/dictionary-actions";

export default function DictionaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Dictionary | null>(null);
  const [entries, setEntries] = useState<Dictionary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialectFilter, setDialectFilter] = useState("all");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDictionaryEntries(searchQuery, currentPage, 10, dialectFilter);
      setEntries(result?.entries ?? []);
      setTotalPages(result?.pages ?? 1);
      setTotalEntries(result?.total ?? 0);
    } catch (error) {
      toast.error("Gagal memuat data kamus");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage, dialectFilter]);

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
    }
    loadEntries();
  }, [isAuthChecked]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEntries();
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleLogout = () => {
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  const handleAdd = async (formData: FormData) => {
    try {
      const result = await createDictionaryEntry(formData);
      if (result.success) {
        toast.success(result.message || "Kata berhasil ditambahkan");
        await loadEntries();
        return result;
      } else {
        toast.error(result.error || "Gagal menambahkan kata");
        return result;
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menambahkan kata");
      return { success: false, error: "Terjadi kesalahan" };
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedEntry) return { success: false, error: "Tidak ada kata yang dipilih" };
    try {
      const result = await updateDictionaryEntry(selectedEntry.id, formData);
      if (result.success) {
        toast.success(result.message || "Kata berhasil diperbarui");
        await loadEntries();
        return result;
      } else {
        toast.error(result.error || "Gagal memperbarui kata");
        return result;
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui kata");
      return { success: false, error: "Terjadi kesalahan" };
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setIsDeleting(true);
    try {
      const result = await deleteDictionaryEntry(selectedEntry.id);
      if (result.success) {
        toast.success(result.message || "Kata berhasil dihapus");
        await loadEntries();
      } else {
        toast.error(result.error || "Gagal menghapus kata");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus kata");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const openEditModal = (entry: Dictionary) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (entry: Dictionary) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex bg-cream-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                    Manajemen Kamus
                  </h1>
                </div>
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
            <p className="text-charcoal-700">
              Kelola kosakata Bahasa Lampung - Indonesia untuk sistem terjemahan NLP
            </p>
          </div>

          {/* Main Card */}
          <Card className="premium-card">
            <CardHeader className="pb-6 border-b border-border/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Daftar Kosakata
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {totalEntries} entri kamus
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Dialect Filter */}
                  <Select
                    value={dialectFilter}
                    onValueChange={(value) => {
                    if (value) {
                      setDialectFilter(value);
                      setCurrentPage(1);
                      // loadEntries akan dipanggil otomatis oleh useEffect karena dependency berubah
                    }
                  }}
                  >
                    <SelectTrigger className="w-full sm:w-[150px] bg-white border-border/50">
                      <SelectValue placeholder="Semua Dialek" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Dialek</SelectItem>
                      <SelectItem value="A">Dialek A</SelectItem>
                      <SelectItem value="O">Dialek O</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search */}
                  <form onSubmit={handleSearch} className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari kata Lampung atau Indonesia..."
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      className="pl-9 pr-20 w-full sm:w-[280px] bg-white border-border/50"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                    >
                      Cari
                    </Button>
                  </form>

                  {/* Add Button */}
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kata
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                    <p className="text-sm text-muted-foreground">Memuat data kamus...</p>
                  </div>
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-beige-100 flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-charcoal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                    Belum ada kosakata
                  </h3>
                  <p className="text-sm text-charcoal-700 mb-4 max-w-sm">
                    Tambahkan kosakata pertama untuk memulai membangun kamus Bahasa Lampung
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kata Pertama
                  </Button>
                </div>
              ) : (
                <>
                  <DictionaryTable
                    entries={entries}
                    onEdit={openEditModal}
                    onDelete={openDeleteDialog}
                  />

                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="mt-6 p-5 bg-beige-100 rounded-xl border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Badge className="bg-emerald-700 text-white h-5">i</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 mb-1">Tips Manajemen Kamus</h3>
                <ul className="space-y-1 text-sm text-charcoal-700">
                  <li>• Gunakan format yang konsisten untuk kosakata baru</li>
                  <li>• Dialek A untuk bahasa Lampung Api, Dialek O untuk bahasa Lampung Nyo</li>
                  <li>• Kata yang tidak ditemukan saat terjemahan akan ditandai</li>
                  <li>• Hapus atau perbarui entri yang tidak valid secara berkala</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <DictionaryModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        mode="add"
      />

      {/* Edit Modal */}
      <DictionaryModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
        onSubmit={handleEdit}
        entry={selectedEntry}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEntry(null);
        }}
        onConfirm={handleDelete}
        entry={selectedEntry}
        isDeleting={isDeleting}
      />
    </div>
  );
}