'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ClipboardList, List, RotateCw, Send } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip, Segmentado } from '@/components/ui/filtros';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { ORDEN_ESTADOS, estado as definicionEstado } from '@/lib/domain/estados';
import type { EstadoPedido } from '@/lib/domain/tipos';
import { formatoFechaLarga, hoyISO, soloDia } from '@/lib/formato';
import { normalizar, pluralizar } from '@/lib/texto';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';
import { TarjetaPedido } from './tarjeta-pedido';
import { Calendario } from './calendario';

type Vista = 'lista' | 'calendario';
type FiltroEstado = 'todos' | EstadoPedido;

export function VistaSolicitudes() {
  const { sesion } = useSesion();
  const { pedidos, estado, error, recargar } = usePedidos();

  const [vista, setVista] = useState<Vista>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [soloMios, setSoloMios] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const hoy = hoyISO();
  const [mes, setMes] = useState(() => ({ anio: Number(hoy.slice(0, 4)), mes: Number(hoy.slice(5, 7)) - 1 }));
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(hoy);

  const propios = useMemo(
    () => (soloMios && sesion ? pedidos.filter((p) => p.solicitante === sesion.nombre) : pedidos),
    [pedidos, soloMios, sesion],
  );

  const cuentas = useMemo(() => {
    const mapa = new Map<EstadoPedido, number>();
    for (const pedido of propios) mapa.set(pedido.estado, (mapa.get(pedido.estado) ?? 0) + 1);
    return mapa;
  }, [propios]);

  const filtrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return propios.filter((pedido) => {
      if (filtro !== 'todos' && pedido.estado !== filtro) return false;
      if (!consulta) return true;
      return (
        normalizar(pedido.folio).includes(consulta) ||
        normalizar(pedido.solicitante).includes(consulta) ||
        normalizar(pedido.motivo).includes(consulta) ||
        pedido.lineas.some((linea) => normalizar(linea.nombre).includes(consulta))
      );
    });
  }, [propios, filtro, busqueda]);

  const delDia = useMemo(
    () => propios.filter((pedido) => soloDia(pedido.fecha) === diaSeleccionado),
    [propios, diaSeleccionado],
  );

  const actualizar = async () => {
    setActualizando(true);
    await recargar();
    setActualizando(false);
  };

  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Solicitudes"
        descripcion="Seguimiento de las listas enviadas a gobernanta y su estado de aprobacion."
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmentado
          etiqueta="Modo de visualizacion"
          valor={vista}
          alCambiar={setVista}
          opciones={[
            { valor: 'lista', etiqueta: 'Lista', icono: <List className="size-4" aria-hidden /> },
            { valor: 'calendario', etiqueta: 'Calendario', icono: <CalendarDays className="size-4" aria-hidden /> },
          ]}
        />
        <Chip activo={soloMios} alPulsar={() => setSoloMios((v) => !v)}>
          Solo mis pedidos
        </Chip>
      </div>

      {vista === 'lista' ? (
        <div className="flex flex-col gap-4">
          <Buscador
            etiqueta="Buscar pedidos"
            marcador="Buscar por numero, insumo o solicitante"
            valor={busqueda}
            alCambiar={setBusqueda}
          />

          <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
            <Chip activo={filtro === 'todos'} alPulsar={() => setFiltro('todos')} cuenta={propios.length}>
              Todos
            </Chip>
            {ORDEN_ESTADOS.filter((e) => (cuentas.get(e) ?? 0) > 0).map((e) => (
              <Chip key={e} activo={filtro === e} alPulsar={() => setFiltro(e)} cuenta={cuentas.get(e)}>
                {definicionEstado(e).etiqueta}
              </Chip>
            ))}
          </div>

          {cargando ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Esqueleto key={i} className="h-[74px] rounded-card" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <Vacio
              titulo="No hay solicitudes"
              descripcion="Ningun pedido coincide con los filtros aplicados."
              icono={<ClipboardList className="size-8" aria-hidden />}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.map((pedido) => (
                <TarjetaPedido
                  key={pedido.id}
                  pedido={pedido}
                  acciones={
                    pedido.enCola ? undefined : (
                      <Link
                        href="/despacho"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
                      >
                        <Send className="size-3.5" aria-hidden />
                        Despachar
                      </Link>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Calendario
            anio={mes.anio}
            mes={mes.mes}
            pedidos={propios}
            seleccion={diaSeleccionado}
            alSeleccionar={setDiaSeleccionado}
            alCambiarMes={(anio, valor) => setMes({ anio, mes: valor })}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink">
                {diaSeleccionado ? formatoFechaLarga(diaSeleccionado) : 'Selecciona un dia'}
              </h2>
              <span className="text-xs text-ink-muted">
                {delDia.length} {pluralizar(delDia.length, 'pedido', 'pedidos')}
              </span>
            </div>

            {delDia.length === 0 ? (
              <Tarjeta className="text-center text-[13px] text-ink-muted">
                No se registraron pedidos en esta fecha.
              </Tarjeta>
            ) : (
              <div className="flex flex-col gap-3">
                {delDia.map((pedido) => (
                  <TarjetaPedido key={pedido.id} pedido={pedido} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
