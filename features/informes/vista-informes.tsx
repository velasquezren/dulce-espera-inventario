'use client';

import { useMemo, useState } from 'react';
import { Check, FileSpreadsheet, FileText, Image as ImagenIcono, Printer } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Boton } from '@/components/ui/boton';
import { BotonCompartir } from '@/components/ui/boton-compartir';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { Insignia } from '@/components/ui/insignia';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { reportes } from '@/lib/api/reportes';
import { agruparPorCanal } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoFecha, soloHora } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';
import { useCompartir } from '@/lib/hooks/use-compartir';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { CompartirHoja } from '@/features/solicitudes/compartir-hoja';

const DOCUMENTOS = [
  {
    id: 'excel',
    titulo: 'Excel',
    detalle: 'Planilla con casillas para marcar lo que se recibe',
    extension: 'xlsx',
    icono: FileSpreadsheet,
    url: reportes.excelPedido,
  },
  {
    id: 'pdf',
    titulo: 'PDF',
    detalle: 'Hoja lista para imprimir y firmar',
    extension: 'pdf',
    icono: FileText,
    url: reportes.pdfPedido,
  },
] as const;

async function traerDelServidor(url: string, nombre: string) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error('El servidor no entregó el archivo');
  return { blob: await respuesta.blob(), nombre };
}

function EnlaceDescarga({ href, etiqueta }: { href: string; etiqueta: string }) {
  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-control border border-line-strong bg-surface px-6 text-base font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
    >
      {etiqueta}
    </a>
  );
}

function TarjetaDocumento({
  titulo,
  detalle,
  icono,
  children,
}: {
  titulo: string;
  detalle: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-card bg-brand-soft text-brand">
          {icono}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold tracking-tight text-ink">{titulo}</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{detalle}</span>
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function VistaInformes() {
  const { pedidos, estado, error, recargar } = usePedidos();
  const { puedeCompartir } = useCompartir();
  const [elegido, setElegido] = useState<string | null>(null);

  const disponibles = useMemo(() => pedidos.filter((p) => !p.enCola), [pedidos]);
  const seleccionado = elegido ?? disponibles[0]?.id ?? null;
  const pedido = useMemo<Pedido | null>(
    () => disponibles.find((p) => p.id === seleccionado) ?? null,
    [disponibles, seleccionado],
  );

  if (estado === 'cargando' && pedidos.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto className="h-24 rounded-card" />
        <Esqueleto className="h-64 rounded-card" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Informes"
        descripcion="Manda el pedido en Excel o PDF, o descárgalo para imprimirlo y entregarlo a la gobernanta."
      />

      {error && pedidos.length === 0 && (
        <AvisoError
          mensaje="No se pudo conectar con el servidor."
          accion={
            <Boton variante="secundario" onClick={() => void recargar()}>
              Reintentar
            </Boton>
          }
        />
      )}

      {!pedido ? (
        <Vacio
          titulo="Todavía no hay pedidos"
          descripcion="Cuando mandes una lista desde el cuaderno vas a poder imprimirla desde aquí."
          icono={<Printer className="size-10" aria-hidden />}
        />
      ) : (
        <>
          <Tarjeta className="flex flex-col gap-4">
            <div>
              <p className="text-base font-semibold text-ink">
                {formatoFecha(pedido.fecha)}{' '}
                <span className="font-normal text-ink-muted">a las {soloHora(pedido.fecha)}</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {pedido.lineas.length} {pluralizar(pedido.lineas.length, 'cosa anotada', 'cosas anotadas')} ·{' '}
                {pedido.solicitante}
              </p>
              <div className="mt-2.5">
                <Insignia tono={definicionEstado(pedido.estado).tono} punto>
                  {definicionEstado(pedido.estado).etiqueta}
                </Insignia>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2 border-t border-line pt-4">
              {agruparPorCanal(pedido.lineas)
                .filter((grupo) => grupo.lineas.length > 0)
                .map((grupo) => (
                  <li
                    key={grupo.canal.id}
                    className="rounded-full border border-line bg-surface-muted px-3 py-1 text-sm text-ink-soft"
                  >
                    {grupo.canal.nombreCorto}: {grupo.lineas.length}
                  </li>
                ))}
            </ul>
          </Tarjeta>

          <div className="flex flex-col gap-3">
            {DOCUMENTOS.map((documento) => {
              const Icono = documento.icono;
              const direccion = documento.url(pedido.id);
              const nombre = `Pedido_${pedido.folio}.${documento.extension}`;
              return (
                <TarjetaDocumento
                  key={documento.id}
                  titulo={documento.titulo}
                  detalle={documento.detalle}
                  icono={<Icono className="size-7" aria-hidden />}
                >
                  {puedeCompartir && (
                    <BotonCompartir
                      titulo={`Pedido ${pedido.folio}`}
                      respaldo={direccion}
                      obtener={() => traerDelServidor(direccion, nombre)}
                    />
                  )}
                  <EnlaceDescarga href={direccion} etiqueta="Descargar" />
                </TarjetaDocumento>
              );
            })}

            <TarjetaDocumento
              titulo="Imagen"
              detalle="Se lee bien en el celular, para mandar por mensaje"
              icono={<ImagenIcono className="size-7" aria-hidden />}
            >
              <CompartirHoja pedido={pedido} />
            </TarjetaDocumento>
          </div>

          {disponibles.length > 1 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-ink">Elegir otro pedido</h2>
              <ul className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
                {disponibles.slice(0, 12).map((otro) => {
                  const activo = otro.id === pedido.id;
                  return (
                    <li key={otro.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setElegido(otro.id)}
                        aria-pressed={activo}
                        className={cn(
                          'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors',
                          activo ? 'bg-brand-soft' : 'hover:bg-surface-muted',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-[15px] font-medium', activo ? 'text-brand' : 'text-ink')}>
                            {formatoFecha(otro.fecha)} a las {soloHora(otro.fecha)}
                          </span>
                          <span className="mt-0.5 block text-sm text-ink-muted">
                            {otro.lineas.length} {pluralizar(otro.lineas.length, 'cosa', 'cosas')} ·{' '}
                            {definicionEstado(otro.estado).etiqueta}
                          </span>
                        </span>
                        {activo && <Check className="size-5 shrink-0 text-brand" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
