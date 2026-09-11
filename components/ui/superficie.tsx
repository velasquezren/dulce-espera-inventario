import { cn } from '@/lib/cn';

interface TarjetaProps extends React.HTMLAttributes<HTMLDivElement> {
  relleno?: 'ninguno' | 'sm' | 'md';
}

export function Tarjeta({ relleno = 'md', className, children, ...props }: TarjetaProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-card',
        relleno === 'sm' && 'p-4',
        relleno === 'md' && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SeccionProps {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Seccion({ titulo, descripcion, acciones, children, className }: SeccionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-[13px] text-ink-muted">{descripcion}</p>}
        </div>
        {acciones}
      </div>
      {children}
    </section>
  );
}

interface EncabezadoProps {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
}

export function EncabezadoPagina({ titulo, descripcion, acciones }: EncabezadoProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-[22px]">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-muted">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  );
}
