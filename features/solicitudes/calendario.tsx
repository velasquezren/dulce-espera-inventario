'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { estado as definicionEstado } from '@/lib/domain/estados';
import type { Pedido } from '@/lib/domain/tipos';
import { DIAS_SEMANA_CORTOS, NOMBRES_MES, hoyISO, soloDia } from '@/lib/formato';
import { BotonIcono } from '@/components/ui/boton';

const PUNTOS = {
  neutral: 'bg-ink-faint',
  marca: 'bg-brand',
  info: 'bg-info',
  exito: 'bg-exito',
  alerta: 'bg-alerta',
  critico: 'bg-critico',
} as const;

interface Celda {
  dia: number;
  fecha: string;
  delMes: boolean;
}

function construirMes(anio: number, mes: number): Celda[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const primero = new Date(anio, mes, 1);
  const desplazamiento = (primero.getDay() + 6) % 7; // la semana empieza el lunes
  const celdas: Celda[] = [];

  for (let i = 0; i < 42; i += 1) {
    const fecha = new Date(anio, mes, i - desplazamiento + 1);
    celdas.push({
      dia: fecha.getDate(),
      fecha: `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
      delMes: fecha.getMonth() === mes,
    });
  }

  return celdas;
}

interface Props {
  anio: number;
  mes: number;
  pedidos: readonly Pedido[];
  seleccion: string | null;
  alSeleccionar: (fecha: string) => void;
  alCambiarMes: (anio: number, mes: number) => void;
}

export function Calendario({ anio, mes, pedidos, seleccion, alSeleccionar, alCambiarMes }: Props) {
  const celdas = useMemo(() => construirMes(anio, mes), [anio, mes]);
  const hoy = hoyISO();

  const porDia = useMemo(() => {
    const mapa = new Map<string, Pedido[]>();
    for (const pedido of pedidos) {
      const dia = soloDia(pedido.fecha);
      const lista = mapa.get(dia);
      if (lista) lista.push(pedido);
      else mapa.set(dia, [pedido]);
    }
    return mapa;
  }, [pedidos]);

  return (
    <div className="rounded-card border border-line bg-surface p-3 shadow-card sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          {NOMBRES_MES[mes]} {anio}
        </h2>
        <div className="flex items-center gap-1">
          <BotonIcono
            etiqueta="Mes anterior"
            tamano="sm"
            variante="secundario"
            onClick={() => (mes === 0 ? alCambiarMes(anio - 1, 11) : alCambiarMes(anio, mes - 1))}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </BotonIcono>
          <BotonIcono
            etiqueta="Mes siguiente"
            tamano="sm"
            variante="secundario"
            onClick={() => (mes === 11 ? alCambiarMes(anio + 1, 0) : alCambiarMes(anio, mes + 1))}
          >
            <ChevronRight className="size-4" aria-hidden />
          </BotonIcono>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA_CORTOS.map((dia) => (
          <span key={dia} className="pb-1 text-center text-[11px] font-medium text-ink-muted">
            {dia}
          </span>
        ))}

        {celdas.map((celda) => {
          const delDia = porDia.get(celda.fecha) ?? [];
          const activa = seleccion === celda.fecha;
          return (
            <button
              key={celda.fecha}
              type="button"
              onClick={() => alSeleccionar(celda.fecha)}
              aria-pressed={activa}
              aria-label={`${celda.dia}: ${delDia.length} pedidos`}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-control border text-[13px] transition-colors',
                activa
                  ? 'border-brand bg-brand-soft text-brand'
                  : celda.fecha === hoy
                    ? 'border-brand-line bg-surface text-ink'
                    : 'border-transparent bg-surface-muted/70 hover:bg-surface-muted',
                !celda.delMes && !activa && 'text-ink-faint opacity-60',
              )}
            >
              <span className={cn('tabular-nums', activa && 'font-semibold')}>{celda.dia}</span>
              <span className="flex h-1.5 items-center gap-0.5">
                {delDia.slice(0, 3).map((pedido) => (
                  <span
                    key={pedido.id}
                    className={cn('size-1.5 rounded-full', PUNTOS[definicionEstado(pedido.estado).tono])}
                    aria-hidden
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
