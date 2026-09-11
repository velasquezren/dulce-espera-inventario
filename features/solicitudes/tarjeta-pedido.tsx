'use client';

import { useState } from 'react';
import { Check, ChevronDown, CloudOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { agruparPorCanal, resumenLineas } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFechaHora } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';
import { Insignia } from '@/components/ui/insignia';

interface Verificacion {
  marcadas: Set<string>;
  alternar: (lineaId: string) => void;
}

interface Props {
  pedido: Pedido;
  /** Acciones dentro del detalle desplegado. */
  acciones?: React.ReactNode;
  /** Barra de accion siempre visible al pie de la tarjeta. */
  pie?: React.ReactNode;
  /** Activa el repaso linea por linea al recibir la mercaderia. */
  verificacion?: Verificacion;
}

export function TarjetaPedido({ pedido, acciones, pie, verificacion }: Props) {
  const [abierto, setAbierto] = useState(false);
  const definicion = definicionEstado(pedido.estado);
  const grupos = agruparPorCanal(pedido.lineas).filter((g) => g.lineas.length > 0);

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold tracking-tight text-ink">{pedido.folio}</span>
            <Insignia tono={definicion.tono} punto>
              {definicion.etiqueta}
            </Insignia>
            {pedido.enCola && (
              <Insignia tono="alerta">
                <CloudOff className="size-3" aria-hidden />
                Sin enviar
              </Insignia>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {formatoFechaHora(pedido.fecha)} · {pedido.solicitante} · {pedido.lineas.length}{' '}
            {pluralizar(pedido.lineas.length, 'insumo', 'insumos')}
          </p>
        </div>
        <ChevronDown
          className={cn('size-4 shrink-0 text-ink-muted transition-transform', abierto && 'rotate-180')}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className="border-t border-line bg-surface-muted/60 px-4 py-4">
          {pedido.motivo && (
            <p className="mb-4 rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">
              <span className="mr-1.5 font-medium text-ink">Motivo:</span>
              {pedido.motivo}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {grupos.map((grupo) => (
              <div key={grupo.canal.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    {grupo.canal.nombre}
                  </h4>
                  <span className="text-[11px] tabular-nums text-ink-muted">
                    {grupo.lineas.length} {pluralizar(grupo.lineas.length, 'insumo', 'insumos')}
                  </span>
                </div>
                <ul className="divide-y divide-line overflow-hidden rounded-control border border-line bg-surface">
                  {grupo.lineas.map((linea) => {
                    const cantidad = (
                      <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-soft">
                        {formatoCantidad(linea.cantidad)} {linea.presentacion}
                      </span>
                    );

                    if (!verificacion) {
                      return (
                        <li key={linea.id} className="flex items-center gap-3 px-3 py-2">
                          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{linea.nombre}</span>
                          {cantidad}
                        </li>
                      );
                    }

                    const verificada = verificacion.marcadas.has(linea.id);
                    return (
                      <li key={linea.id}>
                        <button
                          type="button"
                          onClick={() => verificacion.alternar(linea.id)}
                          aria-pressed={verificada}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                        >
                          <span
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                              verificada ? 'border-brand bg-brand text-white' : 'border-line-strong',
                            )}
                          >
                            {verificada && <Check className="size-3.5" aria-hidden />}
                          </span>
                          <span
                            className={cn(
                              'min-w-0 flex-1 truncate text-[13px]',
                              verificada ? 'text-ink-muted line-through' : 'text-ink',
                            )}
                          >
                            {linea.nombre}
                          </span>
                          {cantidad}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-xs text-ink-muted">Total: {resumenLineas(pedido.lineas)}</p>
            {acciones}
          </div>
        </div>
      )}

      {pie && <div className="border-t border-line px-4 py-3">{pie}</div>}
    </article>
  );
}
