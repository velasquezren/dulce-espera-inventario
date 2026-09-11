'use client';

import { useState, useSyncExternalStore } from 'react';
import { Share2 } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { useAvisos } from '@/components/ui/avisos';
import type { Pedido } from '@/lib/domain/tipos';

const sinCambios = () => () => {};
const soportaCompartir = () =>
  typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
const noSoporta = () => false;

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * Un solo boton: arma la hoja del pedido y la entrega al dialogo del telefono.
 * Si el equipo no sabe compartir archivos, la descarga sin preguntar nada.
 */
export function CompartirHoja({ pedido }: { pedido: Pedido }) {
  const { avisar } = useAvisos();
  const [ocupado, setOcupado] = useState(false);
  const puedeCompartir = useSyncExternalStore(sinCambios, soportaCompartir, noSoporta);

  const nombre = `pedido-${pedido.folio}.png`;

  const compartir = async () => {
    setOcupado(true);
    try {
      const { generarHojaPedido } = await import('@/lib/hoja-pedido');
      const blob = await generarHojaPedido(pedido);
      const archivo = new File([blob], nombre, { type: 'image/png' });

      if (puedeCompartir && navigator.canShare({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: `Pedido ${pedido.folio}` });
          return;
        } catch (error) {
          // El usuario cerro el dialogo: no hay nada que avisar.
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
      }

      descargar(blob, nombre);
      avisar('Hoja guardada en tus descargas.', 'info');
    } catch {
      avisar('No se pudo armar la hoja del pedido.', 'error');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Boton onClick={compartir} cargando={ocupado} ancho>
      <Share2 className="size-5" aria-hidden />
      {puedeCompartir ? 'Compartir la hoja' : 'Descargar la hoja'}
    </Boton>
  );
}
