'use client';

import { useMemo, useState } from 'react';
import { ArrowDownToLine, History, Printer, Table } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip } from '@/components/ui/filtros';
import { Esqueleto, Vacio } from '@/components/ui/estados';
import { Insignia } from '@/components/ui/insignia';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { movimientosDesde, type Movimiento } from '@/lib/domain/derivados';
import { canal as definicionCanal } from '@/lib/domain/canales';
import { construirCsv, descargarArchivo } from '@/lib/csv';
import { formatoCantidad, formatoFecha, hoyISO, soloHora } from '@/lib/formato';
import { normalizar } from '@/lib/texto';
import { usePedidos } from '@/lib/hooks/use-pedidos';

const POR_PAGINA = 25;

type FiltroTipo = 'todos' | Movimiento['tipo'];

export function VistaHistorial() {
  const { pedidos, estado } = usePedidos();

  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<FiltroTipo>('todos');
  const [desde, setDesde] = useState('');
  const [pagina, setPagina] = useState({ firma: '', numero: 1 });

  const movimientos = useMemo(() => movimientosDesde(pedidos), [pedidos]);

  const filtrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return movimientos.filter((m) => {
      if (tipo !== 'todos' && m.tipo !== tipo) return false;
      if (desde && m.fecha.slice(0, 10) !== desde) return false;
      if (!consulta) return true;
      return normalizar(`${m.nombre} ${m.responsable} ${m.detalle}`).includes(consulta);
    });
  }, [movimientos, tipo, desde, busqueda]);

  // Al cambiar cualquier filtro se vuelve a la primera pagina.
  const firma = `${busqueda}|${tipo}|${desde}`;
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina.firma === firma ? pagina.numero : 1, totalPaginas);
  const irA = (numero: number) => setPagina({ firma, numero: Math.min(Math.max(1, numero), totalPaginas) });
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const exportar = () => {
    const filas = filtrados.map((m) => [
      formatoFecha(m.fecha),
      soloHora(m.fecha),
      m.tipo,
      m.nombre,
      formatoCantidad(m.cantidad),
      m.presentacion,
      definicionCanal(m.canal).nombreCorto,
      m.responsable,
      m.detalle,
    ]);
    descargarArchivo(
      construirCsv(
        ['Fecha', 'Hora', 'Movimiento', 'Insumo', 'Cantidad', 'Presentacion', 'Canal', 'Responsable', 'Detalle'],
        filas,
      ),
      `bitacora-cocina-${hoyISO()}.csv`,
      'text/csv;charset=utf-8',
    );
  };

  const cargando = estado === 'cargando' && pedidos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div data-no-imprimir className="flex flex-col gap-5">
        <EncabezadoPagina
          titulo="Historial de movimientos"
          descripcion="Bitacora de solicitudes y recepciones derivada de los pedidos registrados."
          acciones={
            <>
              <Boton variante="secundario" onClick={exportar} disabled={filtrados.length === 0}>
                <ArrowDownToLine className="size-4" aria-hidden />
                Exportar CSV
              </Boton>
              <Boton variante="secundario" onClick={() => window.print()} disabled={filtrados.length === 0}>
                <Printer className="size-4" aria-hidden />
                Imprimir pagina
              </Boton>
            </>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Buscador
            etiqueta="Buscar movimientos"
            marcador="Buscar por insumo, responsable o pedido"
            valor={busqueda}
            alCambiar={setBusqueda}
            className="flex-1"
          />
          <label className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span className="shrink-0">Fecha</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip activo={tipo === 'todos'} alPulsar={() => setTipo('todos')} cuenta={movimientos.length}>
            Todos
          </Chip>
          <Chip
            activo={tipo === 'Solicitud'}
            alPulsar={() => setTipo('Solicitud')}
            cuenta={movimientos.filter((m) => m.tipo === 'Solicitud').length}
          >
            Solicitudes
          </Chip>
          <Chip
            activo={tipo === 'Recepcion'}
            alPulsar={() => setTipo('Recepcion')}
            cuenta={movimientos.filter((m) => m.tipo === 'Recepcion').length}
          >
            Recepciones
          </Chip>
        </div>
      </div>

      <div className="hidden print:block">
        <h2 className="text-base font-semibold">Clinica Montalvo · Bitacora de insumos de cocina</h2>
        <p className="mt-1 text-xs">
          Generado el {formatoFecha(hoyISO())} · {filtrados.length} movimientos
        </p>
      </div>

      {cargando ? (
        <Esqueleto className="h-96 rounded-card" />
      ) : filtrados.length === 0 ? (
        <Vacio
          titulo="Sin movimientos"
          descripcion="No hay registros que coincidan con los filtros seleccionados."
          icono={<History className="size-8" aria-hidden />}
        />
      ) : (
        <Tarjeta relleno="ninguno" data-imprimible>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Fecha
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Insumo
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Movimiento
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Cantidad
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Responsable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibles.map((movimiento) => (
                  <tr key={movimiento.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] tabular-nums text-ink-muted">
                      {formatoFecha(movimiento.fecha)}
                      <span className="block text-xs text-ink-faint">{soloHora(movimiento.fecha)}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-ink">
                      {movimiento.nombre}
                      <span className="block text-xs font-normal text-ink-muted">
                        {definicionCanal(movimiento.canal).nombreCorto}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Insignia tono={movimiento.tipo === 'Recepcion' ? 'exito' : 'marca'} punto>
                        {movimiento.tipo}
                      </Insignia>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-medium tabular-nums text-ink">
                      {formatoCantidad(movimiento.cantidad)}
                      <span className="block text-xs font-normal text-ink-muted">{movimiento.presentacion}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-soft">
                      {movimiento.responsable}
                      <span className="block text-xs text-ink-muted">{movimiento.detalle}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div
              data-no-imprimir
              className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-muted px-4 py-3 text-xs text-ink-muted"
            >
              <span>
                Pagina {paginaActual} de {totalPaginas} · {filtrados.length} movimientos
              </span>
              <div className="flex items-center gap-2">
                <Boton
                  tamano="sm"
                  variante="secundario"
                  onClick={() => irA(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Boton>
                <Boton
                  tamano="sm"
                  variante="secundario"
                  onClick={() => irA(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Boton>
              </div>
            </div>
          )}
        </Tarjeta>
      )}

      <p data-no-imprimir className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Table className="size-3.5" aria-hidden />
        El CSV abre directamente en Excel e incluye los {filtrados.length} movimientos filtrados; la impresion
        cubre la pagina visible.
      </p>
    </div>
  );
}
