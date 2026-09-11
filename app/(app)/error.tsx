'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, TriangleAlert } from 'lucide-react';
import { Boton } from '@/components/ui/boton';

/**
 * Aisla los fallos de una seccion: el menu, la sesion y el resto de la
 * aplicacion siguen en pie mientras la cocina reintenta.
 */
export default function ErrorSeccion({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-critico-line bg-critico-soft px-6 py-14 text-center">
      <TriangleAlert className="size-8 text-critico" aria-hidden />
      <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">No se pudo mostrar esta sección</h2>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">
        El resto del sistema sigue funcionando. Reintenta; si el problema continúa, avisa a sistemas.
      </p>
      {error.digest && <p className="mt-2 text-[11px] text-ink-muted">Referencia: {error.digest}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Boton onClick={reset}>
          <RotateCw className="size-4" aria-hidden />
          Reintentar
        </Boton>
        <Link
          href="/panel"
          className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  );
}
