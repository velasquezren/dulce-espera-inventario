import type { Metadata } from 'next';
import { FormularioAcceso } from '@/features/acceso/formulario-acceso';

export const metadata: Metadata = {
  title: 'Acceso',
  description: 'Ingreso al sistema de insumos de cocina de la Clínica Montalvo.',
};

export default function PaginaAcceso() {
  return <FormularioAcceso />;
}
