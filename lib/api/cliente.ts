const RAIZ = (process.env.NEXT_PUBLIC_API_URL ?? 'https://107.172.193.34.nip.io').replace(/\/+$/, '');

const TIEMPO_LIMITE_MS = 15_000;

/** La API respondio, pero con un codigo de error. */
export class ErrorApi extends Error {
  constructor(
    mensaje: string,
    readonly codigo: number,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

/** No hubo respuesta: sin red, DNS caido, CORS o tiempo agotado. */
export class ErrorRed extends Error {
  constructor(mensaje = 'No se pudo contactar al servidor') {
    super(mensaje);
    this.name = 'ErrorRed';
  }
}

/** URL absoluta de un recurso de la API, para descargas directas del navegador. */
export function urlApi(ruta: string): string {
  return `${RAIZ}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PATCH';
  cuerpo?: unknown;
  signal?: AbortSignal;
}

export async function pedir<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, signal } = opciones;

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);
  const cancelarExterno = () => control.abort();
  signal?.addEventListener('abort', cancelarExterno);

  let respuesta: Response;
  try {
    respuesta = await fetch(urlApi(ruta), {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: control.signal,
      cache: 'no-store',
    });
  } catch {
    throw new ErrorRed();
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', cancelarExterno);
  }

  if (!respuesta.ok) {
    throw new ErrorApi(await mensajeDeError(respuesta), respuesta.status);
  }

  if (respuesta.status === 204) return undefined as T;

  try {
    return (await respuesta.json()) as T;
  } catch {
    throw new ErrorApi('La respuesta del servidor no es válida', respuesta.status);
  }
}

async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const datos: unknown = await respuesta.json();
    if (datos && typeof datos === 'object' && 'detail' in datos) {
      const detalle = (datos as { detail: unknown }).detail;
      if (typeof detalle === 'string' && detalle.trim()) return detalle;
    }
  } catch {
    /* cuerpo vacio o no JSON */
  }
  if (respuesta.status === 401 || respuesta.status === 403) return 'Credenciales no válidas';
  if (respuesta.status === 404) return 'El recurso solicitado no existe';
  if (respuesta.status >= 500) return 'El servidor no pudo procesar la solicitud';
  return `Error ${respuesta.status}`;
}
