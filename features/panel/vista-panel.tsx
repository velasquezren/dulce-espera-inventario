'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, ClipboardList, NotebookPen, PackageCheck, Send, Truck } from 'lucide-react';
import { Insignia } from '@/components/ui/insignia';
import { Metrica } from '@/components/ui/metrica';
import { Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/components/ui/superficie';
import { estado as definicionEstado, estaAbierto } from '@/lib/domain/estados';
import { pedidosPorRecibir } from '@/lib/domain/derivados';
import { formatoFechaHora, hoyISO } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';
import { useCuaderno } from '@/lib/hooks/use-cuaderno';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';

const ACCESOS = [
  {
    href: '/cuaderno',
    titulo: 'Anotar en el cuaderno',
    descripcion: 'Registra los insumos que faltan y envialos como un solo pedido.',
    icono: NotebookPen,
  },
  {
    href: '/despacho',
    titulo: 'Despachar pedido',
    descripcion: 'Genera el Excel oficial, el PDF o la hoja del pedido para compartir.',
    icono: Send,
  },
  {
    href: '/recepciones',
    titulo: 'Confirmar recepcion',
    descripcion: 'Verifica la mercaderia que llega y cierra el pedido.',
    icono: Truck,
  },
] as const;

export function VistaPanel() {
  const { sesion } = useSesion();
  const { pedidos, estado } = usePedidos();
  const { total: anotados } = useCuaderno();

  const resumen = useMemo(() => {
    const mes = hoyISO().slice(0, 7);
    return {
      abiertos: pedidos.filter((p) => estaAbierto(p.estado)).length,
      porRecibir: pedidosPorRecibir(pedidos).length,
      entregadosMes: pedidos.filter((p) => p.estado === 'entregado' && p.fechaEstado.startsWith(mes)).length,
      recientes: pedidos.slice(0, 5),
    };
  }, [pedidos]);

  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-7">
      <EncabezadoPagina
        titulo={`Hola, ${sesion?.nombre ?? 'equipo de cocina'}`}
        descripcion="Este es el estado actual de los pedidos de insumos de la cocina."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cargando ? (
          Array.from({ length: 4 }, (_, i) => <Esqueleto key={i} className="h-[108px] rounded-card" />)
        ) : (
          <>
            <Metrica
              etiqueta="Sin aprobar"
              valor={resumen.abiertos}
              detalle="Pendientes o en revision"
              tono="alerta"
              icono={<ClipboardList className="size-4" aria-hidden />}
            />
            <Metrica
              etiqueta="Por recibir"
              valor={resumen.porRecibir}
              detalle="Aceptados o comprados"
              tono="info"
              icono={<Truck className="size-4" aria-hidden />}
            />
            <Metrica
              etiqueta="Entregados"
              valor={resumen.entregadosMes}
              detalle="En el mes en curso"
              tono="exito"
              icono={<PackageCheck className="size-4" aria-hidden />}
            />
            <Metrica
              etiqueta="En el cuaderno"
              valor={anotados}
              detalle={anotados > 0 ? 'Listos para enviar' : 'Sin anotaciones'}
              tono="marca"
              icono={<NotebookPen className="size-4" aria-hidden />}
            />
          </>
        )}
      </div>

      <Seccion titulo="Acciones frecuentes">
        <div className="grid gap-3 sm:grid-cols-3">
          {ACCESOS.map((acceso) => {
            const Icono = acceso.icono;
            return (
              <Link
                key={acceso.href}
                href={acceso.href}
                className="group flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand-line hover:bg-brand-soft/30"
              >
                <span className="flex size-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                  <Icono className="size-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold tracking-tight text-ink">{acceso.titulo}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">{acceso.descripcion}</span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-brand">
                  Abrir
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </Seccion>

      <Seccion
        titulo="Ultimos pedidos"
        acciones={
          <Link href="/solicitudes" className="text-[13px] font-medium text-brand hover:underline">
            Ver todos
          </Link>
        }
      >
        {cargando ? (
          <Esqueleto className="h-48 rounded-card" />
        ) : resumen.recientes.length === 0 ? (
          <Vacio
            titulo="Todavia no hay pedidos"
            descripcion="Cuando envies tu primera lista desde el cuaderno aparecera aqui."
            icono={<ClipboardList className="size-8" aria-hidden />}
          />
        ) : (
          <Tarjeta relleno="ninguno">
            <ul className="divide-y divide-line">
              {resumen.recientes.map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    href="/solicitudes"
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {pedido.folio}
                        <span className="ml-2 font-normal text-ink-muted">{pedido.solicitante}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {formatoFechaHora(pedido.fecha)} · {pedido.lineas.length}{' '}
                        {pluralizar(pedido.lineas.length, 'insumo', 'insumos')}
                      </p>
                    </div>
                    <Insignia tono={definicionEstado(pedido.estado).tono} punto>
                      {definicionEstado(pedido.estado).etiqueta}
                    </Insignia>
                  </Link>
                </li>
              ))}
            </ul>
          </Tarjeta>
        )}
      </Seccion>
    </div>
  );
}
