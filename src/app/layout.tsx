import type { Metadata, Viewport } from "next";
import { DM_Sans, Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
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
    <html lang="id" className={`${dmSans.variable} ${cinzel.variable} ${crimsonPro.variable}`}>
      <head>
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
