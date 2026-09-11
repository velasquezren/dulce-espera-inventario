import type { Metadata } from 'next';
import { VistaCompras } from '@/features/compras/vista-compras';

export const metadata: Metadata = { title: 'Compras' };

export default function PaginaCompras() {
  return <VistaCompras />;
}
