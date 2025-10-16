import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppProviders from "@/components/AppProviders";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Gestor Financiero",
  description: "App para control de gastos e ingresos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          {/* Header se muestra en todas las páginas */}
          <Header />

          <main>{children}</main>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
