import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buku Tamu Digital Candi Dadi — Kabupaten Tulungagung",
  description: "Formulir digital resmi pencatatan kunjungan wisatawan, peneliti, dan rombongan kedinasan di Situs Cagar Budaya Candi Dadi.",
  keywords: "Candi Dadi, Buku Tamu, Tulungagung, Wisata Candi, Cagar Budaya, Buku Tamu Digital",
  authors: [{ name: "Pemerintah Kabupaten Tulungagung" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
