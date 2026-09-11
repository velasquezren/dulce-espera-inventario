'use client';

import { cn } from '@/lib/cn';

interface ChipProps {
  activo: boolean;
  alPulsar: () => void;
  children: React.ReactNode;
  cuenta?: number;
}

export function Chip({ activo, alPulsar, children, cuenta }: ChipProps) {
  return (
    <button
      type="button"
      onClick={alPulsar}
      aria-pressed={activo}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors',
        activo
          ? 'border-brand bg-brand text-white'
          : 'border-line-strong bg-surface text-ink-soft hover:border-brand-line hover:bg-brand-soft/50 hover:text-brand',
      )}
    >
      {children}
      {cuenta !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 text-[11px] tabular-nums',
            activo ? 'bg-white/20 text-white' : 'bg-surface-muted text-ink-muted',
          )}
        >
          {cuenta}
        </span>
      )}
    </button>
  );
}

export interface OpcionSegmento<T extends string> {
  valor: T;
  etiqueta: string;
  icono?: React.ReactNode;
  cuenta?: number;
}

interface SegmentadoProps<T extends string> {
  opciones: ReadonlyArray<OpcionSegmento<T>>;
  valor: T;
  alCambiar: (valor: T) => void;
  etiqueta: string;
  className?: string;
}

export function Segmentado<T extends string>({
  opciones,
  valor,
  alCambiar,
  etiqueta,
  className,
}: SegmentadoProps<T>) {
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className={cn('inline-flex gap-1 rounded-control border border-line bg-surface-muted p-1', className)}
    >
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion.valor)}
            className={cn(
              'inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-3 text-[13px] font-medium transition-colors',
              activo ? 'bg-surface text-brand shadow-card' : 'text-ink-muted hover:text-ink-soft',
            )}
          >
            {opcion.icono}
            {opcion.etiqueta}
            {opcion.cuenta !== undefined && opcion.cuenta > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] tabular-nums',
                  activo ? 'bg-brand text-white' : 'bg-line text-ink-muted',
                )}
              >
                {opcion.cuenta}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
