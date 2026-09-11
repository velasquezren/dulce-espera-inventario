'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { CLAVES } from '../almacenamiento';
import type { Insumo } from '../domain/tipos';
import { useAlmacen } from './use-almacen';

/** Linea anotada en el cuaderno antes de convertirse en pedido. */
export interface Anotacion {
  insumoId: string;
  nombre: string;
  presentacion: string;
  cantidad: number;
}

interface Valor {
  anotaciones: Anotacion[];
  cantidades: Map<string, number>;
  total: number;
  fijar: (insumo: Insumo, cantidad: number) => void;
  quitar: (insumoId: string) => void;
  vaciar: () => void;
}

const Contexto = createContext<Valor | null>(null);

const VACIO: Anotacion[] = [];

export function CuadernoProvider({ children }: { children: React.ReactNode }) {
  const [anotaciones, guardar] = useAlmacen<Anotacion[]>(CLAVES.cuaderno, VACIO);

  const fijar = useCallback(
    (insumo: Insumo, cantidad: number) => {
      const valor = Math.max(0, Math.floor(cantidad));
      guardar((previas) => {
        if (valor === 0) return previas.filter((a) => a.insumoId !== insumo.id);

        const indice = previas.findIndex((a) => a.insumoId === insumo.id);
        if (indice === -1) {
          return [
            ...previas,
            {
              insumoId: insumo.id,
              nombre: insumo.nombre,
              presentacion: insumo.presentacion,
              cantidad: valor,
            },
          ];
        }

        const siguiente = [...previas];
        siguiente[indice] = { ...siguiente[indice], cantidad: valor };
        return siguiente;
      });
    },
    [guardar],
  );

  const quitar = useCallback(
    (insumoId: string) => guardar((previas) => previas.filter((a) => a.insumoId !== insumoId)),
    [guardar],
  );

  const vaciar = useCallback(() => guardar(VACIO), [guardar]);

  const cantidades = useMemo(
    () => new Map(anotaciones.map((a) => [a.insumoId, a.cantidad])),
    [anotaciones],
  );

  const valor = useMemo<Valor>(
    () => ({ anotaciones, cantidades, total: anotaciones.length, fijar, quitar, vaciar }),
    [anotaciones, cantidades, fijar, quitar, vaciar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCuaderno(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useCuaderno requiere <CuadernoProvider>');
  return valor;
}
