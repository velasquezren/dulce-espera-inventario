'use client';

import { useSyncExternalStore } from 'react';

const sinCambios = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

/** true una vez que el componente vive en el navegador (post hidratacion). */
export function useEsCliente(): boolean {
  return useSyncExternalStore(sinCambios, enCliente, enServidor);
}
