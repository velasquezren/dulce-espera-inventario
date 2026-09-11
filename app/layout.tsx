import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Proveedores } from '@/components/proveedores';
import { RegistroServiceWorker } from '@/components/pwa/registro-sw';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dulce Espera · Insumos de cocina',
    template: '%s · Dulce Espera',
  },
  description:
    'Gestion de pedidos, despacho y recepcion de insumos de cocina de la Clinica Montalvo.',
  applicationName: 'Dulce Espera',
  appleWebApp: {
    capable: true,
    title: 'Dulce Espera',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#006156',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="antialiased">
        <Proveedores>{children}</Proveedores>
        <RegistroServiceWorker />
      </body>
    </html>
  );
}
