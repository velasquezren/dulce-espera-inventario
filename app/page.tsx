'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pantalla } from '@/components/shell/pantalla-carga';
import { useSesion } from '@/lib/hooks/use-sesion';

/**
 * Punto de entrada de la PWA. Es una pagina real (no una redireccion del
 * servidor) para que el service worker pueda guardarla y la aplicacion abra
 * tambien sin conexion desde la pantalla de inicio.
 */
export default function Inicio() {
  const router = useRouter();
  const { estado, sesion } = useSesion();

  useEffect(() => {
    if (estado === 'cargando') return;
    if (estado === 'anonima') router.replace('/acceso');
    else router.replace(sesion?.rol === 'compras' ? '/compras' : '/panel');
  }, [estado, sesion, router]);

  return <Pantalla mensaje="Abriendo el sistema de insumos" />;
}
