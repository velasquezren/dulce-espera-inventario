import { ahoraLocalISO } from './formato';
import type { LineaNueva } from './domain/tipos';

/** Pedido capturado sin conexion, a la espera de confirmarse contra la API. */
export interface PedidoEnCola {
  id: string;
  solicitante: string;
  lineas: LineaNueva[];
  motivo?: string;
  creado: string;
}

export function nuevoPendiente(entrada: Omit<PedidoEnCola, 'id' | 'creado'>): PedidoEnCola {
  return {
    ...entrada,
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    creado: ahoraLocalISO(),
  };
}
