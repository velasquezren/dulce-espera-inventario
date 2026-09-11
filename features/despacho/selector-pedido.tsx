'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Buscador } from '@/components/ui/buscador';
import { Dialogo } from '@/components/ui/dialogo';
import { Insignia } from '@/components/ui/insignia';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoFechaHora } from '@/lib/formato';
import { normalizar, pluralizar } from '@/lib/texto';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  pedidos: readonly Pedido[];
  seleccionado: string | null;
  alSeleccionar: (id: string) => void;
}

export function SelectorPedido({ abierto, alCerrar, pedidos, seleccionado, alSeleccionar }: Props) {
  const [busqueda, setBusqueda] = useState('');

  const resultados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    if (!consulta) return pedidos;
    return pedidos.filter(
      (pedido) =>
        normalizar(pedido.folio).includes(consulta) ||
        normalizar(pedido.solicitante).includes(consulta) ||
        pedido.lineas.some((linea) => normalizar(linea.nombre).includes(consulta)),
    );
  }, [pedidos, busqueda]);

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Elegir pedido"
      descripcion="Selecciona el pedido que quieres despachar."
      ancho="md"
    >
      <div className="flex flex-col gap-3">
        <Buscador
          etiqueta="Buscar pedido"
          marcador="Numero, solicitante o insumo"
          valor={busqueda}
          alCambiar={setBusqueda}
        />

        {resultados.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-ink-muted">No hay pedidos que coincidan.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {resultados.slice(0, 40).map((pedido) => {
              const activo = pedido.id === seleccionado;
              return (
                <li key={pedido.id}>
                  <button
                    type="button"
                    onClick={() => {
                      alSeleccionar(pedido.id);
                      alCerrar();
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-control border px-3.5 py-3 text-left transition-colors',
                      activo
                        ? 'border-brand bg-brand-soft'
                        : 'border-line bg-surface hover:border-brand-line hover:bg-surface-muted',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-ink">
                        {pedido.folio}
                        <Insignia tono={definicionEstado(pedido.estado).tono}>
                          {definicionEstado(pedido.estado).etiqueta}
                        </Insignia>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {formatoFechaHora(pedido.fecha)} · {pedido.solicitante} · {pedido.lineas.length}{' '}
                        {pluralizar(pedido.lineas.length, 'insumo', 'insumos')}
                      </p>
                    </div>
                    {activo && <Check className="size-4 shrink-0 text-brand" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialogo>
  );
}
