"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { BookOpen, Languages, TrendingUp, Plus, ArrowRight, Server, AlertCircle, CheckCircle } from "lucide-react";
import { getDictionaryStats, getDictionaryEntries } from "@/app/actions/dictionary-actions";
import { toast } from "sonner";

interface DictionaryEntry {
  id: number;
  lampungWord: string;
  indonesiaWord: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  apiDialect: number;
  nyoDialect: number;
  active: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    apiDialect: 0,
    nyoDialect: 0,
    active: 0,
  });
  const [recentEntries, setRecentEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flaskStatus, setFlaskStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, entriesData] = await Promise.all([
        getDictionaryStats(),
        getDictionaryEntries("", 1, 5),
      ]);

      setStats({
        total: statsData?.total ?? 0,
        apiDialect: statsData?.apiDialect ?? 0,
        nyoDialect: statsData?.nyoDialect ?? 0,
        active: statsData?.active ?? 0,
      });

      setRecentEntries(Array.isArray(entriesData?.entries) ? entriesData.entries : []);
    } catch (error) {
      toast.error("Gagal memuat data dashboard");
      // Reset to defaults on error
      setStats({
        total: 0,
        apiDialect: 0,
        nyoDialect: 0,
        active: 0,
      });
      setRecentEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFlaskConnection = async () => {
    setFlaskStatus("loading");
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        setFlaskStatus("connected");
      } else {
        setFlaskStatus("disconnected");
      }
    } catch (error) {
      setFlaskStatus("disconnected");
    }
  };

  useEffect(() => {
    // Check authentication from cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('adminAuth='));
    if (!authCookie || authCookie.split('=')[1] !== 'true') {
      window.location.href = "/admin/login";
      return;
    }
    loadDashboardData();
    checkFlaskConnection();
  }, []);

  const handleLogout = () => {
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  const dashboardStats = [
    {
      title: "Total Kosakata",
      value: String(stats?.total ?? 0),
      icon: BookOpen,
      description: "Kata dalam kamus",
      color: "text-blue-600"
    },
    {
      title: "Dialek Api",
      value: String(stats?.apiDialect ?? 0),
      icon: Languages,
      description: "Kata dialek A",
      color: "text-purple-600"
    },
    {
      title: "Dialek Nyo",
      value: String(stats?.nyoDialect ?? 0),
      icon: Languages,
      description: "Kata dialek O",
      color: "text-green-600"
    },
    {
      title: "Kata Aktif",
      value: String(stats?.active ?? 0),
      icon: TrendingUp,
      description: "Kata yang aktif",
      color: "text-orange-600"
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Selamat datang di panel admin Desa Bicara</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkFlaskConnection}
                  className="flex items-center gap-2"
                >
                  <Server className="h-4 w-4" />
                  Cek Koneksi Flask
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Flask Connection Status */}
          <Card className={`glass-card mb-6 ${flaskStatus === "disconnected" ? "border-amber-200 dark:border-amber-800" : ""}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {flaskStatus === "loading" && (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                {flaskStatus === "connected" && (
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {flaskStatus === "disconnected" && (
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">
                    Flask NLP Service
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flaskStatus === "loading" && "Memeriksa koneksi..."}
                    {flaskStatus === "connected" && "Terhubung ke localhost:5000"}
                    {flaskStatus === "disconnected" && "Tidak terhubung - Jalankan: cd nlp-service && python app.py"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <Card key={stat.title} className="glass-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dictionary Table */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Kamus Terbaru
                  </CardTitle>
                  <CardDescription>5 kosakata terbaru yang ditambahkan</CardDescription>
                </div>
                <Link href="/admin/dictionary">
                  <Button size="sm">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : recentEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada kosakata</p>
                  <Link href="/admin/dictionary">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Kata
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Bahasa Lampung</TableHead>
                        <TableHead>Bahasa Indonesia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEntries.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.lampungWord ?? "-"}</TableCell>
                          <TableCell>{item.indonesiaWord ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}