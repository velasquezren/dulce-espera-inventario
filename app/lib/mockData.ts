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
  idPublico?: string;
  date: string;
  status: 'Pendiente' | 'En revisión' | 'Aprobado' | 'Aceptado' | 'Rechazado' | 'Comprado' | 'Entregado' | 'Cancelado';
  user: string;
  reason?: string;
  /** true mientras el pedido solo existe en la cola local y aún no se confirmó con el servidor */
  pendingSync?: boolean;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export interface ReceptionItem {
  id: string;
  idPublico?: string;
  date: string;
  solicitante: string;
  status: 'Pendiente' | 'Recibido';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }>;
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
  type: 'approved' | 'purchased' | 'delivered';
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
    status: 'Aprobado',
    user: 'Chef Teresa Ortiz',
    items: [
      {
        productId: 'prod-3',
        productName: 'Pechuga de Pollo Deshuesada',
        quantity: 25,
        unit: 'Kilogramos',
        notes: 'Urgente para menú de fin de semana.'
      }
    ]
  },
  {
    id: 'req-102',
    date: '2026-07-07 11:15',
    status: 'Pendiente',
    user: 'Nutrióloga Mariana Ríos',
    items: [
      {
        productId: 'prod-7',
        productName: 'Espesante Alimentario en Polvo',
        quantity: 10,
        unit: 'Botes de 250g',
        notes: 'Quedan muy pocos botes para disfagia en geriatría.'
      }
    ]
  },
  {
    id: 'req-103',
    date: '2026-07-06 08:00',
    status: 'Entregado',
    user: 'Chef Teresa Ortiz',
    items: [
      {
        productId: 'prod-2',
        productName: 'Leche Semidescremada Pasteurizada',
        quantity: 60,
        unit: 'Litros',
        notes: 'Abasto de inicio de semana.'
      }
    ]
  }
];

export const INITIAL_RECEPTIONS: ReceptionItem[] = [
  {
    id: 'rec-201',
    date: '2026-07-08',
    solicitante: 'Chef Teresa Ortiz',
    status: 'Pendiente',
    items: [
      {
        productId: 'prod-2',
        productName: 'Leche Semidescremada Pasteurizada',
        quantity: 60,
        unit: 'Litros'
      },
      {
        productId: 'prod-4',
        productName: 'Arroz Integral Premium',
        quantity: 30,
        unit: 'Kilogramos'
      }
    ]
  },
  {
    id: 'rec-203',
    date: '2026-07-07',
    solicitante: 'Auxiliar Luis Mena',
    status: 'Recibido',
    items: [
      {
        productId: 'prod-1',
        productName: 'Fórmula Enteral Polimérica',
        quantity: 20,
        unit: 'Latas de 400g'
      }
    ]
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
    type: 'approved',
    title: 'Solicitud Aprobada',
    message: 'Tu solicitud de insumos #req-101 fue aprobada por Gobernación.',
    date: 'Hace 2 horas',
    read: false
  },
  {
    id: 'not-2',
    type: 'purchased',
    title: 'Compra Realizada',
    message: 'Se han comprado los insumos de la solicitud #req-102.',
    date: 'Hace 4 horas',
    read: false
  },
  {
    id: 'not-3',
    type: 'delivered',
    title: 'Solicitud Entregada',
    message: 'La solicitud #req-103 ha sido entregada a la cocina.',
    date: 'Hace 1 día',
    read: true
  }
];
