'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloudOff } from 'lucide-react';
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
    <header
      data-no-imprimir
      className="sticky top-0 z-20 flex h-18 items-center justify-between gap-3 border-b border-line bg-surface px-4 pt-[env(safe-area-inset-top,0px)] md:px-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <Marca />
        </div>
        <h1 className="hidden truncate text-lg font-semibold tracking-tight text-ink md:block">
          {tituloDeRuta(ruta)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {!enLinea && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-alerta-line bg-alerta-soft px-3 py-1.5 text-[13px] font-medium text-alerta">
            <CloudOff className="size-4" aria-hidden />
            Sin internet
          </span>
        )}

        {pendientes > 0 && enLinea && (
          <span className="rounded-full border border-alerta-line bg-alerta-soft px-3 py-1.5 text-[13px] font-medium text-alerta">
            {pendientes} por enviar
          </span>
        )}

        <Link
          href="/cuenta"
          aria-label="Mi cuenta"
          className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-[15px] font-semibold text-brand transition-colors hover:bg-brand-line"
        >
          {iniciales(sesion.nombre)}
        </Link>
      </div>
    </header>
  );
}
