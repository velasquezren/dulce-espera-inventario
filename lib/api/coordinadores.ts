import type { Coordinador } from '../domain/tipos';
import { pedir } from './cliente';

interface CoordinadorDTO {
  id: number;
  nombre: string | null;
  telefono: string | null;
  activo: number;
}

export async function obtenerCoordinadores(signal?: AbortSignal): Promise<Coordinador[]> {
  const datos = await pedir<CoordinadorDTO[]>('/coordinadores', { signal });
  return datos
    .filter((dto) => dto.activo === 1)
    .map((dto) => ({
      id: dto.id,
      nombre: dto.nombre?.trim() || 'Coordinador',
      telefono: (dto.telefono ?? '').replace(/\D/g, ''),
    }))
    .filter((c) => c.telefono.length > 0);
}
