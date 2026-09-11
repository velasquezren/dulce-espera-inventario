import type { Metadata } from 'next';
import { VistaPanel } from '@/features/panel/vista-panel';

export const metadata: Metadata = { title: 'Panel' };

export default function PaginaPanel() {
  return <VistaPanel />;
}
