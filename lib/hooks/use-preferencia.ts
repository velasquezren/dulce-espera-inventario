'use client';

import { useCallback, useMemo } from 'react';
import { CLAVES } from '../almacenamiento';
import { useAlmacen } from './use-almacen';

type Preferencias = Record<string, unknown>;

const VACIO: Preferencias = {};

/** Preferencia de interfaz persistida por dispositivo. */
export function usePreferencia<T>(clave: string, porDefecto: T): [T, (valor: T) => void] {
  const [todas, guardarTodas] = useAlmacen<Preferencias>(CLAVES.interfaz, VACIO);

  const valor = useMemo(() => (clave in todas ? (todas[clave] as T) : porDefecto), [todas, clave, porDefecto]);

  const actualizar = useCallback(
    (siguiente: T) => guardarTodas({ ...todas, [clave]: siguiente }),
    [guardarTodas, todas, clave],
  );

  return [valor, actualizar];
}
