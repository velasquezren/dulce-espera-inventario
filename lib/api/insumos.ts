import { normalizarCanal } from '../domain/canales';
import type { Insumo } from '../domain/tipos';
import { pedir } from './cliente';

interface InsumoDTO {
  id_publico: string;
  nombre: string | null;
  categoria: string | null;
  grupo: string | null;
  presentacion: string | null;
}

export async function obtenerInsumos(signal?: AbortSignal): Promise<Insumo[]> {
  const datos = await pedir<InsumoDTO[]>('/insumos', { signal });
  return datos.map((dto) => ({
    id: dto.id_publico,
    nombre: dto.nombre?.trim() || 'Insumo sin nombre',
    categoria: dto.categoria?.trim() || 'Otros',
    canal: normalizarCanal(dto.grupo),
    presentacion: dto.presentacion?.trim() || 'Unidades',
  }));
}
