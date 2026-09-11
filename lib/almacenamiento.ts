/**
 * Acceso a localStorage tolerante a fallos: modo privado de Safari, cuota llena
 * o almacenamiento bloqueado no deben tumbar la aplicacion.
 */

const LEGADO = [
  'montalvo_products',
  'montalvo_requests',
  'montalvo_receptions',
  'montalvo_history',
  'montalvo_notifications',
  'montalvo_drafts',
  'montalvo_categories',
  'montalvo_module',
  'montalvo_pending_pedidos',
  'montalvo_sidebar_collapsed',
  'montalvo_pwa_banner_dismissed',
  'dulce_espera_checklist_v1',
];

export const CLAVES = {
  sesion: 'montalvo_user',
  catalogo: 'de.catalogo.v1',
  pedidos: 'de.pedidos.v1',
  cuaderno: 'de.cuaderno.v1',
  cola: 'de.cola.v1',
  interfaz: 'de.interfaz.v1',
  checklist: 'de.checklist.v1',
  verificacion: 'de.verificacion.v1',
} as const;

function almacen(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function leer<T>(clave: string, respaldo: T): T {
  const store = almacen();
  if (!store) return respaldo;
  try {
    const crudo = store.getItem(clave);
    if (!crudo || crudo === 'undefined') return respaldo;
    return JSON.parse(crudo) as T;
  } catch {
    try {
      store.removeItem(clave);
    } catch {
      /* almacenamiento no disponible */
    }
    return respaldo;
  }
}

export function escribir(clave: string, valor: unknown): void {
  const store = almacen();
  if (!store) return;
  try {
    store.setItem(clave, JSON.stringify(valor));
  } catch {
    /* cuota llena o modo privado: la app sigue funcionando sin cache */
  }
}

export function borrar(clave: string): void {
  const store = almacen();
  if (!store) return;
  try {
    store.removeItem(clave);
  } catch {
    /* nada que hacer */
  }
}

/** Libera el espacio que ocupaban las claves de la version anterior. */
export function limpiarLegado(): void {
  LEGADO.forEach(borrar);
}
