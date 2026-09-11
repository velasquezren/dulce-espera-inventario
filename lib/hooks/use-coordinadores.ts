'use client';

import { useEffect, useState } from 'react';
import { obtenerCoordinadores } from '../api/coordinadores';
import type { Coordinador } from '../domain/tipos';

/** Lista de coordinadores activos para el envio por WhatsApp. */
export function useCoordinadores(): Coordinador[] {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);

  useEffect(() => {
    const control = new AbortController();
    obtenerCoordinadores(control.signal)
      .then(setCoordinadores)
      .catch(() => {
        /* el envio por WhatsApp funciona igual eligiendo el contacto a mano */
      });
    return () => control.abort();
  }, []);

  return coordinadores;
}
