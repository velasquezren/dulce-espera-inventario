'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variante = 'principal' | 'secundario' | 'suave' | 'fantasma' | 'peligro';
type Tamano = 'sm' | 'md' | 'lg';

const VARIANTES: Record<Variante, string> = {
  principal: 'bg-brand text-white hover:bg-brand-strong active:bg-brand-strong shadow-card',
  secundario: 'bg-surface text-ink-soft border border-line-strong hover:bg-surface-muted hover:text-ink',
  suave: 'bg-brand-soft text-brand hover:bg-brand-line/60',
  fantasma: 'text-ink-soft hover:bg-surface-muted hover:text-ink',
  peligro: 'bg-critico text-white hover:bg-critico/90',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-10 px-3.5 text-sm gap-2',
  md: 'h-12 px-5 text-[15px] gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
};

const BASE =
  'inline-flex items-center justify-center rounded-control font-medium whitespace-nowrap ' +
  'transition-colors duration-150 select-none disabled:opacity-45 disabled:pointer-events-none';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  ancho?: boolean;
}

export const Boton = forwardRef<HTMLButtonElement, Props>(function Boton(
  { variante = 'principal', tamano = 'md', cargando = false, ancho = false, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      className={cn(BASE, VARIANTES[variante], TAMANOS[tamano], ancho && 'w-full', className)}
      {...props}
    >
      {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

interface PropsIcono extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  etiqueta: string;
  variante?: Variante;
  tamano?: 'sm' | 'md';
}

export const BotonIcono = forwardRef<HTMLButtonElement, PropsIcono>(function BotonIcono(
  { etiqueta, variante = 'fantasma', tamano = 'md', className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={etiqueta}
      title={etiqueta}
      className={cn(
        BASE,
        VARIANTES[variante],
        tamano === 'sm' ? 'size-10' : 'size-12',
        'shrink-0 p-0',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
