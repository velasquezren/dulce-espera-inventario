'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  valor: number;
  alCambiar: (valor: number) => void;
  minimo?: number;
  maximo?: number;
  etiqueta: string;
  tamano?: 'sm' | 'md';
}

export function Contador({ valor, alCambiar, minimo = 0, maximo = 9999, etiqueta, tamano = 'md' }: Props) {
  const acotar = (n: number) => Math.min(maximo, Math.max(minimo, n));
  const alto = tamano === 'sm' ? 'size-11' : 'size-12';

  return (
    <div className="inline-flex items-center gap-1.5" role="group" aria-label={etiqueta}>
      <button
        type="button"
        onClick={() => alCambiar(acotar(valor - 1))}
        disabled={valor <= minimo}
        aria-label={`Quitar una unidad de ${etiqueta}`}
        className={cn(
          alto,
          'flex items-center justify-center rounded-control border border-line-strong bg-surface text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-40',
        )}
      >
        <Minus className="size-5" aria-hidden />
      </button>

      <input
        type="number"
        inputMode="numeric"
        value={valor === 0 ? '' : valor}
        placeholder="0"
        min={minimo}
        max={maximo}
        aria-label={`Cantidad de ${etiqueta}`}
        onChange={(e) => alCambiar(acotar(Number.parseInt(e.target.value, 10) || 0))}
        className={cn(
          tamano === 'sm' ? 'h-11 w-14' : 'h-12 w-16',
          'rounded-control border border-line-strong bg-surface text-center text-base font-semibold tabular-nums text-ink outline-none transition-colors focus:border-brand focus:ring-4 focus:ring-brand/10',
        )}
      />

      <button
        type="button"
        onClick={() => alCambiar(acotar(valor + 1))}
        disabled={valor >= maximo}
        aria-label={`Agregar una unidad de ${etiqueta}`}
        className={cn(
          alto,
          'flex items-center justify-center rounded-control border border-line-strong bg-surface text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-40',
        )}
      >
        <Plus className="size-5" aria-hidden />
      </button>
    </div>
  );
}
