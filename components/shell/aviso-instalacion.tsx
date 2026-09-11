'use client';

import { Download, X } from 'lucide-react';
import { useInstalacion } from '@/lib/hooks/use-instalacion';
import { usePreferencia } from '@/lib/hooks/use-preferencia';
import { Boton } from '@/components/ui/boton';

export function AvisoInstalacion() {
  const { instalada, disponible, instalar } = useInstalacion();
  const [descartado, setDescartado] = usePreferencia('instalacionDescartada', false);

  if (instalada || !disponible || descartado) return null;

  return (
    <div
      data-no-imprimir
      className="flex items-center gap-3 rounded-card border border-brand-line bg-brand-soft px-4 py-3"
    >
      <Download className="size-5 shrink-0 text-brand" aria-hidden />
      <p className="flex-1 text-sm text-brand">Instala la app en la pantalla de inicio.</p>
      <Boton
        tamano="sm"
        onClick={() => {
          void instalar();
        }}
      >
        Instalar
      </Boton>
      <button
        type="button"
        onClick={() => setDescartado(true)}
        aria-label="Ocultar aviso de instalación"
        className="rounded p-1 text-brand/70 transition-colors hover:text-brand"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  );
}
