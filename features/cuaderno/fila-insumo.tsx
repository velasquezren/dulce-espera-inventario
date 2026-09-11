'use client';

import { memo } from 'react';
import { cn } from '@/lib/cn';
import type { Insumo } from '@/lib/domain/tipos';
import { Contador } from '@/components/ui/contador';

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
        'flex items-center gap-4 px-4 py-3.5 transition-colors sm:px-5',
        anotado && 'bg-brand-soft/50',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug text-ink">{insumo.nombre}</p>
        <p className="mt-0.5 truncate text-sm text-ink-muted">{insumo.presentacion}</p>
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
