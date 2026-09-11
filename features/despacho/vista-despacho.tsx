'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Image as ImagenIcono,
  MessageCircle,
  Repeat,
  Send,
  Share2,
} from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Segmentado } from '@/components/ui/filtros';
import { Insignia } from '@/components/ui/insignia';
import { Selector } from '@/components/ui/campo';
import { Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { reportes } from '@/lib/api/reportes';
import { agruparPorCanal, totalUnidades } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import { enlaceWhatsApp, textoWhatsApp } from '@/lib/domain/mensajes';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFechaHora } from '@/lib/formato';
import { normalizar, pluralizar } from '@/lib/texto';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useCoordinadores } from '@/lib/hooks/use-coordinadores';
import { SelectorPedido } from './selector-pedido';

type Vista = 'canales' | 'plana';

const DOCUMENTOS = [
  {
    id: 'excel',
    titulo: 'Excel del pedido',
    descripcion: 'Hoja con subtotales por canal y columnas de recepcion.',
    icono: FileSpreadsheet,
    url: reportes.excelPedido,
  },
  {
    id: 'pdf',
    titulo: 'PDF del pedido',
    descripcion: 'Documento formal listo para imprimir y firmar.',
    icono: FileText,
    url: reportes.pdfPedido,
  },
  {
    id: 'admin',
    titulo: 'Reporte administrativo',
    descripcion: 'Version ampliada para gobernanta y administracion.',
    icono: ExternalLink,
    url: reportes.adminPedido,
  },
] as const;

