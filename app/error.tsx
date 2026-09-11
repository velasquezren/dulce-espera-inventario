'use client';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Logotipo } from '@/components/shell/marca';

export default function ErrorGlobal({
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <Logotipo tamano={52} />
      <div className="max-w-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">No se pudo mostrar esta sección</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          Ocurrió un error inesperado. Puedes reintentar; si el problema continúa, avisa al área de sistemas.
        </p>
        {error.digest && <p className="mt-3 text-[11px] text-ink-faint">Referencia: {error.digest}</p>}
      </div>
      <Boton onClick={reset}>
        <RotateCw className="size-4" aria-hidden />
        Reintentar
      </Boton>
    </div>
  );
}
