'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, RotateCw, X } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Chip } from '@/components/ui/filtros';
import { Confirmacion } from '@/components/ui/dialogo';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { sePuedeCancelar } from '@/lib/domain/estados';
import { formatoFecha } from '@/lib/formato';
import type { Pedido } from '@/lib/domain/tipos';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { TarjetaPedido } from './tarjeta-pedido';
import { CompartirHoja } from './compartir-hoja';

type Filtro = 'todos' | 'enCurso' | 'entregados';

export function VistaSolicitudes() {
  const { avisar } = useAvisos();
  const { pedidos, estado, error, recargar, cambiarEstado } = usePedidos();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [actualizando, setActualizando] = useState(false);
  const [cancelando, setCancelando] = useState<Pedido | null>(null);
  const [procesando, setProcesando] = useState(false);

  const grupos = useMemo(
    () => ({
      todos: pedidos,
      enCurso: pedidos.filter((p) => p.estado !== 'entregado' && p.estado !== 'rechazado' && p.estado !== 'cancelado'),
      entregados: pedidos.filter((p) => p.estado === 'entregado'),
    }),
    [pedidos],
  );

  const visibles = grupos[filtro];

  const actualizar = async () => {
    setActualizando(true);
    await recargar();
    setActualizando(false);
  };

  const confirmarCancelacion = async () => {
    if (!cancelando) return;
    setProcesando(true);
    try {
      await cambiarEstado(cancelando.id, 'cancelado');
      avisar('El pedido quedó cancelado.');
      setCancelando(null);
    } catch (e) {
      // El servidor explica por qué no se puede; se muestra tal cual.
      avisar(e instanceof Error ? e.message : 'No se pudo cancelar el pedido.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Mis pedidos"
        descripcion="Aquí ves las listas que mandaste y cómo van."
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

      <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
        <Chip activo={filtro === 'todos'} alPulsar={() => setFiltro('todos')} cuenta={grupos.todos.length}>
          Todos
        </Chip>
        <Chip activo={filtro === 'enCurso'} alPulsar={() => setFiltro('enCurso')} cuenta={grupos.enCurso.length}>
          En camino
        </Chip>
        <Chip
          activo={filtro === 'entregados'}
          alPulsar={() => setFiltro('entregados')}
          cuenta={grupos.entregados.length}
        >
          Ya llegaron
        </Chip>
      </div>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Esqueleto key={i} className="h-28 rounded-card" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <Vacio
          titulo="Todavía no hay pedidos aquí"
          descripcion="Cuando mandes una lista desde el cuaderno la vas a ver en esta pantalla."
          icono={<ClipboardList className="size-10" aria-hidden />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibles.map((pedido, indice) => (
            <TarjetaPedido
              key={pedido.id}
              pedido={pedido}
              abiertoPorDefecto={indice === 0 && visibles.length === 1}
              acciones={
                pedido.enCola ? undefined : (
                  <>
                    <CompartirHoja pedido={pedido} />
                    {sePuedeCancelar(pedido.estado) && (
                      <Boton
                        variante="secundario"
                        tamano="lg"
                        ancho
                        className="text-critico"
                        onClick={() => setCancelando(pedido)}
                      >
                        <X className="size-5" aria-hidden />
                        Cancelar este pedido
                      </Boton>
                    )}
                  </>
                )
              }
            />
          ))}
        </div>
      )}

      <Confirmacion
        abierto={cancelando !== null}
        alCerrar={() => setCancelando(null)}
        alConfirmar={confirmarCancelacion}
        titulo="Cancelar el pedido"
        mensaje={
          cancelando
            ? `Se va a cancelar el pedido del ${formatoFecha(cancelando.fecha)}. Compras va a ver que ya no lo necesitas y no se puede deshacer.`
            : ''
        }
        advertencia={
          cancelando?.estado === 'aceptado'
            ? 'Compras ya lo aprobó. Avísales por si estaban por salir a comprar.'
            : undefined
        }
        textoConfirmar="Sí, cancelar"
        textoCancelar="No, dejarlo"
        destructivo
        procesando={procesando}
      />
    </div>
  );
}
