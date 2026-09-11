import { formatoCantidad, formatoFechaHora } from '../formato';
import { agruparPorCanal, resumenLineas } from './derivados';
import { estado as definicionEstado } from './estados';
import type { Pedido } from './tipos';

/** Texto plano para WhatsApp, con el formato de negritas que admite la app. */
export function textoWhatsApp(pedido: Pedido): string {
  const lineas: string[] = [
    '*CLINICA MONTALVO - DULCE ESPERA*',
    '*Lista de compras de cocina*',
    '',
    `Pedido: *${pedido.folio}*`,
    `Fecha: ${formatoFechaHora(pedido.fecha)}`,
    `Solicita: ${pedido.solicitante}`,
    `Estado: ${definicionEstado(pedido.estado).etiqueta}`,
  ];

  if (pedido.motivo) lineas.push(`Motivo: ${pedido.motivo}`);

  for (const grupo of agruparPorCanal(pedido.lineas)) {
    if (grupo.lineas.length === 0) continue;
    lineas.push('', `*${grupo.canal.nombre.toUpperCase()}* (${grupo.lineas.length})`);
    grupo.lineas.forEach((linea, indice) => {
      lineas.push(`${indice + 1}. ${linea.nombre} - ${formatoCantidad(linea.cantidad)} ${linea.presentacion}`);
    });
  }

  lineas.push('', `Total: ${resumenLineas(pedido.lineas)}`);

  return lineas.join('\n');
}

export function enlaceWhatsApp(texto: string, telefono?: string): string {
  const base = telefono ? `https://wa.me/${telefono}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(texto)}`;
}
