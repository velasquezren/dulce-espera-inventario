'use client';

import { BotonCompartir, BotonDescargar } from '@/components/ui/boton-compartir';
import { useCompartir } from '@/lib/hooks/use-compartir';
import type { Pedido } from '@/lib/domain/tipos';

async function hojaDe(pedido: Pedido) {
  const { generarHojaPedido } = await import('@/lib/hoja-pedido');
  return { blob: await generarHojaPedido(pedido), nombre: `Pedido_${pedido.folio}.png` };
}

/** Hoja del pedido dibujada en el dispositivo, para mandarla por mensaje. */
export function CompartirHoja({ pedido }: { pedido: Pedido }) {
  const { puedeCompartir } = useCompartir();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {puedeCompartir && (
        <BotonCompartir
          titulo={`Pedido ${pedido.folio}`}
          etiqueta="Compartir la hoja"
          obtener={() => hojaDe(pedido)}
        />
      )}
      <BotonDescargar
        etiqueta="Descargar la hoja"
        variante={puedeCompartir ? 'secundario' : 'principal'}
        obtener={() => hojaDe(pedido)}
      />
    </div>
  );
}
