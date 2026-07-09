export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  description: string;
  avgConsumption: string;
  lastDelivery: string;
}

export interface RequestItem {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  status: 'Pendiente' | 'Aprobado' | 'Comprado' | 'En camino' | 'Entregado' | 'Cancelado';
  notes?: string;
  user: string;
}

export interface ReceptionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  date: string;
  supplier: string;
  status: 'Pendiente' | 'Recibido';
  receivedBy?: string;
  receivedDate?: string;
}

export interface MovementLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Salida' | 'Solicitud' | 'Recepción';
  quantity: number;
  unit: string;
  user: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  type: 'approved' | 'received' | 'low_stock' | 'out_of_stock';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Fórmula Enteral Polimérica',
    category: 'Nutrición Clínica',
    stock: 12,
    unit: 'Latas de 400g',
    minStock: 25,
    description: 'Fórmula de nutrición enteral completa para pacientes con requerimientos nutricionales elevados.',
    avgConsumption: '120 latas/mes',
    lastDelivery: '2026-07-01'
  },
  {
    id: 'prod-2',
    name: 'Leche Semidescremada Pasteurizada',
    category: 'Lácteos',
    stock: 80,
    unit: 'Litros',
    minStock: 30,
    description: 'Leche pasteurizada para consumo diario y preparación de dietas blandas.',
    avgConsumption: '240 litros/mes',
    lastDelivery: '2026-07-06'
  },
  {
    id: 'prod-3',
    name: 'Pechuga de Pollo Deshuesada',
    category: 'Carnes y Proteínas',
    stock: 0,
    unit: 'Kilogramos',
    minStock: 15,
    description: 'Pechuga de pollo fresca deshuesada para dietas hiposódicas e hiperproteicas de hospitalización.',
    avgConsumption: '180 kg/mes',
    lastDelivery: '2026-06-30'
  },
  {
    id: 'prod-4',
    name: 'Arroz Integral Premium',
    category: 'Granos y Cereales',
    stock: 45,
    unit: 'Kilogramos',
    minStock: 20,
    description: 'Arroz de fácil digestión para acompañamiento en menús balanceados de pacientes.',
    avgConsumption: '100 kg/mes',
    lastDelivery: '2026-07-03'
  },
  {
    id: 'prod-5',
    name: 'Verduras Mixtas Picadas (Congeladas)',
    category: 'Frutas y Verduras',
    stock: 8,
    unit: 'Cajas de 5kg',
    minStock: 12,
    description: 'Mix de zanahoria, brócoli, coliflor y ejotes para cocción rápida al vapor.',
    avgConsumption: '40 cajas/mes',
    lastDelivery: '2026-07-02'
  },
  {
    id: 'prod-6',
    name: 'Aceite de Oliva Extra Virgen',
    category: 'Abarrotes',
    stock: 14,
    unit: 'Botellas de 1L',
    minStock: 5,
    description: 'Aceite de oliva para aderezar ensaladas en dietas cardiosaludables.',
    avgConsumption: '15 botellas/mes',
    lastDelivery: '2026-06-25'
  },
  {
    id: 'prod-7',
    name: 'Espesante Alimentario en Polvo',
    category: 'Nutrición Clínica',
    stock: 3,
    unit: 'Botes de 250g',
    minStock: 8,
    description: 'Espesante instantáneo para líquidos y purés, indicado para pacientes con disfagia.',
    avgConsumption: '30 botes/mes',
    lastDelivery: '2026-07-02'
  },
  {
    id: 'prod-8',
    name: 'Manzana Roja de Mesa',
    category: 'Frutas y Verduras',
    stock: 60,
    unit: 'Kilogramos',
    minStock: 20,
    description: 'Manzana fresca de mesa para colaciones y postres de pacientes en piso.',
    avgConsumption: '120 kg/mes',
    lastDelivery: '2026-07-05'
  }
];

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-101',
    date: '2026-07-07 09:30',
    productId: 'prod-3',
    productName: 'Pechuga de Pollo Deshuesada',
    quantity: 25,
    unit: 'Kilogramos',
    status: 'Aprobado',
    notes: 'Urgente para menú de fin de semana.',
    user: 'Chef Teresa Ortiz'
  },
  {
    id: 'req-102',
    date: '2026-07-07 11:15',
    productId: 'prod-7',
    productName: 'Espesante Alimentario en Polvo',
    quantity: 10,
    unit: 'Botes de 250g',
    status: 'Pendiente',
    notes: 'Quedan muy pocos botes para disfagia en geriatría.',
    user: 'Nutrióloga Mariana Ríos'
  },
  {
    id: 'req-103',
    date: '2026-07-06 08:00',
    productId: 'prod-2',
    productName: 'Leche Semidescremada Pasteurizada',
    quantity: 60,
    unit: 'Litros',
    status: 'Entregado',
    notes: 'Abasto de inicio de semana.',
    user: 'Chef Teresa Ortiz'
  },
  {
    id: 'req-104',
    date: '2026-07-05 14:20',
    productId: 'prod-5',
    productName: 'Verduras Mixtas Picadas (Congeladas)',
    quantity: 15,
    unit: 'Cajas de 5kg',
    status: 'En camino',
    notes: 'Resurtido regular.',
    user: 'Aux. Cocina Juan Gómez'
  }
];

