import { normalizar } from '../texto';

/**
 * Unidad legible de un insumo.
 *
 * En el catálogo hay 447 insumos (de 771) cuya unidad es una copia del nombre,
 * y la pantalla terminaba diciendo "2 aceite fino de 4,800ml" en vez de
 * "2 Unidad". Cuando la unidad no aporta nada se reemplaza por Unidad, y en el
 * resto solo se corrige el uso de mayúsculas: kilos, KILOS y Kilos eran tres
 * unidades distintas en la misma lista.
 */
export function presentacionLegible(nombre: string, unidad: string | null | undefined): string {
  const texto = (unidad ?? '').trim();
  if (!texto || normalizar(texto) === normalizar(nombre)) return 'Unidad';
  if (texto === texto.toUpperCase()) {
    return texto.charAt(0) + texto.slice(1).toLowerCase();
  }
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
