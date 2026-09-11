'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { ENLACES } from './navegacion';

export function BarraInferior() {
  const ruta = usePathname();

  return (
    <nav
      data-no-imprimir
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {ENLACES.map((enlace) => {
        const activo = ruta.startsWith(enlace.href);
        const Icono = enlace.icono;
        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            aria-current={activo ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
          >
            <span
              className={cn(
                'flex h-9 w-16 items-center justify-center rounded-full transition-colors',
                activo ? 'bg-brand text-white' : 'text-ink-muted',
              )}
            >
              <Icono className="size-6" aria-hidden />
            </span>
            <span className={cn('text-[12px] font-medium', activo ? 'text-brand' : 'text-ink-muted')}>
              {enlace.etiqueta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
