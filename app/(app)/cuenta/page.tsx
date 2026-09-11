import type { Metadata } from 'next';
import { VistaCuenta } from '@/features/cuenta/vista-cuenta';

export const metadata: Metadata = { title: 'Mi cuenta' };

export default function PaginaCuenta() {
  return <VistaCuenta />;
}
