import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Brain,
  Database,
  Zap,
  Shield,
  BookOpen,
  ArrowRight,
  Layers,
  Cpu,
  Server,
  Globe,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";

function NLPMethodCard({
  number,
  title,
  description,
  icon: Icon,
  example,
  implementation,
}: {
  number: string;
  title: string;
  description: string;
  icon: typeof Brain;
  example?: { input: string; output: string };
  implementation?: string;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-emerald-700" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
              {number}
            </span>
            <h3 className="text-lg font-semibold text-charcoal-900 font-[family-name:var(--font-heading)]">
              {title}
            </h3>
          </div>
          <p className="text-charcoal-700 mb-4">{description}</p>

          {example && (
            <div className="bg-beige-50 rounded-lg p-4 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Contoh:</p>
              <p className="text-sm font-mono text-charcoal-900">Input: "{example.input}"</p>
              <p className="text-sm font-mono text-emerald-700">Output: "{example.output}"</p>
            </div>
          )}

          {implementation && (
            <p className="text-sm text-charcoal-700">
              <span className="font-semibold">Implementasi:</span> {implementation}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function FlowStep({ step, title, desc, icon: Icon, isLast = false }: {
  step: number;
  title: string;
  desc: string;
  icon: typeof Globe;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
          {step}
        </div>
        {!isLast && (
          <div className="w-0.5 h-12 bg-border mt-2" />
        )}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-emerald-600" />
          <h4 className="font-semibold text-charcoal-900">{title}</h4>
        </div>
        <p className="text-sm text-charcoal-700">{desc}</p>
      </div>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-700 bg-emerald-50">
                Dokumentasi Teknis
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-4 font-[family-name:var(--font-heading)]">
                Arsitektur & Metode NLP
              </h1>
              <p className="text-lg text-charcoal-700 max-w-2xl mx-auto">
                Penjelasan lengkap tentang arsitektur sistem dan metode Natural Language Processing yang digunakan dalam Desa Bicara
              </p>
            </div>

            {/* What is Desa Bicara */}
            <section className="mb-16">
              <Card className="premium-card overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-6 w-6 text-amber-400" />
                    <span className="text-sm font-medium text-emerald-100">Tentang Sistem</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                    Apa itu Desa Bicara?
                  </h2>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-charcoal-700 leading-relaxed">
                    <strong className="text-charcoal-900">Desa Bicara</strong> adalah platform terjemahan Bahasa Lampung berbasis Natural Language Processing (NLP) yang menggunakan pendekatan <span className="text-emerald-700 font-semibold">rule-based</span> dan <span className="text-emerald-700 font-semibold">dictionary-based translation</span>.
                  </p>
                  <p className="text-charcoal-700 leading-relaxed">
                    Platform ini dirancang untuk membantu masyarakat dalam memahami dan menerjemahkan Bahasa Lampung ke Bahasa Indonesia (dan sebaliknya) dengan cara yang transparan dan mudah dipahami. Berbeda dengan sistem yang menggunakan Large Language Model (LLM) generatif, Desa Bicara menggunakan pipeline NLP yang dapat divisualisasikan langkah demi langkah.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="bg-beige-50 rounded-lg p-4 text-center">
                      <Zap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-charcoal-900">Rule-based NLP</p>
                      <p className="text-xs text-muted-foreground">Tanpa LLM</p>
                    </div>
                    <div className="bg-beige-50 rounded-lg p-4 text-center">
                      <Database className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-charcoal-900">Dictionary-based</p>
                      <p className="text-xs text-muted-foreground">Kamus dinamis</p>
                    </div>
                    <div className="bg-beige-50 rounded-lg p-4 text-center">
                      <Shield className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-charcoal-900">Transparent</p>
                      <p className="text-xs text-muted-foreground">Proses terlihat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* System Architecture */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                  Arsitektur Sistem
                </h2>
              </div>

              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600" />
                    Overview Arsitektur
                  </CardTitle>
                  <CardDescription>
                    Desain sistem menggunakan arsitektur client-server dengan pemisahan concerns yang jelas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-beige-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-charcoal-900">Frontend</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Next.js Application</p>
                      <ul className="space-y-2 text-sm text-charcoal-700">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Next.js 14 App Router
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          TypeScript
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Tailwind CSS + shadcn/ui
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Server Actions
                        </li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu className="h-5 w-5 text-emerald-700" />
                        <h3 className="font-semibold text-charcoal-900">NLP Engine</h3>
                      </div>
                      <p className="text-xs text-emerald-600 mb-3">Flask Python Service</p>
                      <ul className="space-y-2 text-sm text-charcoal-700">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Flask Framework
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Python 3.x NLP Processing
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          REST API Endpoint
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Debug Mode Available
                        </li>
                      </ul>
                    </div>

                    <div className="bg-beige-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-charcoal-900">Database</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">MySQL + Prisma</p>
                      <ul className="space-y-2 text-sm text-charcoal-700">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          MySQL Database
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Prisma ORM
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Dictionary Table
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Translation History
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div className="border-t border-border/50 pt-6">
                    <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-emerald-600" />
                      Alur Data
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="bg-beige-50 border-border/50">User Input</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                      <Badge variant="outline" className="bg-beige-50 border-border/50">Next.js Frontend</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Flask API</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                      <Badge variant="outline" className="bg-beige-50 border-border/50">NLP Processing</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                      <Badge variant="outline" className="bg-beige-50 border-border/50">MySQL</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                      <Badge className="bg-gold-100 text-gold-700 border-gold-200">Response</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* NLP Methods */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                  Metode NLP
                </h2>
              </div>

              <div className="space-y-4">
                <NLPMethodCard
                  number="01"
                  title="Case Folding"
                  description="Case folding adalah proses mengkonversi semua karakter dalam teks menjadi huruf kecil (lowercase). Teknik ini digunakan untuk memastikan konsistensi dalam pemrosesan teks, mengurangi variasi kapitalisasi yang tidak relevan dengan makna kata."
                  icon={Zap}
                  example={{ input: "Nyak Mengan", output: "nyak mengan" }}
                  implementation="Menggunakan fungsi lower() di Python dan toLowerCase() di JavaScript"
                />

                <NLPMethodCard
                  number="02"
                  title="Tokenization"
                  description="Tokenization adalah proses memecah teks menjadi unit-unit yang lebih kecil yang disebut token. Dalam konteks bahasa, token biasanya berupa kata-kata. Proses ini penting untuk analisis lebih detail dan pemrosesan kata per kata."
                  icon={Brain}
                  example={{ input: "nyak mengan", output: '["nyak", "mengan"]' }}
                  implementation="Menggunakan split() dengan whitespace sebagai delimiter"
                />

                <NLPMethodCard
                  number="03"
                  title="Normalization"
                  description="Normalization adalah proses standarisasi bentuk kata untuk mengatasi variasi penulisan. Ini termasuk mengatasi pengulangan karakter berlebihan (contoh: mangaann → mangan) dan inkoherensi penulisan."
                  icon={Shield}
                  example={{ input: '["mangaann", "nyak"]', output: '["mangan", "nyak"]' }}
                  implementation="Menggunakan regex pattern untuk mengurangi pengulangan karakter"
                />

                <NLPMethodCard
                  number="04"
                  title="Dictionary-Based Translation"
                  description="Metode terjemahan yang menggunakan kamus atau database kata sebagai referensi. Setiap kata dalam bahasa sumber dicocokkan dengan terjemahannya dalam bahasa target menggunakan lookup table. Metode ini sederhana namun efektif untuk domain spesifik."
                  icon={Database}
                  example={{ input: '["nyak", "mengan"]', output: '["saya", "makan"]' }}
                  implementation="Dictionary lookup dengan case-insensitive matching"
                />
              </div>
            </section>

            {/* Admin Role */}
            <section className="mb-16">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600" />
                    Peran Admin
                  </CardTitle>
                  <CardDescription>
                    Administrator dapat mengelola kamus dan melihat history terjemahan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-beige-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal-900 mb-1">Kelola Kosakata</h4>
                        <p className="text-sm text-charcoal-700">
                          Admin dapat menambahkan, mengedit, dan menghapus entri kamus Bahasa Lampung - Indonesia melalui dashboard.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-beige-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal-900 mb-1">Pilih Dialek</h4>
                        <p className="text-sm text-charcoal-700">
                          Setiap kosakata dapat dikategorikan berdasarkan dialek (Api/Nyo) untuk hasil terjemahan yang lebih akurat.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-beige-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal-900 mb-1">Update Real-time</h4>
                        <p className="text-sm text-charcoal-700">
                          Perubahan kamus berlaku langsung untuk proses terjemahan berikutnya.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* System Flow */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                  Flowchart Sistem
                </h2>
              </div>

              <Card className="premium-card">
                <CardHeader>
                  <CardTitle>Alur Kerja Lengkap</CardTitle>
                  <CardDescription>
                    Visualisasi proses dari input hingga output
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <FlowStep step={1} title="User Input" desc="User memasukkan teks Bahasa Lampung atau Indonesia" icon={Globe} />
                    <FlowStep step={2} title="Frontend Processing" desc="Next.js mengirim request ke Flask API dengan debug mode" icon={Server} />
                    <FlowStep step={3} title="Case Folding" desc="Konversi teks ke lowercase" icon={Zap} />
                    <FlowStep step={4} title="Tokenization" desc="Pecah teks menjadi array kata" icon={Brain} />
                    <FlowStep step={5} title="Normalization" desc="Standarisasi bentuk kata" icon={Shield} />
                    <FlowStep step={6} title="Dictionary Lookup" desc="Cari terjemahan di MySQL database" icon={Database} />
                    <FlowStep step={7} title="Translation" desc="Gabungkan hasil terjemahan" icon={BookOpen} />
                    <FlowStep step={8} title="Response" desc="Kirim hasil + NLP steps ke frontend" icon={Cpu} isLast />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tech Stack */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal-900 font-[family-name:var(--font-heading)]">
                  Tech Stack
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-emerald-600" />
                      Frontend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Next.js 14", desc: "React Framework" },
                        { name: "TypeScript", desc: "Type Safety" },
                        { name: "Tailwind CSS", desc: "Styling" },
                        { name: "shadcn/ui", desc: "UI Components" },
                      ].map((tech) => (
                        <div key={tech.name} className="flex items-center justify-between p-3 bg-beige-50 rounded-lg">
                          <span className="font-medium text-charcoal-900">{tech.name}</span>
                          <span className="text-sm text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-emerald-600" />
                      Backend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Flask", desc: "Python Web Framework" },
                        { name: "Python 3.x", desc: "NLP Processing" },
                        { name: "MySQL", desc: "Database" },
                        { name: "Prisma", desc: "ORM" },
                      ].map((tech) => (
                        <div key={tech.name} className="flex items-center justify-between p-3 bg-beige-50 rounded-lg">
                          <span className="font-medium text-charcoal-900">{tech.name}</span>
                          <span className="text-sm text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center">
              <Card className="premium-card bg-gradient-to-br from-emerald-700 to-emerald-600 overflow-hidden">
                <CardContent className="p-8 lg:p-12">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                  </div>
                  <div className="relative">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
                      Mulai Terjememahan Sekarang
                    </h2>
                    <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
                      Gunakan platform Desa Bicara untuk menerjemahkan Bahasa Lampung ke Bahasa Indonesia dengan teknologi NLP modern.
                    </p>
                    <Button className="bg-white text-emerald-700 hover:bg-cream-50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Mulai Terjemahan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}