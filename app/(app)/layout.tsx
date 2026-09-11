import { Datos } from '@/components/datos';
import { EntornoApp } from '@/components/shell/entorno-app';
import { CuadernoProvider } from '@/lib/hooks/use-cuaderno';

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <Datos>
      <CuadernoProvider>
        <EntornoApp>{children}</EntornoApp>
      </CuadernoProvider>
    </Datos>
  );
}
