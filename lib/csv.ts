/**
 * CSV con BOM y punto y coma: es el formato que Excel en configuracion regional
 * en espanol abre sin pasar por el asistente de importacion.
 */
export function construirCsv(encabezados: readonly string[], filas: ReadonlyArray<readonly string[]>): string {
  const escapar = (valor: string) => `"${valor.replace(/"/g, '""')}"`;
  const contenido = [encabezados, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n');
  return `\uFEFF${contenido}`;
}

export function descargarArchivo(contenido: string, nombre: string, tipo: string): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
