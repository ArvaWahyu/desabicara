import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Playfair_Display({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desa Bicara - Terjemahan Bahasa Lampung",
  description: "Platform NLP berbasis dictionary untuk menerjemahkan Bahasa Lampung ke Bahasa Indonesia. Menggunakan pendekatan rule-based dan dictionary-based translation.",
  keywords: ["NLP", "Natural Language Processing", "Bahasa Lampung", "Terjemahan", "Indonesia", "Dictionary-based", "Text Processing"],
  authors: [{ name: "Desa Bicara Team" }],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Desa Bicara - Terjemahan Bahasa Lampung",
    description: "Platform NLP berbasis dictionary untuk menerjemahkan Bahasa Lampung ke Bahasa Indonesia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfairDisplay.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 lampung-motif-bg">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
