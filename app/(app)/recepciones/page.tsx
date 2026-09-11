import type { Metadata } from 'next';
import { VistaRecepciones } from '@/features/recepciones/vista-recepciones';

export const metadata: Metadata = { title: 'Recepciones' };

export default function PaginaRecepciones() {
  return <VistaRecepciones />;
}
