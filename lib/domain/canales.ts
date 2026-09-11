import type { CanalId } from './tipos';
import type { Tono } from './tonos';

export interface Canal {
  id: CanalId;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  tono: Tono;
  /** Color solido para documentos generados en canvas e impresion. */
  color: string;
}

export const CANALES: readonly Canal[] = [
  {
    id: 'Mercado',
    nombre: 'Plaza de mercado',
    nombreCorto: 'Mercado',
    descripcion: 'Perecederos: verduras, frutas, carnes y tubérculos',
    tono: 'alerta',
    color: '#b45309',
  },
  {
    id: 'Super Mercado',
    nombre: 'Supermercado y abarrotes',
    nombreCorto: 'Supermercado',
    descripcion: 'Secos, enlatados, lácteos industriales y limpieza',
    tono: 'marca',
    color: '#006156',
  },
  {
    id: 'Proveedor',
    nombre: 'Proveedores directos',
    nombreCorto: 'Proveedor',
    descripcion: 'Distribuidoras, fórmulas clínicas y contratos',
    tono: 'info',
    color: '#4338ca',
  },
  {
    id: 'Otros',
    nombre: 'Otros insumos',
    nombreCorto: 'Otros',
    descripcion: 'Panadería diaria, descartables y misceláneos',
    tono: 'neutral',
    color: '#475569',
  },
];

const POR_ID = new Map<CanalId, Canal>(CANALES.map((c) => [c.id, c]));

const ALIAS: Record<string, CanalId> = {
  mercado: 'Mercado',
  'super mercado': 'Super Mercado',
  supermercado: 'Super Mercado',
  super: 'Super Mercado',
  proveedor: 'Proveedor',
  proveedores: 'Proveedor',
  otros: 'Otros',
};

/** Lleva cualquier variante escrita en base de datos al canal canonico. */
export function normalizarCanal(valor: string | null | undefined): CanalId {
  const clave = (valor ?? '').trim().toLowerCase();
  return ALIAS[clave] ?? 'Otros';
}

export function canal(id: CanalId): Canal {
  return POR_ID.get(id) ?? POR_ID.get('Otros')!;
}
