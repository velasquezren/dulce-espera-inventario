import type { Metadata } from 'next';
import { VistaSolicitudes } from '@/features/solicitudes/vista-solicitudes';

export const metadata: Metadata = { title: 'Solicitudes' };

export default function PaginaSolicitudes() {
  return <VistaSolicitudes />;
}
