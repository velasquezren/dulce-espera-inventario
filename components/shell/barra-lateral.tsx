'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ENLACES, ENLACE_CUENTA } from './navegacion';
import { Marca } from './marca';

export function BarraLateral({ alSalir }: { alSalir: () => void }) {
  const ruta = usePathname();
  const enlaces = [...ENLACES, ENLACE_CUENTA];

  return (
    <aside
      data-no-imprimir
      className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex"
    >
      <div className="flex h-20 items-center px-5">
        <Marca />
      </div>

      <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1.5 px-3 py-4">
        {enlaces.map((enlace) => {
          const activo = ruta.startsWith(enlace.href);
          const Icono = enlace.icono;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={activo ? 'page' : undefined}
              className={cn(
                'flex h-13 items-center gap-3 rounded-card px-4 text-[15px] font-medium transition-colors',
                activo ? 'bg-brand text-white' : 'text-ink-soft hover:bg-brand-soft hover:text-brand',
              )}
            >
              <Icono className="size-5 shrink-0" aria-hidden />
              {enlace.etiqueta}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          type="button"
          onClick={alSalir}
          className="flex h-12 w-full items-center gap-3 rounded-card px-4 text-[15px] font-medium text-critico transition-colors hover:bg-critico-soft"
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          Salir
        </button>
      </div>
    </aside>
  );
}
