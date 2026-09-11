import { formatoCantidad } from '../formato';
import { pluralizar } from '../texto';
import { CANALES } from './canales';
import { esperaRecepcion } from './estados';
import type { LineaPedido, Pedido } from './tipos';

export function pedidosPorRecibir(pedidos: readonly Pedido[]): Pedido[] {
  return pedidos.filter((p) => !p.enCola && esperaRecepcion(p.estado));
}

export interface GrupoCanal {
  canal: (typeof CANALES)[number];
  lineas: LineaPedido[];
  unidades: number;
}

/** Agrupa las lineas por canal respetando el orden operativo de compra. */
export function agruparPorCanal(lineas: readonly LineaPedido[]): GrupoCanal[] {
  return CANALES.map((canal) => {
    const propias = lineas.filter((l) => l.canal === canal.id);
    return {
      canal,
      lineas: [...propias].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre)),
      unidades: propias.reduce((suma, l) => suma + l.cantidad, 0),
    };
  });
}

function totalUnidades(lineas: readonly LineaPedido[]): number {
  return lineas.reduce((suma, l) => suma + l.cantidad, 0);
}

/** Redaccion unica del volumen de un pedido, con concordancia de plural. */
export function resumenLineas(lineas: readonly LineaPedido[]): string {
  const unidades = totalUnidades(lineas);
  return (
    `${lineas.length} ${pluralizar(lineas.length, 'insumo', 'insumos')}` +
    ` · ${formatoCantidad(unidades)} ${pluralizar(unidades, 'unidad', 'unidades')}`
  );
}
