import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Dulce Espera · Insumos de cocina',
    short_name: 'Dulce Espera',
    description:
      'Gestion de pedidos, despacho y recepcion de insumos de cocina de la Clinica Montalvo.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f7f7',
    theme_color: '#006156',
    lang: 'es',
    dir: 'ltr',
    categories: ['business', 'productivity', 'medical'],
    shortcuts: [
      {
        name: 'Anotar en el cuaderno',
        short_name: 'Cuaderno',
        url: '/cuaderno',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Mis solicitudes',
        short_name: 'Solicitudes',
        url: '/solicitudes',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
    icons: [
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
