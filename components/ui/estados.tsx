import { cn } from '@/lib/cn';

export function Esqueleto({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-control bg-line/70', className)} aria-hidden />;
}

interface VacioProps {
  titulo: string;
  descripcion: string;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
  className?: string;
}

export function Vacio({ titulo, descripcion, icono, accion, className }: VacioProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icono && <div className="mb-3 text-ink-faint">{icono}</div>}
      <h3 className="text-lg font-semibold text-ink">{titulo}</h3>
      <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-ink-muted">{descripcion}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

interface AvisoErrorProps {
  mensaje: string;
  accion?: React.ReactNode;
}

export function AvisoError({ mensaje, accion }: AvisoErrorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-critico-line bg-critico-soft px-4 py-3">
      <p className="text-[15px] font-medium text-critico">{mensaje}</p>
      {accion}
    </div>
  );
}
