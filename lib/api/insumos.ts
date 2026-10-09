import { normalizarCanal } from '../domain/canales';
import { presentacionLegible } from '../domain/presentacion';
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
  return datos.map((dto) => {
    const nombre = dto.nombre?.trim() || 'Insumo sin nombre';
    return {
      id: dto.id_publico,
      nombre,
      categoria: dto.categoria?.trim() || 'Otros',
      canal: normalizarCanal(dto.grupo),
      presentacion: presentacionLegible(nombre, dto.presentacion),
    };
  });
}
