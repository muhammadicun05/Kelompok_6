import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/Layout/ClientLayout";

export const metadata: Metadata = {
  title: "Lukla Operations Engine",
  description: "Platform Operasi Pabrik Garmen Ciwidey & Snøhund Made-to-Order",
  icons: {
    icon: "/lukla-logo.png",
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
