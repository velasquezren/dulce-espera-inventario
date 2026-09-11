'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { cambiarEstadoPedido, crearPedido, folioDe, obtenerPedidos } from '../api/pedidos';
import { ErrorRed } from '../api/cliente';
import { CLAVES } from '../almacenamiento';
import { nuevoPendiente, type PedidoEnCola } from '../cola';
import { ahoraLocalISO } from '../formato';
import { useRecurso } from '../recurso';
import type { EstadoPedido, LineaNueva, Pedido } from '../domain/tipos';
import { useAlmacen } from './use-almacen';
import { useCatalogo } from './use-catalogo';
import { useEnLinea } from './use-conexion';

type Estado = 'cargando' | 'listo' | 'error';

interface Valor {
  pedidos: Pedido[];
  estado: Estado;
  error: string | null;
  enCola: number;
  recargar: () => Promise<void>;
  enviar: (solicitante: string, lineas: LineaNueva[], motivo?: string) => Promise<{ diferido: boolean }>;
  cambiarEstado: (id: string, estado: EstadoPedido) => Promise<void>;
}

const Contexto = createContext<Valor | null>(null);

const SIN_PEDIDOS: Pedido[] = [];
const SIN_COLA: PedidoEnCola[] = [];

export function PedidosProvider({ children }: { children: React.ReactNode }) {
  const { porId } = useCatalogo();
  const enLinea = useEnLinea();

  const { datos: pedidos, cargando, error, refrescar, establecer } = useRecurso(
    CLAVES.pedidos,
    obtenerPedidos,
    SIN_PEDIDOS,
  );
  const [cola, guardarCola] = useAlmacen<PedidoEnCola[]>(CLAVES.cola, SIN_COLA);

  /** Pedido visible de inmediato mientras el servidor no lo confirma. */
  const construirOptimista = useCallback(
    (id: string, solicitante: string, lineas: LineaNueva[], motivo?: string): Pedido => {
      const fecha = ahoraLocalISO();
      return {
        id,
        folio: folioDe(id.replace(/^local-/, '')),
        solicitante,
        fecha,
        fechaEstado: fecha,
        estado: 'pendiente',
        motivo: motivo?.trim() ?? '',
        enCola: true,
        lineas: lineas.map((linea, indice) => {
          const insumo = porId.get(linea.insumoId);
          return {
            id: `${id}-${indice}`,
            insumoId: linea.insumoId,
            nombre: insumo?.nombre ?? 'Insumo',
            categoria: insumo?.categoria ?? 'Otros',
            canal: insumo?.canal ?? 'Otros',
            presentacion: insumo?.presentacion ?? 'Unidades',
            cantidad: linea.cantidad,
          };
        }),
      };
    },
    [porId],
  );

  const enviar = useCallback<Valor['enviar']>(
    async (solicitante, lineas, motivo) => {
      const diferir = () => {
        const pendiente = nuevoPendiente({ solicitante, lineas, motivo });
        guardarCola([...cola, pendiente]);
        establecer([construirOptimista(pendiente.id, solicitante, lineas, motivo), ...pedidos]);
        return { diferido: true };
      };

      if (!enLinea) return diferir();

      try {
        await crearPedido(solicitante, lineas, motivo);
      } catch (e) {
        if (e instanceof ErrorRed) return diferir();
        throw e;
      }
      await refrescar();
      return { diferido: false };
    },
    [cola, pedidos, construirOptimista, enLinea, establecer, guardarCola, refrescar],
  );

  const cambiarEstado = useCallback<Valor['cambiarEstado']>(
    async (id, siguienteEstado) => {
      const previos = pedidos;
      establecer(
        pedidos.map((p) => (p.id === id ? { ...p, estado: siguienteEstado, fechaEstado: ahoraLocalISO() } : p)),
      );
      try {
        await cambiarEstadoPedido(id, siguienteEstado);
        await refrescar();
      } catch (e) {
        establecer(previos);
        throw e;
      }
    },
    [pedidos, establecer, refrescar],
  );

  // Al recuperar la conexion se vacia la cola local respetando el orden original.
  useEffect(() => {
    if (!enLinea || cola.length === 0) return;
    let cancelado = false;

    const vaciar = async () => {
      const restantes = [...cola];
      let enviados = 0;

      for (const pendiente of cola) {
        try {
          await crearPedido(pendiente.solicitante, pendiente.lineas, pendiente.motivo);
          restantes.shift();
          enviados += 1;
        } catch {
          break;
        }
      }

      if (cancelado || enviados === 0) return;
      guardarCola(restantes);
      await refrescar();
    };

    void vaciar();
    return () => {
      cancelado = true;
    };
  }, [enLinea, cola, guardarCola, refrescar]);

  const estado: Estado = pedidos.length > 0 ? 'listo' : cargando ? 'cargando' : error ? 'error' : 'listo';

  const valor = useMemo<Valor>(
    () => ({ pedidos, estado, error, enCola: cola.length, recargar: refrescar, enviar, cambiarEstado }),
    [pedidos, estado, error, cola.length, refrescar, enviar, cambiarEstado],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePedidos(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('usePedidos requiere <PedidosProvider>');
  return valor;
}
