import { ClipboardList, Home, NotebookPen, Truck, UserRound, type LucideIcon } from 'lucide-react';

export interface Enlace {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
}

/** Cuatro destinos, los que la cocina usa todos los dias. */
export const ENLACES: readonly Enlace[] = [
  { href: '/panel', etiqueta: 'Inicio', icono: Home },
  { href: '/cuaderno', etiqueta: 'Cuaderno', icono: NotebookPen },
  { href: '/solicitudes', etiqueta: 'Mis pedidos', icono: ClipboardList },
  { href: '/recepciones', etiqueta: 'Recibir', icono: Truck },
];

export const ENLACE_CUENTA: Enlace = { href: '/cuenta', etiqueta: 'Mi cuenta', icono: UserRound };

export function tituloDeRuta(ruta: string): string {
  const enlace = [...ENLACES, ENLACE_CUENTA].find((e) => ruta.startsWith(e.href));
  return enlace?.etiqueta ?? 'Dulce Espera';
}
