import { normalizarCanal } from '../domain/canales';
import { normalizarEstado } from '../domain/estados';
import type { EstadoPedido, LineaNueva, Pedido } from '../domain/tipos';
import { pedir } from './cliente';

interface LineaDTO {
  id_publico: string;
  insumo_id_publico: string;
  cantidad: string | number;
  nombre_insumo: string | null;
  categoria_insumo: string | null;
  grupo_insumo: string | null;
  presentacion_insumo: string | null;
}

interface PedidoDTO {
  id_publico: string;
  solicitante: string | null;
  fecha_solicitud: string | null;
  fecha_estado: string | null;
  estado: string | null;
  motivo: string | null;
  lineas: LineaDTO[] | null;
}

export function folioDe(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function mapear(dto: PedidoDTO): Pedido {
  const fecha = dto.fecha_solicitud ?? '';
  return {
    id: dto.id_publico,
    folio: folioDe(dto.id_publico),
    solicitante: dto.solicitante?.trim() || 'Sin solicitante',
    fecha,
    fechaEstado: dto.fecha_estado ?? fecha,
    estado: normalizarEstado(dto.estado),
    motivo: dto.motivo?.trim() ?? '',
    lineas: (dto.lineas ?? []).map((linea) => ({
      id: linea.id_publico,
      insumoId: linea.insumo_id_publico,
      nombre: linea.nombre_insumo?.trim() || 'Insumo sin nombre',
      categoria: linea.categoria_insumo?.trim() || 'Otros',
      canal: normalizarCanal(linea.grupo_insumo),
      presentacion: linea.presentacion_insumo?.trim() || 'Unidades',
      cantidad: Number(linea.cantidad) || 0,
    })),
  };
}

export async function obtenerPedidos(signal?: AbortSignal): Promise<Pedido[]> {
  const datos = await pedir<PedidoDTO[]>('/pedidos/todos', { signal });
  return datos.map(mapear).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function crearPedido(
  solicitante: string,
  lineas: LineaNueva[],
  motivo?: string,
): Promise<void> {
  await pedir('/pedidos', {
    metodo: 'POST',
    cuerpo: {
      solicitante,
      lineas: lineas.map((l) => ({ insumo_id_publico: l.insumoId, cantidad: l.cantidad })),
      motivo: motivo?.trim() || null,
    },
  });
}

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido): Promise<void> {
  await pedir('/pedidos/actualizar-estado', {
    metodo: 'PATCH',
    cuerpo: { id_publico: id, estado },
  });
}
