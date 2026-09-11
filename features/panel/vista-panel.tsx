'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ChevronRight, ClipboardList, NotebookPen, Truck } from 'lucide-react';
import { Insignia } from '@/components/ui/insignia';
import { AvisoInstalacion } from '@/components/shell/aviso-instalacion';
import { Esqueleto } from '@/components/ui/estados';
import { estado as definicionEstado } from '@/lib/domain/estados';
import { pedidosPorRecibir } from '@/lib/domain/derivados';
import { formatoFecha } from '@/lib/formato';
import { pluralizar } from '@/lib/texto';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';

const ACCIONES = [
  {
    href: '/cuaderno',
    titulo: 'Anotar lo que falta',
    detalle: 'Arma la lista y mándala',
    icono: NotebookPen,
  },
  {
    href: '/solicitudes',
    titulo: 'Mis pedidos',
    detalle: 'Mira cómo van',
    icono: ClipboardList,
  },
  {
    href: '/recepciones',
    titulo: 'Recibir pedido',
    detalle: 'Revisa lo que llegó',
    icono: Truck,
  },
] as const;

export function VistaPanel() {
  const { sesion } = useSesion();
  const { pedidos, estado } = usePedidos();

  const porRecibir = useMemo(() => pedidosPorRecibir(pedidos).length, [pedidos]);
  const recientes = useMemo(() => pedidos.slice(0, 3), [pedidos]);

  const nombreCorto = sesion?.nombre.split(' ')[0] ?? '';
  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Hola, {nombreCorto}</h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">¿Qué necesitas hacer hoy?</p>
      </header>

      <AvisoInstalacion />

      {porRecibir > 0 && (
        <Link
          href="/recepciones"
          className="flex items-center gap-4 rounded-card border border-info-line bg-info-soft p-5 transition-colors hover:brightness-[0.98]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-info-soft text-info">
            <Truck className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-ink">
              Tienes {porRecibir} {pluralizar(porRecibir, 'pedido en camino', 'pedidos en camino')}
            </span>
            <span className="mt-0.5 block text-sm text-ink-soft">Marca lo que vaya llegando a la cocina</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-info" aria-hidden />
        </Link>
      )}

      <div className="flex flex-col gap-3">
        {ACCIONES.map((accion) => {
          const Icono = accion.icono;
          return (
            <Link
              key={accion.href}
              href={accion.href}
              className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand-line hover:bg-brand-soft/40"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-card bg-brand-soft text-brand">
                <Icono className="size-7" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold tracking-tight text-ink">{accion.titulo}</span>
                <span className="mt-0.5 block text-sm text-ink-muted">{accion.detalle}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-faint" aria-hidden />
            </Link>
          );
        })}
      </div>

      {cargando ? (
        <Esqueleto className="h-40 rounded-card" />
      ) : (
        recientes.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Tus últimos pedidos</h2>
            <ul className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
              {recientes.map((pedido) => (
                <li key={pedido.id} className="border-b border-line last:border-b-0">
                  <Link href="/solicitudes" className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-muted">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-ink">
                        {formatoFecha(pedido.fecha)}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-muted">
                        {pedido.lineas.length} {pluralizar(pedido.lineas.length, 'cosa', 'cosas')}
                      </span>
                    </span>
                    <Insignia tono={definicionEstado(pedido.estado).tono} punto>
                      {definicionEstado(pedido.estado).etiqueta}
                    </Insignia>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      )}
    </div>
  );
}
