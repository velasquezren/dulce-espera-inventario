import { Datos } from '@/components/datos';
import { EntornoCompras } from '@/components/shell/entorno-compras';

export default function LayoutCompras({ children }: { children: React.ReactNode }) {
  return (
    <Datos>
      <EntornoCompras>{children}</EntornoCompras>
    </Datos>
  );
}
