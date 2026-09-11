'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-control border border-line-strong bg-surface text-ink text-sm ' +
  'placeholder:text-ink-faint transition-colors outline-none ' +
  'focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted disabled:text-ink-muted';

interface EnvolturaProps {
  etiqueta?: string;
  ayuda?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}

function Envoltura({ etiqueta, ayuda, error, id, children, className }: EnvolturaProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {etiqueta && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
          {etiqueta}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-critico">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="text-xs text-ink-muted">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

interface EntradaProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  ayuda?: string;
  error?: string;
}

export const Entrada = forwardRef<HTMLInputElement, EntradaProps>(function Entrada(
  { etiqueta, ayuda, error, className, id, ...props },
  ref,
) {
  const generado = useId();
  const idFinal = id ?? generado;
  return (
    <Envoltura etiqueta={etiqueta} ayuda={ayuda} error={error} id={idFinal}>
      <input
        ref={ref}
        id={idFinal}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idFinal}-error` : ayuda ? `${idFinal}-ayuda` : undefined}
        className={cn(CONTROL, 'h-11 px-3.5', error && 'border-critico focus:border-critico focus:ring-critico/10', className)}
        {...props}
      />
    </Envoltura>
  );
});

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta?: string;
  ayuda?: string;
  error?: string;
}

export const Area = forwardRef<HTMLTextAreaElement, AreaProps>(function Area(
  { etiqueta, ayuda, error, className, id, rows = 3, ...props },
  ref,
) {
  const generado = useId();
  const idFinal = id ?? generado;
  return (
    <Envoltura etiqueta={etiqueta} ayuda={ayuda} error={error} id={idFinal}>
      <textarea
        ref={ref}
        id={idFinal}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, 'resize-y px-3.5 py-2.5 leading-relaxed', className)}
        {...props}
      />
    </Envoltura>
  );
});

interface SelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  ayuda?: string;
}

export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(function Selector(
  { etiqueta, ayuda, className, id, children, ...props },
  ref,
) {
  const generado = useId();
  const idFinal = id ?? generado;
  return (
    <Envoltura etiqueta={etiqueta} ayuda={ayuda} id={idFinal}>
      <select
        ref={ref}
        id={idFinal}
        className={cn(CONTROL, 'h-11 cursor-pointer appearance-none px-3.5 pr-9', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
    </Envoltura>
  );
});
