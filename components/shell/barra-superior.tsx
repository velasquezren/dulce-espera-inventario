'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloudOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/cn';
import { iniciales } from '@/lib/texto';
import type { Sesion } from '@/lib/domain/tipos';
import { tituloDeRuta } from './navegacion';
import { Marca } from './marca';

interface Props {
  sesion: Sesion;
  enLinea: boolean;
  pendientes: number;
}

export function BarraSuperior({ sesion, enLinea, pendientes }: Props) {
  const ruta = usePathname();

  return (
    <header data-no-imprimir className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <Marca />
        </div>
        <h1 className="hidden truncate text-[15px] font-semibold tracking-tight text-ink md:block">
          {tituloDeRuta(ruta)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {pendientes > 0 && (
          <span className="hidden items-center gap-1.5 rounded-full border border-alerta-line bg-alerta-soft px-2.5 py-1 text-[11px] font-medium text-alerta sm:inline-flex">
            {pendientes} sin enviar
          </span>
        )}

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
            enLinea ? 'border-exito-line bg-exito-soft text-exito' : 'border-line bg-surface-muted text-ink-soft',
          )}
        >
          {enLinea ? <Wifi className="size-3.5" aria-hidden /> : <CloudOff className="size-3.5" aria-hidden />}
          <span className={enLinea ? 'hidden sm:inline' : undefined}>{enLinea ? 'En linea' : 'Sin conexion'}</span>
        </span>

        <Link
          href="/cuenta"
          className="flex items-center gap-2.5 rounded-control px-1 py-1 transition-colors hover:bg-surface-muted"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
            {iniciales(sesion.nombre)}
          </span>
          <span className="hidden min-w-0 flex-col text-left lg:flex">
            <span className="truncate text-[13px] font-medium text-ink">{sesion.nombre}</span>
            <span className="truncate text-[11px] capitalize text-ink-muted">{sesion.rol}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
