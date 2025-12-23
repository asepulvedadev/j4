import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "J4 - Gestión de Inventario y Productos",
  description: "Sistema de gestión integral para inventario, productos y operaciones comerciales. Empresa líder con sedes en Cúcuta, Bucaramanga y Medellín.",
  keywords: ["inventario", "productos", "gestión", "Cúcuta", "Bucaramanga", "Medellín", "J4", "Colombia"],
  authors: [{ name: "J4" }],
  creator: "J4",
  publisher: "J4",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://j4-app.com'), // Cambiar por el dominio real
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "J4 - Gestión de Inventario y Productos",
    description: "Sistema de gestión integral para inventario, productos y operaciones comerciales. Empresa líder con sedes en Cúcuta, Bucaramanga y Medellín.",
    url: 'https://j4-app.com',
    siteName: 'J4',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Agregar imagen en public/
        width: 1200,
        height: 630,
        alt: 'J4 - Gestión de Inventario',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "J4 - Gestión de Inventario y Productos",
    description: "Sistema de gestión integral para inventario, productos y operaciones comerciales.",
    images: ['/og-image.jpg'],
    creator: '@j4empresa', // Cambiar si tienen Twitter
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Agregar código real
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
