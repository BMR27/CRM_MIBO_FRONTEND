import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRM de Whatshapp - Ecommerce", // updated title
  description: "CRM de WhatsApp para eCommerce - Gestión de conversaciones y atención al cliente", // updated description
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Importa el Toaster para mostrar los mensajes toast globales
  const Toaster = require('../components/ui/toaster').Toaster;
  // Disparo manual de toast para depuración visual
  if (typeof window !== 'undefined') {
    const { toast } = require('../hooks/use-toast');
    window.showTestToast = () => toast({ title: 'Test Toast', description: '¿Se muestra el toast?' });
    // Puedes ejecutar window.showTestToast() en la consola del navegador
  }
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
