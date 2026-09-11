import type { Metadata } from 'next';
import { VistaInformes } from '@/features/informes/vista-informes';

export const metadata: Metadata = { title: 'Informes' };

export default function PaginaInformes() {
  return <VistaInformes />;
}
