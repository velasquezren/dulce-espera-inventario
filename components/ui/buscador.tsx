'use client';

import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  valor: string;
  alCambiar: (valor: string) => void;
  marcador?: string;
  etiqueta: string;
  className?: string;
}

export function Buscador({ valor, alCambiar, marcador, etiqueta, className }: Props) {
  const id = useId();
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        inputMode="search"
        value={valor}
        placeholder={marcador ?? etiqueta}
        onChange={(e) => alCambiar(e.target.value)}
        className="h-13 w-full rounded-card border border-line-strong bg-surface pl-12 pr-12 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          onClick={() => alCambiar('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
