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
        'inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
        activo
          ? 'border-brand bg-brand text-white'
          : 'border-line-strong bg-surface text-ink-soft hover:border-brand-line hover:bg-brand-soft/50 hover:text-brand',
      )}
    >
      {children}
      {cuenta !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[12px] tabular-nums',
            activo ? 'bg-white/20 text-white' : 'bg-surface-muted text-ink-muted',
          )}
        >
          {cuenta}
        </span>
      )}
    </button>
  );
}
