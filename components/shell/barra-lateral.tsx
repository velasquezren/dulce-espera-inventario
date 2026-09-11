'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ENLACES, ENLACE_CUENTA } from './navegacion';
import { Marca } from './marca';

interface Props {
  colapsada: boolean;
  alColapsar: (valor: boolean) => void;
  alSalir: () => void;
}

export function BarraLateral({ colapsada, alColapsar, alSalir }: Props) {
  const ruta = usePathname();
  const enlaces = [...ENLACES, ENLACE_CUENTA];

  return (
    <aside
      data-no-imprimir
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 md:flex',
        colapsada ? 'w-[76px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-line', colapsada ? 'justify-center px-2' : 'px-4')}>
        <Marca compacto={colapsada} />
      </div>

      <nav aria-label="Navegacion principal" className={cn('flex flex-1 flex-col gap-1 overflow-y-auto py-4', colapsada ? 'px-2' : 'px-3')}>
        {enlaces.map((enlace) => {
          const activo = ruta.startsWith(enlace.href);
          const Icono = enlace.icono;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={activo ? 'page' : undefined}
              title={colapsada ? enlace.etiqueta : undefined}
              className={cn(
                'flex items-center rounded-control text-[13px] font-medium transition-colors',
                colapsada ? 'h-11 justify-center' : 'h-11 gap-3 px-3',
                activo ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-surface-muted hover:text-ink',
              )}
            >
              <Icono className={cn('size-[18px] shrink-0', activo ? 'text-brand' : 'text-ink-muted')} aria-hidden />
              {!colapsada && <span className="truncate">{enlace.etiqueta}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn('flex flex-col gap-1 border-t border-line py-3', colapsada ? 'px-2' : 'px-3')}>
        <button
          type="button"
          onClick={() => alColapsar(!colapsada)}
          className={cn(
            'flex h-10 items-center rounded-control text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink',
            colapsada ? 'justify-center' : 'gap-3 px-3',
          )}
          aria-label={colapsada ? 'Expandir menu' : 'Contraer menu'}
        >
          {colapsada ? (
            <PanelLeftOpen className="size-[18px]" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" aria-hidden />
              <span>Contraer menu</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={alSalir}
          className={cn(
            'flex h-10 items-center rounded-control text-[13px] font-medium text-critico transition-colors hover:bg-critico-soft',
            colapsada ? 'justify-center' : 'gap-3 px-3',
          )}
          aria-label="Cerrar sesion"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          {!colapsada && <span>Cerrar sesion</span>}
        </button>
      </div>
    </aside>
  );
}
