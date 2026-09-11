'use client';

import { memo } from 'react';
import { cn } from '@/lib/cn';
import { canal as definicionCanal } from '@/lib/domain/canales';
import type { Insumo } from '@/lib/domain/tipos';
import { Contador } from '@/components/ui/contador';

const PUNTOS: Record<string, string> = {
  Mercado: 'bg-alerta',
  'Super Mercado': 'bg-brand',
  Proveedor: 'bg-info',
  Otros: 'bg-ink-faint',
};

interface Props {
  insumo: Insumo;
  cantidad: number;
  alFijar: (insumo: Insumo, cantidad: number) => void;
}

export const FilaInsumo = memo(function FilaInsumo({ insumo, cantidad, alFijar }: Props) {
  const anotado = cantidad > 0;

  return (
    <li
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 transition-colors sm:px-4',
        anotado ? 'bg-brand-soft/40' : 'hover:bg-surface-muted',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">{insumo.nombre}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-muted">
          <span className={cn('size-1.5 shrink-0 rounded-full', PUNTOS[insumo.canal])} aria-hidden />
          <span>{definicionCanal(insumo.canal).nombreCorto}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{insumo.categoria}</span>
          <span aria-hidden>·</span>
          <span>{insumo.presentacion}</span>
        </p>
      </div>

      <Contador
        valor={cantidad}
        alCambiar={(valor) => alFijar(insumo, valor)}
        etiqueta={insumo.nombre}
        tamano="sm"
      />
    </li>
  );
});
