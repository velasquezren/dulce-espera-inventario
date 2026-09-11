'use client';

import { useMemo, useState } from 'react';
import { Boxes, PackageCheck, RotateCw, Truck } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip } from '@/components/ui/filtros';
import { Confirmacion } from '@/components/ui/dialogo';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { Metrica } from '@/components/ui/metrica';
import { EncabezadoPagina } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { ESTADOS_POR_RECIBIR, estado as definicionEstado } from '@/lib/domain/estados';
import { pedidosPorRecibir, resumenLineas, totalUnidades } from '@/lib/domain/derivados';
import type { EstadoPedido, Pedido } from '@/lib/domain/tipos';
import { CLAVES } from '@/lib/almacenamiento';
import { formatoCantidad } from '@/lib/formato';
import { normalizar, pluralizar } from '@/lib/texto';
import { useChecklist } from '@/lib/hooks/use-checklist';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { TarjetaPedido } from '@/features/solicitudes/tarjeta-pedido';

type Filtro = 'todos' | EstadoPedido;

export function VistaRecepciones() {
  const { avisar } = useAvisos();
  const { pedidos, estado, error, recargar, cambiarEstado } = usePedidos();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [confirmando, setConfirmando] = useState<Pedido | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const porRecibir = useMemo(() => pedidosPorRecibir(pedidos), [pedidos]);

  const lineasVigentes = useMemo(
    () => new Set(porRecibir.flatMap((pedido) => pedido.lineas.map((linea) => linea.id))),
    [porRecibir],
  );
  const verificacion = useChecklist(CLAVES.verificacion, lineasVigentes);

  const resumen = useMemo(
    () => ({
      pedidos: porRecibir.length,
      insumos: porRecibir.reduce((suma, p) => suma + p.lineas.length, 0),
      unidades: porRecibir.reduce((suma, p) => suma + totalUnidades(p.lineas), 0),
    }),
    [porRecibir],
  );

  const cuentas = useMemo(() => {
    const mapa = new Map<EstadoPedido, number>();
    for (const pedido of porRecibir) mapa.set(pedido.estado, (mapa.get(pedido.estado) ?? 0) + 1);
    return mapa;
  }, [porRecibir]);

  const filtrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return porRecibir.filter((pedido) => {
      if (filtro !== 'todos' && pedido.estado !== filtro) return false;
      if (!consulta) return true;
      return (
        normalizar(pedido.folio).includes(consulta) ||
        normalizar(pedido.solicitante).includes(consulta) ||
        pedido.lineas.some((linea) => normalizar(linea.nombre).includes(consulta))
      );
    });
  }, [porRecibir, filtro, busqueda]);

  const confirmar = async () => {
    if (!confirmando) return;
    setProcesando(true);
    try {
      await cambiarEstado(confirmando.id, 'entregado');
      avisar(`Pedido ${confirmando.folio} recibido en cocina.`, 'exito');
      setConfirmando(null);
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo confirmar la recepcion.', 'error');
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
        titulo="Recepciones"
        descripcion="Abre un pedido, marca cada insumo a medida que lo revisas y confirma cuando este completo."
        acciones={
          <Boton variante="secundario" onClick={actualizar} cargando={actualizando}>
            <RotateCw className="size-4" aria-hidden />
            Actualizar
          </Boton>
        }
      />

      {error && pedidos.length === 0 && (
        <AvisoError
          mensaje={error}
          accion={
            <Boton tamano="sm" variante="secundario" onClick={() => void recargar()}>
              Reintentar
            </Boton>
          }
        />
      )}

      <div className="grid grid-cols-3 gap-3">
        <Metrica
          etiqueta="Pedidos"
          valor={resumen.pedidos}
          tono="info"
          icono={<Truck className="size-4" aria-hidden />}
        />
        <Metrica
          etiqueta="Insumos"
          valor={resumen.insumos}
          tono="marca"
          icono={<Boxes className="size-4" aria-hidden />}
        />
        <Metrica
          etiqueta="Unidades"
          valor={formatoCantidad(resumen.unidades)}
          tono="neutral"
          icono={<PackageCheck className="size-4" aria-hidden />}
        />
      </div>

      <Buscador
        etiqueta="Buscar recepciones"
        marcador="Buscar por numero, insumo o solicitante"
        valor={busqueda}
        alCambiar={setBusqueda}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
        <Chip activo={filtro === 'todos'} alPulsar={() => setFiltro('todos')} cuenta={porRecibir.length}>
          Todos
        </Chip>
        {ESTADOS_POR_RECIBIR.map((e) => (
          <Chip key={e} activo={filtro === e} alPulsar={() => setFiltro(e)} cuenta={cuentas.get(e) ?? 0}>
            {definicionEstado(e).etiqueta}
          </Chip>
        ))}
      </div>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Esqueleto key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <Vacio
          titulo="Sin pedidos por recibir"
          descripcion="Aqui apareceran los pedidos aceptados o comprados que esperan llegar a cocina."
          icono={<Truck className="size-8" aria-hidden />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((pedido) => {
            const revisadas = verificacion.contar(pedido.lineas.map((linea) => linea.id));
            return (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                verificacion={verificacion}
                pie={
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-ink-muted">
                      Solicitado por {pedido.solicitante} · {resumenLineas(pedido.lineas)}
                      {revisadas > 0 && (
                        <span className="mt-0.5 block text-brand">
                          {revisadas} de {pedido.lineas.length}{' '}
                          {pluralizar(pedido.lineas.length, 'insumo verificado', 'insumos verificados')}
                        </span>
                      )}
                    </p>
                    <Boton tamano="sm" onClick={() => setConfirmando(pedido)}>
                      <PackageCheck className="size-4" aria-hidden />
                      Confirmar recepcion
                    </Boton>
                  </div>
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
        titulo="Confirmar recepcion en cocina"
        mensaje={
          confirmando
            ? `El pedido ${confirmando.folio} quedara marcado como entregado. Revisa que ${resumenLineas(confirmando.lineas)} esten completos antes de confirmar.`
            : ''
        }
        advertencia={
          confirmando && verificacion.contar(confirmando.lineas.map((linea) => linea.id)) < confirmando.lineas.length
            ? 'Todavia quedan insumos sin marcar en la lista de verificacion.'
            : undefined
        }
        textoConfirmar="Si, esta completo"
        procesando={procesando}
      />
    </div>
  );
}
