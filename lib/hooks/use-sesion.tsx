'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { autenticar } from '../api/sesion';
import { ErrorRed } from '../api/cliente';
import { CLAVES, limpiarLegado } from '../almacenamiento';
import { limpiarRecursos } from '../recurso';
import type { Rol, Sesion } from '../domain/tipos';
import { useAlmacen } from './use-almacen';

type Estado = 'cargando' | 'activa' | 'anonima';

export type ResultadoAcceso = { ok: true } | { ok: false; motivo: 'credenciales' | 'red'; mensaje: string };

interface Valor {
  estado: Estado;
  sesion: Sesion | null;
  acceder: (usuario: string, clave: string, recordar: boolean) => Promise<ResultadoAcceso>;
  accederComoCompras: () => void;
  salir: () => void;
}

const Contexto = createContext<Valor | null>(null);

const SIN_SESION: Sesion | null = null;

function esSesion(valor: unknown): valor is Sesion {
  if (!valor || typeof valor !== 'object') return false;
  const s = valor as Partial<Sesion>;
  return typeof s.nombre === 'string' && typeof s.usuario === 'string' && typeof s.rol === 'string';
}

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const [guardada, guardar, hidratado] = useAlmacen<Sesion | null>(CLAVES.sesion, SIN_SESION);

  useEffect(() => {
    limpiarLegado();
  }, []);

  const sesion = useMemo(() => (esSesion(guardada) ? guardada : null), [guardada]);
  const estado: Estado = !hidratado ? 'cargando' : sesion ? 'activa' : 'anonima';

  const acceder = useCallback(
    async (usuario: string, clave: string, recordar: boolean): Promise<ResultadoAcceso> => {
      try {
        const nueva = await autenticar(usuario, clave);
        guardar(nueva, recordar);
        return { ok: true };
      } catch (error) {
        if (error instanceof ErrorRed) {
          return {
            ok: false,
            motivo: 'red',
            mensaje: 'Sin conexión con el servidor. Verifica la red e intenta de nuevo.',
          };
        }
        return { ok: false, motivo: 'credenciales', mensaje: 'Usuario o contraseña incorrectos.' };
      }
    },
    [guardar],
  );

  /**
   * Acceso rapido del area de compras: abre la sesion en el dispositivo sin
   * validar contra la API, porque compras opera desde un equipo compartido que
   * no tiene credenciales propias.
   */
  const accederComoCompras = useCallback(() => {
    guardar({ nombre: 'Encargada de compras', usuario: 'compras', rol: 'compras' as Rol, token: '' });
  }, [guardar]);

  const salir = useCallback(() => {
    // El equipo de cocina es compartido: no debe quedar informacion del turno anterior.
    limpiarRecursos();
    guardar(null);
  }, [guardar]);

  const valor = useMemo<Valor>(
    () => ({ estado, sesion, acceder, accederComoCompras, salir }),
    [estado, sesion, acceder, accederComoCompras, salir],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSesion requiere <SesionProvider>');
  return valor;
}
