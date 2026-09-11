import {
  ClipboardList,
  History,
  LayoutDashboard,
  NotebookPen,
  Send,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface Enlace {
  href: string;
  etiqueta: string;
  etiquetaCorta: string;
  descripcion: string;
  icono: LucideIcon;
  /** Aparece en la barra inferior de telefonos. */
  enMovil: boolean;
}

export const ENLACES: readonly Enlace[] = [
  {
    href: '/panel',
    etiqueta: 'Panel',
    etiquetaCorta: 'Panel',
    descripcion: 'Estado del dia y accesos rapidos',
    icono: LayoutDashboard,
    enMovil: true,
  },
  {
    href: '/cuaderno',
    etiqueta: 'Cuaderno',
    etiquetaCorta: 'Cuaderno',
    descripcion: 'Anota los insumos que faltan en cocina',
    icono: NotebookPen,
    enMovil: true,
  },
  {
    href: '/solicitudes',
    etiqueta: 'Solicitudes',
    etiquetaCorta: 'Pedidos',
    descripcion: 'Seguimiento de los pedidos enviados',
    icono: ClipboardList,
    enMovil: true,
  },
  {
    href: '/recepciones',
    etiqueta: 'Recepciones',
    etiquetaCorta: 'Recibir',
    descripcion: 'Confirma la mercaderia que llega a cocina',
    icono: Truck,
    enMovil: true,
  },
  {
    href: '/despacho',
    etiqueta: 'Despacho',
    etiquetaCorta: 'Despacho',
    descripcion: 'Reportes oficiales y envio por WhatsApp',
    icono: Send,
    enMovil: true,
  },
  {
    href: '/historial',
    etiqueta: 'Historial',
    etiquetaCorta: 'Historial',
    descripcion: 'Bitacora completa de movimientos',
    icono: History,
    enMovil: false,
  },
];

export const ENLACE_CUENTA: Enlace = {
  href: '/cuenta',
  etiqueta: 'Mi cuenta',
  etiquetaCorta: 'Cuenta',
  descripcion: 'Sesion, dispositivo e instalacion',
  icono: UserRound,
  enMovil: false,
};

export function tituloDeRuta(ruta: string): string {
  const enlace = [...ENLACES, ENLACE_CUENTA].find((e) => ruta.startsWith(e.href));
  return enlace?.etiqueta ?? 'Dulce Espera';
}
