import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import PWARegister from "./components/PWARegister";
import ErrorDebugger from "./components/ErrorDebugger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clínica Montalvo - Inventario de Cocina",
  description: "Sistema PWA para gestión de inventario e insumos de cocina de la Clínica Montalvo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Montalvo Cocina",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#006156" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full bg-[#f8fafc] text-[#0f172a] antialiased">
        <Providers>
          <PWARegister />
          <ErrorDebugger />
          {children}
        </Providers>
      </body>
    </html>
  );
}

