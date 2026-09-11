'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker solo en produccion y sobre un origen seguro.
 * En desarrollo elimina registros previos para evitar recargas en bucle.
 */
export function RegistroServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registros) => {
        registros.forEach((registro) => void registro.unregister());
      });
      return;
    }

    if (!window.isSecureContext) return;
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* la app funciona igual sin cache offline */
    });
  }, []);

  return null;
}
