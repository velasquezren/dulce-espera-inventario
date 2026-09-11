'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface Archivo {
  blob: Blob;
  nombre: string;
}

export type ResultadoCompartir = 'compartido' | 'descargado' | 'cancelado';

const sinCambios = () => () => {};
const noSoporta = () => false;

/**
 * No basta con que exista navigator.share: en escritorio suele estar pero sin
 * admitir archivos. Se comprueba con un archivo de prueba vacio.
 */
const soporta = () => {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files: [new File([], 'prueba.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
};

export function descargarArchivo({ blob, nombre }: Archivo): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * Entrega un archivo al dialogo para compartir del telefono y, si el equipo no
 * lo admite o el usuario tarda demasiado, lo descarga sin preguntar nada mas.
 */
export function useCompartir() {
  const puedeCompartir = useSyncExternalStore(sinCambios, soporta, noSoporta);

  const compartir = useCallback(
    async (obtener: () => Promise<Archivo>, titulo: string): Promise<ResultadoCompartir> => {
      const archivo = await obtener();
      const adjunto = new File([archivo.blob], archivo.nombre, {
        type: archivo.blob.type || 'application/octet-stream',
      });

      if (puedeCompartir && navigator.canShare({ files: [adjunto] })) {
        try {
          await navigator.share({ files: [adjunto], title: titulo });
          return 'compartido';
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return 'cancelado';
          // Sin permiso o sin soporte real: se entrega igual por descarga.
        }
      }

      descargarArchivo(archivo);
      return 'descargado';
    },
    [puedeCompartir],
  );

  return { puedeCompartir, compartir, descargar: descargarArchivo };
}
