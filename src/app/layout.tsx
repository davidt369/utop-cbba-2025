import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import QueryProvider from '@/components/QueryProvider';
import { AuthProvider } from '@/components/auth-provider';
import ClientComponents from '@/components/ClientComponents';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U.T.O.P",
  description: "Gestión de funcionarios policiales y sus sanciones",
  icons: {
    // Usar tu logo completo en lugar del fallback de Next.js
    icon: [
      { url: '/logo-utop.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-utop.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logo-utop.png',
    apple: '/logo-utop.png',
  },
  manifest: '/manifest.json',        // PWA manifest
};

export const viewport: Viewport = {
  // Color de la barra de estado en dispositivos móviles
  themeColor: '#0ea5a4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
      >
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {children}
              <ClientComponents />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>

      </body>
    </html>
  );
}
