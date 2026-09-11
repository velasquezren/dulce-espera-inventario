'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, FileSpreadsheet, Printer } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Boton } from '@/components/ui/boton';
import { Insignia } from '@/components/ui/insignia';
import { reportes } from '@/lib/api/reportes';
import { agruparPorCanal, resumenLineas } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { EstadoPedido, Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFechaHora } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';

interface Props {
  pedido: Pedido;
  marcadas: Set<string>;
  alMarcar: (lineaId: string) => void;
  alCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
  alImprimir: (pedido: Pedido) => void;
  inicialAbierto?: boolean;
}

export function TarjetaCompra({
  pedido,
  marcadas,
  alMarcar,
  alCambiarEstado,
  alImprimir,
  inicialAbierto = false,
}: Props) {
  const [abierto, setAbierto] = useState(inicialAbierto);
  const definicion = definicionEstado(pedido.estado);
  const grupos = useMemo(() => agruparPorCanal(pedido.lineas).filter((g) => g.lineas.length > 0), [pedido]);
  const completadas = pedido.lineas.filter((linea) => marcadas.has(linea.id)).length;
  const progreso = pedido.lineas.length > 0 ? Math.round((completadas / pedido.lineas.length) * 100) : 0;

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-ink">{pedido.folio}</span>
            <Insignia tono={definicion.tono} punto>
              {definicion.etiqueta}
            </Insignia>
          </div>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {formatoFechaHora(pedido.fecha)} · {pedido.solicitante} · {resumenLineas(pedido.lineas)}
          </p>
          {completadas > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 w-28 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand" style={{ width: `${progreso}%` }} />
              </div>
              <span className="text-[11px] tabular-nums text-ink-muted">
                {completadas}/{pedido.lineas.length}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={cn('size-4 shrink-0 text-ink-muted transition-transform', abierto && 'rotate-180')}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className="border-t border-line">
          {pedido.motivo && (
            <p className="border-b border-line bg-surface-muted px-4 py-2.5 text-[13px] leading-relaxed text-ink-soft">
              <span className="mr-1.5 font-medium text-ink">Motivo:</span>
              {pedido.motivo}
            </p>
          )}

          {grupos.map((grupo) => (
            <section key={grupo.canal.id}>
              <div className="flex items-baseline justify-between gap-2 bg-surface-muted px-4 py-2">
                <h4 className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">
                  {grupo.canal.nombre}
                </h4>
                <span className="text-[11px] text-ink-muted">
                  {grupo.lineas.length} {pluralizar(grupo.lineas.length, 'insumo', 'insumos')}
                </span>
              </div>
              <ul className="divide-y divide-line">
                {grupo.lineas.map((linea) => {
                  const marcada = marcadas.has(linea.id);
                  return (
                    <li key={linea.id}>
                      <button
                        type="button"
                        onClick={() => alMarcar(linea.id)}
                        aria-pressed={marcada}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted"
                      >
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                            marcada ? 'border-brand bg-brand text-white' : 'border-line-strong text-transparent',
                          )}
                        >
                          {marcada && <Check className="size-3.5" aria-hidden />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-[13px] text-ink', marcada && 'text-ink-muted line-through')}>
                            {linea.nombre}
                          </span>
                          <span className="block text-xs text-ink-muted">{linea.categoria}</span>
                        </span>
                        <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-soft">
                          {formatoCantidad(linea.cantidad)} {linea.presentacion}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-muted px-4 py-3">
            {pedido.estado !== 'comprado' && pedido.estado !== 'entregado' && (
              <Boton tamano="sm" onClick={() => alCambiarEstado(pedido, 'comprado')}>
                <Check className="size-4" aria-hidden />
                Marcar comprado
              </Boton>
            )}
            {(pedido.estado === 'pendiente' || pedido.estado === 'en revision') && (
              <Boton tamano="sm" variante="secundario" onClick={() => alCambiarEstado(pedido, 'aceptado')}>
                Aceptar
              </Boton>
            )}
            <Boton tamano="sm" variante="secundario" onClick={() => alImprimir(pedido)}>
              <Printer className="size-4" aria-hidden />
              Imprimir
            </Boton>
            <a
              href={reportes.excelPedido(pedido.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <FileSpreadsheet className="size-4" aria-hidden />
              Excel
            </a>
            {(pedido.estado === 'pendiente' || pedido.estado === 'en revision') && (
              <Boton
                tamano="sm"
                variante="fantasma"
                className="ml-auto text-critico"
                onClick={() => alCambiarEstado(pedido, 'rechazado')}
              >
                Rechazar
              </Boton>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
