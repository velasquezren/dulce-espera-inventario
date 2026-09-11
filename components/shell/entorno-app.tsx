'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useSesion } from '@/lib/hooks/use-sesion';
import { useEnLinea } from '@/lib/hooks/use-conexion';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { usePreferencia } from '@/lib/hooks/use-preferencia';
import { Pantalla } from '@/components/shell/pantalla-carga';
import { BarraLateral } from './barra-lateral';
import { BarraSuperior } from './barra-superior';
import { BarraInferior } from './barra-inferior';
import { AvisoInstalacion } from './aviso-instalacion';

export function EntornoApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { estado, sesion, salir } = useSesion();
  const enLinea = useEnLinea();
  const { enCola } = usePedidos();
  const [colapsada, setColapsada] = usePreferencia('menuColapsado', false);

  useEffect(() => {
    if (estado === 'anonima') router.replace('/acceso');
    else if (estado === 'activa' && sesion?.rol === 'compras') router.replace('/compras');
  }, [estado, sesion, router]);

  if (estado !== 'activa' || !sesion || sesion.rol === 'compras') {
    return <Pantalla mensaje="Abriendo el area de cocina" />;
  }

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Ir al contenido
      </a>

      <BarraLateral colapsada={colapsada} alColapsar={setColapsada} alSalir={salir} />

      <div className={cn('flex min-h-[100dvh] flex-col transition-[padding] duration-200', colapsada ? 'md:pl-[76px]' : 'md:pl-60')}>
        <BarraSuperior sesion={sesion} enLinea={enLinea} pendientes={enCola} />
        <AvisoInstalacion />

        <main
          id="contenido"
          className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-5 md:px-6 md:pb-10"
        >
          {children}
        </main>

        <BarraInferior />
      </div>
    </div>
  );
}
