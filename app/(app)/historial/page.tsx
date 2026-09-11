import type { Metadata } from 'next';
import { VistaHistorial } from '@/features/historial/vista-historial';

export const metadata: Metadata = { title: 'Historial' };

export default function PaginaHistorial() {
  return <VistaHistorial />;
}
