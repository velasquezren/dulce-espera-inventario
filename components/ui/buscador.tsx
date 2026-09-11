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
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        inputMode="search"
        value={valor}
        placeholder={marcador ?? etiqueta}
        onChange={(e) => alCambiar(e.target.value)}
        className="h-11 w-full rounded-control border border-line-strong bg-surface pl-10 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          onClick={() => alCambiar('')}
          aria-label="Limpiar busqueda"
          className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink-soft"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