export const INITIAL_RECEPTIONS: ReceptionItem[] = [
  {
    id: 'rec-201',
    productId: 'prod-2',
    productName: 'Leche Semidescremada Pasteurizada',
    quantity: 60,
    unit: 'Litros',
    date: '2026-07-08',
    supplier: 'Distribuidora Lácteos del Norte',
    status: 'Pendiente'
  },
  {
    id: 'rec-202',
    productId: 'prod-4',
    productName: 'Arroz Integral Premium',
    quantity: 30,
    unit: 'Kilogramos',
    date: '2026-07-08',
    supplier: 'Abarrotes Mayoristas S.A.',
    status: 'Pendiente'
  },
  {
    id: 'rec-203',
    productId: 'prod-1',
    productName: 'Fórmula Enteral Polimérica',
    quantity: 20,
    unit: 'Latas de 400g',
    date: '2026-07-07',
    supplier: 'Fármacos Clínicos Integrales',
    status: 'Recibido',
    receivedBy: 'Chef Teresa Ortiz',
    receivedDate: '2026-07-07 13:40'
  }
];

export const INITIAL_HISTORY: MovementLog[] = [
  {
    id: 'log-1',
    date: '2026-07-07 13:40',
    productId: 'prod-1',
    productName: 'Fórmula Enteral Polimérica',
    type: 'Recepción',
    quantity: 20,
    unit: 'Latas de 400g',
    user: 'Chef Teresa Ortiz',
    status: 'Completado'
  },
  {
    id: 'log-2',
    date: '2026-07-07 12:00',
    productId: 'prod-1',
    productName: 'Fórmula Enteral Polimérica',
    type: 'Salida',
    quantity: 5,
    unit: 'Latas de 400g',
    user: 'Aux. Cocina Juan Gómez',
    status: 'Egreso a piso 3'
  },
  {
    id: 'log-3',
    date: '2026-07-06 10:15',
    productId: 'prod-2',
    productName: 'Leche Semidescremada Pasteurizada',
    type: 'Recepción',
    quantity: 60,
    unit: 'Litros',
    user: 'Chef Teresa Ortiz',
    status: 'Completado'
  },
  {
    id: 'log-4',
    date: '2026-07-06 15:30',
    productId: 'prod-3',
    productName: 'Pechuga de Pollo Deshuesada',
    type: 'Salida',
    quantity: 12,
    unit: 'Kilogramos',
    user: 'Chef Teresa Ortiz',
    status: 'Egreso preparación dietas'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'not-1',
    type: 'low_stock',
    title: 'Stock Bajo Detectado',
    message: 'El espesante alimentario en polvo tiene 3 botes disponibles (Mínimo requerido: 8).',
    date: 'Hace 1 hora',
    read: false
  },
  {
    id: 'not-2',
    type: 'approved',
    title: 'Solicitud Aprobada',
    message: 'Tu solicitud de Pechuga de Pollo Deshuesada (25 kg) fue aprobada por Nutrición.',
    date: 'Hace 3 horas',
    read: false
  },
  {
    id: 'not-3',
    type: 'out_of_stock',
    title: 'Producto Sin Stock',
    message: 'La Pechuga de Pollo Deshuesada se encuentra totalmente agotada.',
    date: 'Hace 1 día',
    read: true
  }
];
