import { cn } from '@/lib/cn';
import { TONOS, type Tono } from '@/lib/domain/tonos';

interface Props {
  tono?: Tono;
  children: React.ReactNode;
  className?: string;
  punto?: boolean;
}

const PUNTOS: Record<Tono, string> = {
  neutral: 'bg-ink-faint',
  marca: 'bg-brand',
  info: 'bg-info',
  exito: 'bg-exito',
  alerta: 'bg-alerta',
  critico: 'bg-critico',
};

export function Insignia({ tono = 'neutral', children, className, punto = false }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5',
        TONOS[tono],
        className,
      )}
    >
      {punto && <span className={cn('size-1.5 rounded-full', PUNTOS[tono])} aria-hidden />}
      {children}
    </span>
  );
}
