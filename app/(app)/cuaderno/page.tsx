import type { Metadata } from 'next';
import { VistaCuaderno } from '@/features/cuaderno/vista-cuaderno';

export const metadata: Metadata = { title: 'Cuaderno' };

export default function PaginaCuaderno() {
  return <VistaCuaderno />;
}
