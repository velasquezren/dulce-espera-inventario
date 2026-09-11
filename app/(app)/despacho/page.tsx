import type { Metadata } from 'next';
import { VistaDespacho } from '@/features/despacho/vista-despacho';

export const metadata: Metadata = { title: 'Despacho' };

export default function PaginaDespacho() {
  return <VistaDespacho />;
}
