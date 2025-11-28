import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ElectronHelper } from '@/components/layout/ElectronHelper'
import { Toaster } from '@/components/ui/toaster'
import { ProveedorNotificaciones } from '@/contexts/NotificacionesContext'

export const metadata: Metadata = {
  title: 'CRM Delgado Propiedades',
  description: 'Proyecto de Innovación para Delgado Propiedades',
  icons: {
    icon: '/propiedadedelgado.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ProveedorNotificaciones>
          <ElectronHelper />
          {children}
          <Toaster />
          <Analytics />
        </ProveedorNotificaciones>
      </body>
    </html>
  )
}
