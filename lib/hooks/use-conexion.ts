'use client';

import { useSyncExternalStore } from 'react';

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener('online', alCambiar);
  window.addEventListener('offline', alCambiar);
  return () => {
    window.removeEventListener('online', alCambiar);
    window.removeEventListener('offline', alCambiar);
  };
}

/** true cuando el navegador reporta conexion. En servidor asume que si hay. */
export function useEnLinea(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => navigator.onLine,
    () => true,
  );
}
