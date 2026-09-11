'use client';

import { useCallback, useMemo } from 'react';
import { useAlmacen } from './use-almacen';

const VACIO: string[] = [];

export interface Checklist {
  marcadas: Set<string>;
  alternar: (id: string) => void;
  contar: (ids: readonly string[]) => number;
}

/**
 * Lista de verificacion guardada en el dispositivo. Es una ayuda para quien
 * esta haciendo la tarea (comprar o recibir), no un dato del pedido: por eso no
 * viaja al servidor y se limpia sola cuando las lineas dejan de existir.
 */
export function useChecklist(clave: string, vigentes: Set<string>): Checklist {
  const [guardadas, guardar] = useAlmacen<string[]>(clave, VACIO);

  const marcadas = useMemo(() => new Set(guardadas), [guardadas]);

  const alternar = useCallback(
    (id: string) => {
      guardar((previas) => {
        const siguiente = new Set(previas);
        if (siguiente.has(id)) siguiente.delete(id);
        else siguiente.add(id);
        return [...siguiente].filter((marcada) => vigentes.has(marcada));
      });
    },
    [guardar, vigentes],
  );

  const contar = useCallback(
    (ids: readonly string[]) => ids.reduce((total, id) => total + (marcadas.has(id) ? 1 : 0), 0),
    [marcadas],
  );

  return { marcadas, alternar, contar };
}
