import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/Layout/ClientLayout";
import { PwaManager } from "@/components/PwaManager";

export const viewport: Viewport = {
  themeColor: "#26325B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Lukla Operations Engine",
  description: "Platform Operasi Pabrik Garmen & Snøhund Made-to-Order",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon-192.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>
          {children}
          <PwaManager />
        </ClientLayout>
      </body>
    </html>
  );
}
