'use client';

import { createContext, useContext, useMemo } from 'react';
import { obtenerInsumos } from '../api/insumos';
import { CLAVES } from '../almacenamiento';
import { useRecurso } from '../recurso';
import type { Insumo } from '../domain/tipos';

type Estado = 'cargando' | 'listo' | 'error';

interface Valor {
  insumos: Insumo[];
  porId: Map<string, Insumo>;
  estado: Estado;
  error: string | null;
  recargar: () => Promise<void>;
}

const Contexto = createContext<Valor | null>(null);

const VACIO: Insumo[] = [];

export function CatalogoProvider({ children }: { children: React.ReactNode }) {
  const { datos: insumos, cargando, error, refrescar } = useRecurso(CLAVES.catalogo, obtenerInsumos, VACIO);

  const porId = useMemo(() => new Map(insumos.map((i) => [i.id, i])), [insumos]);

  const estado: Estado = insumos.length > 0 ? 'listo' : cargando ? 'cargando' : error ? 'error' : 'listo';

  const valor = useMemo<Valor>(
    () => ({ insumos, porId, estado, error, recargar: refrescar }),
    [insumos, porId, estado, error, refrescar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCatalogo(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useCatalogo requiere <CatalogoProvider>');
  return valor;
}