export function VistaDespacho() {
  const { avisar } = useAvisos();
  const { pedidos, estado } = usePedidos();
  const coordinadores = useCoordinadores();

  const [elegido, setElegido] = useState<string | null>(null);
  const [abrirSelector, setAbrirSelector] = useState(false);
  const [vista, setVista] = useState<Vista>('canales');
  const [busqueda, setBusqueda] = useState('');
  const [coordinador, setCoordinador] = useState('');
  const [generando, setGenerando] = useState(false);
  const [imagen, setImagen] = useState<{ pedidoId: string; url: string; blob: Blob } | null>(null);

  const enviables = useMemo(() => pedidos.filter((p) => !p.enCola), [pedidos]);

  // Sin seleccion explicita se muestra el pedido mas reciente.
  const seleccionado = elegido ?? enviables[0]?.id ?? null;

  const pedido = useMemo<Pedido | null>(
    () => enviables.find((p) => p.id === seleccionado) ?? null,
    [enviables, seleccionado],
  );

  // La imagen pertenece a un pedido concreto: al cambiar de pedido deja de aplicar.
  const imagenActual = imagen?.pedidoId === seleccionado ? imagen : null;

  useEffect(() => {
    if (!imagen) return;
    return () => URL.revokeObjectURL(imagen.url);
  }, [imagen]);

  const grupos = useMemo(() => (pedido ? agruparPorCanal(pedido.lineas) : []), [pedido]);

  const lineasFiltradas = useMemo(() => {
    if (!pedido) return [];
    const consulta = normalizar(busqueda.trim());
    if (!consulta) return pedido.lineas;
    return pedido.lineas.filter((linea) => normalizar(`${linea.nombre} ${linea.categoria}`).includes(consulta));
  }, [pedido, busqueda]);

  const idsVisibles = useMemo(() => new Set(lineasFiltradas.map((linea) => linea.id)), [lineasFiltradas]);

  const generarImagen = async () => {
    if (!pedido) return;
    setGenerando(true);
    try {
      const { generarImagenPedido } = await import('./imagen-pedido');
      const blob = await generarImagenPedido(pedido);
      setImagen({ pedidoId: pedido.id, url: URL.createObjectURL(blob), blob });
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo generar la imagen.', 'error');
    } finally {
      setGenerando(false);
    }
  };

  const descargarImagen = () => {
    if (!imagenActual || !pedido) return;
    const enlace = document.createElement('a');
    enlace.href = imagenActual.url;
    enlace.download = `pedido-${pedido.folio}.png`;
    enlace.click();
  };

  const compartirImagen = async () => {
    if (!imagenActual || !pedido) return;
    const archivo = new File([imagenActual.blob], `pedido-${pedido.folio}.png`, { type: 'image/png' });
    if (!navigator.canShare?.({ files: [archivo] })) {
      avisar('Este dispositivo no permite compartir archivos. Descarga la imagen y adjuntala.', 'info');
      return;
    }
    try {
      await navigator.share({ files: [archivo], title: `Pedido ${pedido.folio}` });
    } catch {
      /* el usuario cancelo el dialogo del sistema */
    }
  };

  if (estado === 'cargando' && pedidos.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto className="h-20 rounded-card" />
        <Esqueleto className="h-64 rounded-card" />
      </div>
    );
  }

  if (enviables.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <EncabezadoPagina titulo="Despacho" descripcion="Reportes oficiales y envio de la lista de compras." />
        <Vacio
          titulo="Aun no hay pedidos para despachar"
          descripcion="Envia una lista desde el cuaderno y podras generar aqui los documentos oficiales."
          icono={<Send className="size-8" aria-hidden />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Despacho"
        descripcion="Genera los documentos oficiales del pedido y compartelos con el coordinador."
        acciones={
          <Boton variante="secundario" onClick={() => setAbrirSelector(true)}>
            <Repeat className="size-4" aria-hidden />
            Cambiar pedido
          </Boton>
        }
      />

      {pedido && (
        <>
          <Tarjeta>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-ink">Pedido {pedido.folio}</h2>
                  <Insignia tono={definicionEstado(pedido.estado).tono} punto>
                    {definicionEstado(pedido.estado).etiqueta}
                  </Insignia>
                </div>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {formatoFechaHora(pedido.fecha)} · {pedido.solicitante}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-ink">
                  {pedido.lineas.length} {pluralizar(pedido.lineas.length, 'insumo', 'insumos')}
                </p>
                <p className="text-xs text-ink-muted">
                  {formatoCantidad(totalUnidades(pedido.lineas))}{' '}
                  {pluralizar(totalUnidades(pedido.lineas), 'unidad', 'unidades')}
                </p>
              </div>
            </div>

            {pedido.motivo && (
              <p className="mt-4 rounded-control border border-line bg-surface-muted px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">
                <span className="mr-1.5 font-medium text-ink">Motivo:</span>
                {pedido.motivo}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {grupos.map((grupo) => (
                <div key={grupo.canal.id} className="rounded-control border border-line bg-surface-muted px-3 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    {grupo.canal.nombreCorto}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{grupo.lineas.length}</p>
                  <p className="text-[11px] text-ink-muted">
                    {formatoCantidad(grupo.unidades)} {pluralizar(grupo.unidades, 'unidad', 'unidades')}
                  </p>
                </div>
              ))}
            </div>
          </Tarjeta>

          <Seccion titulo="Documentos oficiales" descripcion="Se generan en el servidor con el formato institucional.">
            <div className="grid gap-3 sm:grid-cols-3">
              {DOCUMENTOS.map((documento) => {
                const Icono = documento.icono;
                return (
                  <a
                    key={documento.id}
                    href={documento.url(pedido.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-line hover:bg-brand-soft/30"
                  >
                    <span className="flex size-9 items-center justify-center rounded-control bg-brand-soft text-brand">
                      <Icono className="size-4" aria-hidden />
                    </span>
                    <span className="text-[13px] font-medium text-ink">{documento.titulo}</span>
                    <span className="text-xs leading-relaxed text-ink-muted">{documento.descripcion}</span>
                  </a>
                );
              })}
            </div>
            <a
              href={reportes.excelPendientes()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
            >
              <FileSpreadsheet className="size-3.5" aria-hidden />
              Descargar el Excel maestro de todos los pedidos pendientes
            </a>
          </Seccion>

          <Seccion titulo="Envio por WhatsApp" descripcion="Comparte la lista como texto o como imagen de alta resolucion.">
            <div className="grid gap-3 lg:grid-cols-2">
              <Tarjeta className="flex flex-col gap-3">
                <p className="text-[13px] text-ink-soft">
                  Envia el detalle en texto, agrupado por canal de compra.
                </p>
                {coordinadores.length > 0 && (
                  <Selector
                    etiqueta="Coordinador"
                    value={coordinador}
                    onChange={(e) => setCoordinador(e.target.value)}
                  >
                    <option value="">Elegir contacto al compartir</option>
                    {coordinadores.map((c) => (
                      <option key={c.id} value={c.telefono}>
                        {c.nombre}
                      </option>
                    ))}
                  </Selector>
                )}
                <Boton
                  onClick={() =>
                    window.open(enlaceWhatsApp(textoWhatsApp(pedido), coordinador || undefined), '_blank', 'noopener')
                  }
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Compartir texto
                </Boton>
              </Tarjeta>

              <Tarjeta className="flex flex-col gap-3">
                <p className="text-[13px] text-ink-soft">
                  Genera la hoja del pedido como imagen para enviarla o archivarla.
                </p>

                {imagenActual ? (
                  <>
                    <div className="max-h-72 overflow-y-auto rounded-control border border-line bg-surface-muted p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagenActual.url} alt={`Hoja del pedido ${pedido.folio}`} className="w-full rounded" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Boton onClick={descargarImagen}>
                        <ImagenIcono className="size-4" aria-hidden />
                        Descargar
                      </Boton>
                      <Boton variante="secundario" onClick={compartirImagen}>
                        <Share2 className="size-4" aria-hidden />
                        Compartir
                      </Boton>
                      <Boton variante="fantasma" onClick={() => setImagen(null)}>
                        Quitar
                      </Boton>
                    </div>
                  </>
                ) : (
                  <Boton variante="secundario" onClick={generarImagen} cargando={generando}>
                    <ImagenIcono className="size-4" aria-hidden />
                    Generar imagen
                  </Boton>
                )}
              </Tarjeta>
            </div>
          </Seccion>

          <Seccion
            titulo="Detalle del pedido"
            acciones={
              <Segmentado
                etiqueta="Organizacion de la lista"
                valor={vista}
                alCambiar={setVista}
                opciones={[
                  { valor: 'canales', etiqueta: 'Por canal' },
                  { valor: 'plana', etiqueta: 'Lista unica' },
                ]}
              />
            }
          >
            <Buscador
              etiqueta="Buscar en el pedido"
              marcador="Filtrar insumos del pedido"
              valor={busqueda}
              alCambiar={setBusqueda}
            />

            {vista === 'canales' ? (
              <div className="flex flex-col gap-4">
                {grupos
                  .map((grupo) => ({
                    ...grupo,
                    lineas: grupo.lineas.filter((linea) => idsVisibles.has(linea.id)),
                  }))
                  .filter((grupo) => grupo.lineas.length > 0)
                  .map((grupo) => (
                    <Tarjeta key={grupo.canal.id} relleno="ninguno">
                      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-2.5">
                        <h3 className="text-[13px] font-semibold text-ink">{grupo.canal.nombre}</h3>
                        <span className="text-xs text-ink-muted">{grupo.canal.descripcion}</span>
                      </div>
                      <ul className="divide-y divide-line">
                        {grupo.lineas.map((linea, indice) => (
                          <li key={linea.id} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="w-6 shrink-0 text-xs tabular-nums text-ink-faint">{indice + 1}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] text-ink">{linea.nombre}</span>
                              <span className="block text-xs text-ink-muted">{linea.categoria}</span>
                            </span>
                            <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-soft">
                              {formatoCantidad(linea.cantidad)} {linea.presentacion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Tarjeta>
                  ))}
              </div>
            ) : (
              <Tarjeta relleno="ninguno">
                <ul className="divide-y divide-line">
                  {lineasFiltradas.map((linea, indice) => (
                    <li key={linea.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-6 shrink-0 text-xs tabular-nums text-ink-faint">{indice + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{linea.nombre}</span>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-soft">
                        {formatoCantidad(linea.cantidad)} {linea.presentacion}
                      </span>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            )}
          </Seccion>
        </>
      )}

      <SelectorPedido
        abierto={abrirSelector}
        alCerrar={() => setAbrirSelector(false)}
        pedidos={enviables}
        seleccionado={seleccionado}
        alSeleccionar={setElegido}
      />
    </div>
  );
}
