/** Canal de abastecimiento con el que el backend clasifica cada insumo. */
export type CanalId = 'Mercado' | 'Super Mercado' | 'Proveedor' | 'Otros';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  canal: CanalId;
  presentacion: string;
}

export type EstadoPedido =
  | 'pendiente'
  | 'en revision'
  | 'aceptado'
  | 'rechazado'
  | 'comprado'
  | 'entregado'
  | 'cancelado';

export interface LineaPedido {
  id: string;
  insumoId: string;
  nombre: string;
  categoria: string;
  canal: CanalId;
  presentacion: string;
  cantidad: number;
}

export interface Pedido {
  /** UUID publico; es la llave que aceptan todos los endpoints. */
  id: string;
  /** Identificador corto para mostrar al personal. */
  folio: string;
  solicitante: string;
  /** Fecha local en formato YYYY-MM-DDTHH:mm:ss, tal como la entrega la API. */
  fecha: string;
  fechaEstado: string;
  estado: EstadoPedido;
  motivo: string;
  lineas: LineaPedido[];
  /** true mientras el pedido solo existe en la cola local del dispositivo. */
  enCola?: boolean;
}

export type Rol = 'cocina' | 'compras' | 'admin';

export interface Sesion {
  nombre: string;
  usuario: string;
  rol: Rol;
  token: string;
}

export interface LineaNueva {
  insumoId: string;
  cantidad: number;
}
