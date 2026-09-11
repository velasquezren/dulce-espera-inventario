import { cn } from '@/lib/cn';
import type { Tono } from '@/lib/domain/tonos';

const ACENTOS: Record<Tono, string> = {
  neutral: 'text-ink',
  marca: 'text-brand',
  info: 'text-info',
  exito: 'text-exito',
  alerta: 'text-alerta',
  critico: 'text-critico',
};

interface Props {
  etiqueta: string;
  valor: number | string;
  detalle?: string;
  tono?: Tono;
  icono?: React.ReactNode;
  className?: string;
}

export function Metrica({ etiqueta, valor, detalle, tono = 'neutral', icono, className }: Props) {
  return (
    <div className={cn('rounded-card border border-line bg-surface p-4 shadow-card', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{etiqueta}</p>
        {icono && <span className={cn('shrink-0', ACENTOS[tono])}>{icono}</span>}
      </div>
      <p className={cn('mt-2 text-2xl font-semibold tabular-nums tracking-tight', ACENTOS[tono])}>{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-ink-muted">{detalle}</p>}
    </div>
  );
}
