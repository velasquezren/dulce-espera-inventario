import { formatoCantidad } from '../formato';
import { pluralizar } from '../texto';
import { CANALES } from './canales';
import { esperaRecepcion } from './estados';
import type { CanalId, LineaPedido, Pedido } from './tipos';

export interface Movimiento {
  id: string;
  fecha: string;
  tipo: 'Solicitud' | 'Recepcion';
  insumoId: string;
  nombre: string;
  presentacion: string;
  cantidad: number;
  canal: CanalId;
  responsable: string;
  detalle: string;
}

/**
 * La bitacora se deriva de los pedidos: cada linea genera una solicitud y, si el
 * pedido ya fue entregado, tambien una recepcion en cocina.
 */
export function movimientosDesde(pedidos: readonly Pedido[]): Movimiento[] {
  const movimientos: Movimiento[] = [];

  for (const pedido of pedidos) {
    for (const linea of pedido.lineas) {
      movimientos.push({
        id: `sol-${pedido.id}-${linea.id}`,
        fecha: pedido.fecha,
        tipo: 'Solicitud',
        insumoId: linea.insumoId,
        nombre: linea.nombre,
        presentacion: linea.presentacion,
        cantidad: linea.cantidad,
        canal: linea.canal,
        responsable: pedido.solicitante,
        detalle: `Pedido ${pedido.folio}`,
      });

      if (pedido.estado === 'entregado') {
        movimientos.push({
          id: `rec-${pedido.id}-${linea.id}`,
          fecha: pedido.fechaEstado || pedido.fecha,
          tipo: 'Recepcion',
          insumoId: linea.insumoId,
          nombre: linea.nombre,
          presentacion: linea.presentacion,
          cantidad: linea.cantidad,
          canal: linea.canal,
          responsable: pedido.solicitante,
          detalle: `Recibido en cocina · ${pedido.folio}`,
        });
      }
    }
  }

  return movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

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

export function totalUnidades(lineas: readonly LineaPedido[]): number {
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
