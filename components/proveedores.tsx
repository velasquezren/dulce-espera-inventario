'use client';

import { AvisosProvider } from '@/components/ui/avisos';
import { InstalacionProvider } from '@/lib/hooks/use-instalacion';
import { SesionProvider } from '@/lib/hooks/use-sesion';

export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <SesionProvider>
      <InstalacionProvider>
        <AvisosProvider>{children}</AvisosProvider>
      </InstalacionProvider>
    </SesionProvider>
  );
}
