'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { escribir, leer } from './almacenamiento';

/**
 * Datos remotos con cache local, fuera del arbol de React.
 *
 * La carga la dispara la primera suscripcion y no el render, de modo que:
 * - solo se pide una vez aunque varios componentes usen el mismo recurso,
 * - navegar entre secciones no vuelve a descargar el catalogo,
 * - la copia guardada en el dispositivo se muestra de inmediato sin conexion.
 */

export interface EstadoRecurso<T> {
  datos: T;
  cargando: boolean;
  error: string | null;
}

type Cargador<T> = (signal?: AbortSignal) => Promise<T>;

interface Registro<T> {
  clave: string;
  cargar: Cargador<T>;
  estado: EstadoRecurso<T>;
  estadoServidor: EstadoRecurso<T>;
  oyentes: Set<() => void>;
  iniciado: boolean;
  enCurso: boolean;
}

const registros = new Map<string, Registro<unknown>>();

function registroDe<T>(clave: string, cargar: Cargador<T>, porDefecto: T): Registro<T> {
  const existente = registros.get(clave);
  if (existente) return existente as Registro<T>;

  const nuevo: Registro<T> = {
    clave,
    cargar,
    estado: { datos: leer<T>(clave, porDefecto), cargando: true, error: null },
    estadoServidor: { datos: porDefecto, cargando: true, error: null },
    oyentes: new Set(),
    iniciado: false,
    enCurso: false,
  };
  registros.set(clave, nuevo as Registro<unknown>);
  return nuevo;
}

function actualizar<T>(item: Registro<T>, parcial: Partial<EstadoRecurso<T>>): void {
  item.estado = { ...item.estado, ...parcial };
  item.oyentes.forEach((oyente) => oyente());
}

async function descargar<T>(item: Registro<T>, marcarCarga: boolean): Promise<void> {
  if (item.enCurso) return;
  item.enCurso = true;
  if (marcarCarga && !item.estado.cargando) actualizar(item, { cargando: true });

  try {
    const datos = await item.cargar();
    escribir(item.clave, datos);
    actualizar(item, { datos, cargando: false, error: null });
  } catch (e) {
    actualizar(item, {
      cargando: false,
      error: e instanceof Error ? e.message : 'No se pudo obtener la información',
    });
  } finally {
    item.enCurso = false;
  }
}

/** Descarta los datos en memoria; se usa al cerrar sesion en un equipo compartido. */
export function limpiarRecursos(): void {
  registros.clear();
}

export interface Recurso<T> extends EstadoRecurso<T> {
  refrescar: () => Promise<void>;
  establecer: (datos: T) => void;
}

/**
 * `cargar` y `porDefecto` deben ser referencias estables (definidas a nivel de
 * modulo), porque identifican al recurso junto con la clave.
 */
export function useRecurso<T>(clave: string, cargar: Cargador<T>, porDefecto: T): Recurso<T> {
  const suscribir = useCallback(
    (oyente: () => void) => {
      const item = registroDe(clave, cargar, porDefecto);
      item.oyentes.add(oyente);
      if (!item.iniciado) {
        item.iniciado = true;
        void descargar(item, false);
      }
      return () => {
        item.oyentes.delete(oyente);
      };
    },
    [clave, cargar, porDefecto],
  );

  const instantanea = useCallback(
    () => registroDe(clave, cargar, porDefecto).estado,
    [clave, cargar, porDefecto],
  );

  const instantaneaServidor = useCallback(
    () => registroDe(clave, cargar, porDefecto).estadoServidor,
    [clave, cargar, porDefecto],
  );

  const estado = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);

  const refrescar = useCallback(
    () => descargar(registroDe(clave, cargar, porDefecto), true),
    [clave, cargar, porDefecto],
  );

  const establecer = useCallback(
    (datos: T) => {
      const item = registroDe(clave, cargar, porDefecto);
      escribir(item.clave, datos);
      actualizar(item, { datos });
    },
    [clave, cargar, porDefecto],
  );

  return { ...estado, refrescar, establecer };
}
