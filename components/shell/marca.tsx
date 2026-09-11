import Image from 'next/image';
import { cn } from '@/lib/cn';

interface Props {
  tamano?: number;
  className?: string;
  prioridad?: boolean;
}

export function Logotipo({ tamano = 36, className, prioridad = false }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={tamano}
      height={tamano}
      priority={prioridad}
      className={cn('shrink-0', className)}
    />
  );
}

export function Marca({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Logotipo tamano={compacto ? 32 : 34} prioridad />
      {!compacto && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-semibold tracking-tight text-brand">Dulce Espera</span>
          <span className="truncate text-[11px] text-ink-muted">Insumos de cocina</span>
        </span>
      )}
    </div>
  );
}
