import type { EstadoPedido } from './tipos';
import type { Tono } from './tonos';

interface DefinicionEstado {
  etiqueta: string;
  tono: Tono;
  descripcion: string;
}

export const ESTADOS: Record<EstadoPedido, DefinicionEstado> = {
  pendiente: {
    etiqueta: 'Pendiente',
    tono: 'alerta',
    descripcion: 'Enviado a gobernanta, aún sin revisar',
  },
  'en revision': {
    etiqueta: 'En revisión',
    tono: 'alerta',
    descripcion: 'Compras está evaluando la solicitud',
  },
  aceptado: {
    etiqueta: 'Aceptado',
    tono: 'info',
    descripcion: 'Autorizado para compra',
  },
  comprado: {
    etiqueta: 'Comprado',
    tono: 'info',
    descripcion: 'Adquirido, en camino a cocina',
  },
  entregado: {
    etiqueta: 'Entregado',
    tono: 'exito',
    descripcion: 'Recibido y verificado en cocina',
  },
  rechazado: {
    etiqueta: 'Rechazado',
    tono: 'critico',
    descripcion: 'No autorizado por compras',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    tono: 'critico',
    descripcion: 'Anulado antes de completarse',
  },
};

export const ORDEN_ESTADOS: readonly EstadoPedido[] = [
  'pendiente',
  'en revision',
  'aceptado',
  'comprado',
  'entregado',
  'rechazado',
  'cancelado',
];

const ALIAS: Record<string, EstadoPedido> = {
  pendiente: 'pendiente',
  'en revision': 'en revision',
  'en revisión': 'en revision',
  aceptado: 'aceptado',
  aprobado: 'aceptado',
  comprado: 'comprado',
  entregado: 'entregado',
  rechazado: 'rechazado',
  cancelado: 'cancelado',
};

export function normalizarEstado(valor: string | null | undefined): EstadoPedido {
  return ALIAS[(valor ?? '').trim().toLowerCase()] ?? 'pendiente';
}

export function estado(id: EstadoPedido): DefinicionEstado {
  return ESTADOS[id];
}

/** Estados que todavia esperan la llegada fisica de la mercaderia a cocina. */
export const ESTADOS_POR_RECIBIR: readonly EstadoPedido[] = ['en revision', 'aceptado', 'comprado'];

export function esperaRecepcion(valor: EstadoPedido): boolean {
  return ESTADOS_POR_RECIBIR.includes(valor);
}

export function estaAbierto(valor: EstadoPedido): boolean {
  return valor === 'pendiente' || valor === 'en revision';
}
