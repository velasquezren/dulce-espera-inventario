export interface QueuedPedido {
  id: string;
  solicitante: string;
  lineas: Array<{ insumo_id_publico: string; cantidad: number }>;
  motivo?: string;
  createdAt: number;
}

const QUEUE_KEY = 'montalvo_pending_pedidos';

export function getQueuedPedidos(): QueuedPedido[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedPedido[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueuePedido(item: Omit<QueuedPedido, 'id' | 'createdAt'>): QueuedPedido {
  const queued: QueuedPedido = {
    ...item,
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const queue = getQueuedPedidos();
  queue.push(queued);
  saveQueue(queue);
  return queued;
}

export function removeQueuedPedido(id: string) {
  saveQueue(getQueuedPedidos().filter((q) => q.id !== id));
}

/** true si el error vino de la capa de red (offline, DNS, CORS) y no de una respuesta HTTP del backend */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}
