/**
 * El formateo es manual y no usa Intl a proposito: garantiza el mismo resultado
 * en servidor y navegador, sin depender del locale del dispositivo.
 */

/** Extrae YYYY-MM-DD de una fecha ISO local. */
function soloDia(iso: string): string {
  return iso.slice(0, 10);
}

export function soloHora(iso: string): string {
  return iso.slice(11, 16);
}

export function formatoFecha(iso: string): string {
  const [anio, mes, dia] = soloDia(iso).split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}

export function formatoFechaHora(iso: string): string {
  const hora = soloHora(iso);
  return hora ? `${formatoFecha(iso)} · ${hora}` : formatoFecha(iso);
}

/** Cantidades enteras sin decimales sobrantes; decimales con dos posiciones. */
export function formatoCantidad(valor: number): string {
  if (!Number.isFinite(valor)) return '0';
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
}

/** Marca de tiempo local con el mismo formato que devuelve la API. */
export function ahoraLocalISO(): string {
  const ahora = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}` +
    `T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`
  );
}

export function hoyISO(): string {
  return ahoraLocalISO().slice(0, 10);
}
