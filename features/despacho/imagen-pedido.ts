import { agruparPorCanal, resumenLineas } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFechaHora } from '@/lib/formato';

/**
 * Genera la hoja del pedido como imagen PNG de alta densidad para compartirla o
 * archivarla. Se carga bajo demanda para no pesar en el paquete inicial.
 */

const ANCHO = 640;
const MARGEN = 32;
const ESCALA = 3;

const COLOR = {
  tinta: '#0f172a',
  suave: '#475569',
  tenue: '#94a3b8',
  linea: '#e2e8f0',
  marca: '#006156',
  fondoSuave: '#f8fafc',
};

const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function fuente(peso: number, tamano: number): string {
  return `${peso} ${tamano}px ${FUENTE}`;
}

function partirTexto(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [''];

  const lineas: string[] = [];
  let actual = palabras[0];

  for (const palabra of palabras.slice(1)) {
    const tentativa = `${actual} ${palabra}`;
    if (ctx.measureText(tentativa).width <= ancho) actual = tentativa;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  lineas.push(actual);
  return lineas;
}

async function cargarLogo(): Promise<HTMLImageElement | null> {
  try {
    const imagen = new Image();
    imagen.src = '/logo.svg';
    await imagen.decode();
    return imagen;
  } catch {
    return null;
  }
}

interface Bloque {
  tipo: 'canal' | 'linea';
  texto: string;
  detalle?: string;
  color?: string;
  alto: number;
}

function componer(ctx: CanvasRenderingContext2D, pedido: Pedido): { bloques: Bloque[]; motivo: string[] } {
  const anchoUtil = ANCHO - MARGEN * 2;
  const bloques: Bloque[] = [];

  ctx.font = fuente(500, 13);
  const motivo = pedido.motivo ? partirTexto(ctx, pedido.motivo, anchoUtil - 24) : [];

  for (const grupo of agruparPorCanal(pedido.lineas)) {
    if (grupo.lineas.length === 0) continue;

    bloques.push({
      tipo: 'canal',
      texto: `${grupo.canal.nombre.toUpperCase()} · ${grupo.lineas.length}`,
      color: grupo.canal.color,
      alto: 34,
    });

    grupo.lineas.forEach((linea, indice) => {
      ctx.font = fuente(500, 13);
      const lineas = partirTexto(ctx, `${indice + 1}. ${linea.nombre}`, anchoUtil - 130);
      bloques.push({
        tipo: 'linea',
        texto: lineas.join('\n'),
        detalle: `${formatoCantidad(linea.cantidad)} ${linea.presentacion}`,
        alto: Math.max(26, lineas.length * 18 + 8),
      });
    });
  }

  return { bloques, motivo };
}

export async function generarImagenPedido(pedido: Pedido): Promise<Blob> {
  const medidor = document.createElement('canvas').getContext('2d');
  if (!medidor) throw new Error('El navegador no permite generar la imagen');

  const { bloques, motivo } = componer(medidor, pedido);

  const altoEncabezado = 132;
  const altoMotivo = motivo.length > 0 ? motivo.length * 18 + 34 : 0;
  const altoCuerpo = bloques.reduce((suma, bloque) => suma + bloque.alto, 0);
  const altoPie = 148;
  const alto = altoEncabezado + altoMotivo + altoCuerpo + altoPie;

  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO * ESCALA;
  lienzo.height = alto * ESCALA;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('El navegador no permite generar la imagen');
  ctx.scale(ESCALA, ESCALA);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, ANCHO, alto);

  const logo = await cargarLogo();
  let y = MARGEN;

  if (logo) ctx.drawImage(logo, MARGEN, y - 4, 42, 42);

  ctx.fillStyle = COLOR.marca;
  ctx.font = fuente(600, 17);
  ctx.fillText('CLINICA MONTALVO', MARGEN + (logo ? 54 : 0), y + 14);

  ctx.fillStyle = COLOR.suave;
  ctx.font = fuente(500, 12);
  ctx.fillText('Dulce Espera · Insumos de cocina', MARGEN + (logo ? 54 : 0), y + 32);

  y += 60;

  ctx.strokeStyle = COLOR.marca;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGEN, y);
  ctx.lineTo(ANCHO - MARGEN, y);
  ctx.stroke();

  y += 24;

  ctx.fillStyle = COLOR.tinta;
  ctx.font = fuente(600, 15);
  ctx.fillText(`Pedido ${pedido.folio}`, MARGEN, y);

  ctx.fillStyle = COLOR.suave;
  ctx.font = fuente(500, 12);
  ctx.textAlign = 'right';
  ctx.fillText(definicionEstado(pedido.estado).etiqueta.toUpperCase(), ANCHO - MARGEN, y);
  ctx.textAlign = 'left';

  y += 20;
  ctx.fillStyle = COLOR.tenue;
  ctx.font = fuente(500, 12);
  ctx.fillText(`${formatoFechaHora(pedido.fecha)} · ${pedido.solicitante}`, MARGEN, y);

  y += 28;

  if (motivo.length > 0) {
    const altoCaja = motivo.length * 18 + 22;
    ctx.fillStyle = COLOR.fondoSuave;
    ctx.fillRect(MARGEN, y, ANCHO - MARGEN * 2, altoCaja);
    ctx.fillStyle = COLOR.marca;
    ctx.fillRect(MARGEN, y, 3, altoCaja);

    ctx.fillStyle = COLOR.suave;
    ctx.font = fuente(500, 13);
    motivo.forEach((linea, indice) => {
      ctx.fillText(linea, MARGEN + 14, y + 22 + indice * 18);
    });

    y += altoCaja + 12;
  }

  for (const bloque of bloques) {
    if (bloque.tipo === 'canal') {
      ctx.fillStyle = COLOR.fondoSuave;
      ctx.fillRect(MARGEN, y, ANCHO - MARGEN * 2, 26);
      ctx.fillStyle = bloque.color ?? COLOR.marca;
      ctx.font = fuente(600, 11);
      ctx.fillText(bloque.texto, MARGEN + 10, y + 17);
      y += bloque.alto;
      continue;
    }

    ctx.fillStyle = COLOR.tinta;
    ctx.font = fuente(500, 13);
    bloque.texto.split('\n').forEach((linea, indice) => {
      ctx.fillText(linea, MARGEN + 10, y + 16 + indice * 18);
    });

    ctx.fillStyle = COLOR.suave;
    ctx.font = fuente(600, 13);
    ctx.textAlign = 'right';
    ctx.fillText(bloque.detalle ?? '', ANCHO - MARGEN - 10, y + 16);
    ctx.textAlign = 'left';

    ctx.strokeStyle = COLOR.linea;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGEN + 10, y + bloque.alto - 2);
    ctx.lineTo(ANCHO - MARGEN - 10, y + bloque.alto - 2);
    ctx.stroke();

    y += bloque.alto;
  }

  y += 18;
  ctx.fillStyle = COLOR.tinta;
  ctx.font = fuente(600, 13);
  ctx.fillText(`Total: ${resumenLineas(pedido.lineas)}`, MARGEN, y);

  y += 46;
  ctx.strokeStyle = COLOR.linea;
  ctx.lineWidth = 1;
  [MARGEN, ANCHO / 2 + 12].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (ANCHO - MARGEN * 2) / 2 - 12, y);
    ctx.stroke();
  });

  ctx.fillStyle = COLOR.tenue;
  ctx.font = fuente(500, 11);
  ctx.fillText('Solicitante de cocina', MARGEN, y + 16);
  ctx.fillText('Gobernanta / Compras', ANCHO / 2 + 12, y + 16);

  y += 48;
  ctx.fillStyle = COLOR.tenue;
  ctx.font = fuente(500, 10);
  ctx.textAlign = 'center';
  ctx.fillText('Documento generado desde la aplicacion de insumos de cocina', ANCHO / 2, y);
  ctx.textAlign = 'left';

  return new Promise((resolver, rechazar) => {
    lienzo.toBlob((blob) => {
      if (blob) resolver(blob);
      else rechazar(new Error('No se pudo generar la imagen'));
    }, 'image/png');
  });
}
