'use client';

import { CatalogoProvider } from '@/lib/hooks/use-catalogo';
import { PedidosProvider } from '@/lib/hooks/use-pedidos';

/** Catalogo y pedidos solo se cargan dentro de las areas autenticadas. */
export function Datos({ children }: { children: React.ReactNode }) {
  return (
    <CatalogoProvider>
      <PedidosProvider>{children}</PedidosProvider>
    </CatalogoProvider>
  );
}
