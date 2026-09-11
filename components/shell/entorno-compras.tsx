'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSesion } from '@/lib/hooks/use-sesion';
import { Pantalla } from './pantalla-carga';

export function EntornoCompras({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { estado, sesion } = useSesion();

  useEffect(() => {
    if (estado === 'anonima') router.replace('/acceso');
    else if (estado === 'activa' && sesion?.rol !== 'compras') router.replace('/panel');
  }, [estado, sesion, router]);

  if (estado !== 'activa' || sesion?.rol !== 'compras') {
    return <Pantalla mensaje="Abriendo el área de compras" />;
  }

  return <>{children}</>;
}
