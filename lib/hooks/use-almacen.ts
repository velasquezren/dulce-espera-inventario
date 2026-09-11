'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { borrar, escribir, leer } from '../almacenamiento';

type Oyente = () => void;

const oyentes = new Map<string, Set<Oyente>>();
const valores = new Map<string, unknown>();

function instantanea<T>(clave: string, porDefecto: T): T {
  if (!valores.has(clave)) valores.set(clave, leer<T>(clave, porDefecto));
  return valores.get(clave) as T;
}

function suscribir(clave: string, oyente: Oyente): () => void {
  const grupo = oyentes.get(clave) ?? new Set<Oyente>();
  grupo.add(oyente);
  oyentes.set(clave, grupo);
  return () => grupo.delete(oyente);
}

/**
 * Actualiza el valor y notifica a los componentes suscritos. Con
 * `persistir: false` el dato vive solo en memoria y se pierde al recargar,
 * que es lo que corresponde cuando el usuario no quiere dejar la sesion abierta.
 */
export function escribirAlmacen<T>(clave: string, valor: T, persistir = true): void {
  valores.set(clave, valor);
  if (persistir) escribir(clave, valor);
  else borrar(clave);
  oyentes.get(clave)?.forEach((oyente) => oyente());
}

type Actualizador<T> = T | ((previo: T) => T);

/**
 * Estado persistido como store externo. Durante el render del servidor y la
 * hidratacion devuelve el valor por defecto y marca `hidratado` en false, con
 * lo que se evitan tanto los desajustes de hidratacion como los efectos que
 * escriben estado en cascada.
 *
 * `porDefecto` debe ser una constante estable (definida fuera del componente).
 */
export function useAlmacen<T>(
  clave: string,
  porDefecto: T,
): readonly [T, (valor: Actualizador<T>, persistir?: boolean) => void, boolean] {
  const alSuscribir = useCallback((oyente: Oyente) => suscribir(clave, oyente), [clave]);
  const obtener = useCallback(() => instantanea<T>(clave, porDefecto), [clave, porDefecto]);
  const enServidor = useCallback(() => undefined, []);

  const valor = useSyncExternalStore<T | undefined>(alSuscribir, obtener, enServidor);
  // Acepta una funcion para que el setter no dependa del valor actual y
  // conserve su identidad entre renders.
  const guardar = useCallback(
    (siguiente: Actualizador<T>, persistir = true) => {
      const resuelto =
        typeof siguiente === 'function'
          ? (siguiente as (previo: T) => T)(instantanea<T>(clave, porDefecto))
          : siguiente;
      escribirAlmacen(clave, resuelto, persistir);
    },
    [clave, porDefecto],
  );

  return [valor === undefined ? porDefecto : valor, guardar, valor !== undefined] as const;
}
