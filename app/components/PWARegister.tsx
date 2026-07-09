'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Bypasses Service Worker in development to prevent Next.js HMR reloading loops
      if (process.env.NODE_ENV !== 'production') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then(() => {
              console.log('Service Worker de desarrollo eliminado para evitar bucles HMR.');
            });
          }
        });
        return;
      }

      // In production (like npm run start), register the service worker
      if (
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service Worker registrado en producción: ', reg.scope);
          })
          .catch((err) => {
            console.error('Fallo al registrar el Service Worker: ', err);
          });
      }
    }
  }, []);

  return null;
}
