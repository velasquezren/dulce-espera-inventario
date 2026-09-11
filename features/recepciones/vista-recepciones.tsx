'use client';

import { useMemo, useState } from 'react';
import { PackageCheck, RotateCw, Truck } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Confirmacion } from '@/components/ui/dialogo';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { CLAVES } from '@/lib/almacenamiento';
import { pedidosPorRecibir } from '@/lib/domain/derivados';
import type { Pedido } from '@/lib/domain/tipos';
import { pluralizar } from '@/lib/texto';
import { useChecklist } from '@/lib/hooks/use-checklist';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { TarjetaPedido } from '@/features/solicitudes/tarjeta-pedido';

export function VistaRecepciones() {
  const { avisar } = useAvisos();
  const { pedidos, estado, error, recargar, cambiarEstado } = usePedidos();

  const [confirmando, setConfirmando] = useState<Pedido | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const porRecibir = useMemo(() => pedidosPorRecibir(pedidos), [pedidos]);

  const lineasVigentes = useMemo(
    () => new Set(porRecibir.flatMap((pedido) => pedido.lineas.map((linea) => linea.id))),
    [porRecibir],
  );
  const verificacion = useChecklist(CLAVES.verificacion, lineasVigentes);

  const confirmar = async () => {
    if (!confirmando) return;
    setProcesando(true);
    try {
      await cambiarEstado(confirmando.id, 'entregado');
      avisar('Listo, el pedido quedó marcado como recibido.');
      setConfirmando(null);
    } catch {
      avisar('No se pudo guardar. Revisa la conexión e intenta otra vez.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const actualizar = async () => {
    setActualizando(true);
    await recargar();
    setActualizando(false);
  };

  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Recibir pedido"
        descripcion="Ve marcando cada cosa que llega y al final confirma el pedido."
        acciones={
          <Boton variante="secundario" onClick={actualizar} cargando={actualizando}>
            <RotateCw className="size-5" aria-hidden />
            Actualizar
          </Boton>
        }
      />

      {error && pedidos.length === 0 && (
        <AvisoError
          mensaje="No se pudo conectar con el servidor."
          accion={
            <Boton variante="secundario" onClick={() => void recargar()}>
              Reintentar
            </Boton>
          }
        />
      )}

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <Esqueleto key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : porRecibir.length === 0 ? (
        <Vacio
          titulo="No hay nada por recibir"
          descripcion="Cuando compras marque un pedido como comprado, va a aparecer aquí para que lo revises."
          icono={<Truck className="size-10" aria-hidden />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {porRecibir.map((pedido) => {
            const revisadas = verificacion.contar(pedido.lineas.map((linea) => linea.id));
            const completo = revisadas === pedido.lineas.length;
            return (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                verificacion={verificacion}
                abiertoPorDefecto={porRecibir.length === 1}
                acciones={
                  <>
                    <p className="text-center text-sm text-ink-muted">
                      {completo
                        ? 'Marcaste todo. Ya puedes confirmar.'
                        : `Llevas ${revisadas} de ${pedido.lineas.length} ${pluralizar(pedido.lineas.length, 'cosa', 'cosas')}.`}
                    </p>
                    <Boton tamano="lg" ancho onClick={() => setConfirmando(pedido)}>
                      <PackageCheck className="size-5" aria-hidden />
                      Ya llegó todo
                    </Boton>
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <Confirmacion
        abierto={confirmando !== null}
        alCerrar={() => setConfirmando(null)}
        alConfirmar={confirmar}
        titulo="Confirmar que llegó"
        mensaje="El pedido queda cerrado y compras va a ver que ya lo recibieron en la cocina."
        textoConfirmar="Sí, llegó todo"
        textoCancelar="Todavía no"
        procesando={procesando}
        advertencia={
          confirmando && verificacion.contar(confirmando.lineas.map((linea) => linea.id)) < confirmando.lineas.length
            ? 'Ojo: todavía hay cosas sin marcar en la lista.'
            : undefined
        }
      />
    </div>
  );
}
