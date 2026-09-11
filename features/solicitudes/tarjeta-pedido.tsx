'use client';

import { useState } from 'react';
import { Check, ChevronDown, CloudOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { agruparPorCanal } from '@/lib/domain/derivados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFecha, soloHora } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';
import { Insignia } from '@/components/ui/insignia';

interface Verificacion {
  marcadas: Set<string>;
  alternar: (lineaId: string) => void;
}

interface Props {
  pedido: Pedido;
  /** Botones al pie del detalle desplegado. */
  acciones?: React.ReactNode;
  /** Activa el repaso linea por linea al recibir la mercaderia. */
  verificacion?: Verificacion;
  abiertoPorDefecto?: boolean;
}

export function TarjetaPedido({ pedido, acciones, verificacion, abiertoPorDefecto = false }: Props) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto);
  const definicion = definicionEstado(pedido.estado);
  const grupos = agruparPorCanal(pedido.lineas).filter((g) => g.lineas.length > 0);

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">
            {formatoFecha(pedido.fecha)}{' '}
            <span className="font-normal text-ink-muted">a las {soloHora(pedido.fecha)}</span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {pedido.lineas.length} {pluralizar(pedido.lineas.length, 'cosa anotada', 'cosas anotadas')}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Insignia tono={definicion.tono} punto>
              {definicion.etiqueta}
            </Insignia>
            {pedido.enCola && (
              <Insignia tono="alerta">
                <CloudOff className="size-4" aria-hidden />
                Se enviará solo
              </Insignia>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn('size-6 shrink-0 text-ink-muted transition-transform', abierto && 'rotate-180')}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className="border-t border-line bg-surface-muted/50 px-5 py-4">
          {pedido.motivo && (
            <div className="mb-4 rounded-control border-l-4 border-brand bg-brand-soft/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Nota de cocina</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{pedido.motivo}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {grupos.map((grupo) => (
              <div key={grupo.canal.id}>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {grupo.canal.nombreCorto}
                </h4>
                <ul className="divide-y divide-line overflow-hidden rounded-control border border-line bg-surface">
                  {grupo.lineas.map((linea) => {
                    const cantidad = (
                      <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">
                        {formatoCantidad(linea.cantidad)} {linea.presentacion}
                      </span>
                    );

                    if (!verificacion) {
                      return (
                        <li key={linea.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="min-w-0 flex-1 text-[15px] text-ink">{linea.nombre}</span>
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
                          className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
                        >
                          <span
                            className={cn(
                              'flex size-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                              verificada ? 'border-exito bg-exito text-white' : 'border-line-strong',
                            )}
                          >
                            {verificada && <Check className="size-5" aria-hidden />}
                          </span>
                          <span
                            className={cn(
                              'min-w-0 flex-1 text-[15px]',
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

          {acciones && <div className="mt-5 flex flex-col gap-2.5">{acciones}</div>}
        </div>
      )}
    </article>
  );
}
