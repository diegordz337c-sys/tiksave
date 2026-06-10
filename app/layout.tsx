import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "TikSave – Descargar TikTok sin marca de agua gratis",
  description: "Descarga videos de TikTok sin marca de agua en HD gratis. Sin registro, sin límites. Pega el enlace y descarga al instante.",
  keywords: "descargar tiktok, tiktok sin marca de agua, tiktok downloader, descargar video tiktok gratis, tiktok HD",
  openGraph: {
    title: "TikSave – Descargar TikTok sin marca de agua",
    description: "Descarga videos de TikTok gratis, sin marca de agua y en HD.",
    url: "https://tiksave-theta.vercel.app",
    siteName: "TikSave",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikSave – Descargar TikTok sin marca de agua",
    description: "Descarga videos de TikTok gratis, sin marca de agua y en HD.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="kp1Hml_NuGSRQCj0IaJ8hFPURf9_iEdjr9f7Jf_cVU8" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1085540329087607"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}