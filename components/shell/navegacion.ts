import { ClipboardList, Home, NotebookPen, Printer, Truck, UserRound, type LucideIcon } from 'lucide-react';

export interface Enlace {
  href: string;
  etiqueta: string;
  /** Version breve para la barra inferior del telefono. */
  etiquetaCorta: string;
  icono: LucideIcon;
}

/** Los destinos que la cocina usa todos los dias. */
export const ENLACES: readonly Enlace[] = [
  { href: '/panel', etiqueta: 'Inicio', etiquetaCorta: 'Inicio', icono: Home },
  { href: '/cuaderno', etiqueta: 'Cuaderno', etiquetaCorta: 'Cuaderno', icono: NotebookPen },
  { href: '/solicitudes', etiqueta: 'Mis pedidos', etiquetaCorta: 'Pedidos', icono: ClipboardList },
  { href: '/recepciones', etiqueta: 'Recibir', etiquetaCorta: 'Recibir', icono: Truck },
  { href: '/informes', etiqueta: 'Informes', etiquetaCorta: 'Informes', icono: Printer },
];

export const ENLACE_CUENTA: Enlace = {
  href: '/cuenta',
  etiqueta: 'Mi cuenta',
  etiquetaCorta: 'Cuenta',
  icono: UserRound,
};

export function tituloDeRuta(ruta: string): string {
  const enlace = [...ENLACES, ENLACE_CUENTA].find((e) => ruta.startsWith(e.href));
  return enlace?.etiqueta ?? 'Dulce Espera';
}
