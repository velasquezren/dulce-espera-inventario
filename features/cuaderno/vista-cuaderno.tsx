'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListFilter, NotebookPen, Search } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip, Segmentado } from '@/components/ui/filtros';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { CANALES } from '@/lib/domain/canales';
import type { CanalId, Insumo, LineaNueva } from '@/lib/domain/tipos';
import { normalizar, pluralizar } from '@/lib/texto';
import { useCatalogo } from '@/lib/hooks/use-catalogo';
import { useCuaderno, type Anotacion } from '@/lib/hooks/use-cuaderno';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';
import { FilaInsumo } from './fila-insumo';
import { PanelAnotaciones } from './panel-anotaciones';

const PAGINA = 60;
const ORDEN_CANAL = new Map(CANALES.map((c, indice) => [c.id, indice]));

type Pestana = 'catalogo' | 'cuaderno';
type FiltroCanal = 'todos' | CanalId;

interface Entrada {
  insumo: Insumo;
  texto: string;
}

export function VistaCuaderno() {
  const router = useRouter();
  const { avisar } = useAvisos();
  const { sesion } = useSesion();
  const { insumos, porId, estado, error, recargar } = useCatalogo();
  const { anotaciones, cantidades, total, fijar, quitar, vaciar } = useCuaderno();
  const { enviar } = usePedidos();

  const [pestana, setPestana] = useState<Pestana>('catalogo');
  const [busqueda, setBusqueda] = useState('');
  const [canalActivo, setCanalActivo] = useState<FiltroCanal>('todos');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [paginacion, setPaginacion] = useState({ firma: '', visibles: PAGINA });
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const consulta = useDeferredValue(busqueda);
  const centinela = useRef<HTMLDivElement>(null);

  /** Indice ordenado y normalizado: se recalcula solo cuando cambia el catalogo. */
  const indice = useMemo<Entrada[]>(
    () =>
      insumos
        .map((insumo) => ({
          insumo,
          texto: normalizar(`${insumo.nombre} ${insumo.categoria} ${insumo.canal} ${insumo.presentacion}`),
        }))
        .sort((a, b) => {
          const canal = (ORDEN_CANAL.get(a.insumo.canal) ?? 9) - (ORDEN_CANAL.get(b.insumo.canal) ?? 9);
          if (canal !== 0) return canal;
          const categoria = a.insumo.categoria.localeCompare(b.insumo.categoria, 'es');
          if (categoria !== 0) return categoria;
          return a.insumo.nombre.localeCompare(b.insumo.nombre, 'es');
        }),
    [insumos],
  );

  const porCanal = useMemo(() => {
    const cuenta = new Map<CanalId, number>();
    for (const { insumo } of indice) cuenta.set(insumo.canal, (cuenta.get(insumo.canal) ?? 0) + 1);
    return cuenta;
  }, [indice]);

  const categoriasDisponibles = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const { insumo } of indice) {
      if (canalActivo !== 'todos' && insumo.canal !== canalActivo) continue;
      cuenta.set(insumo.categoria, (cuenta.get(insumo.categoria) ?? 0) + 1);
    }
    return [...cuenta.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [indice, canalActivo]);

  const resultados = useMemo(() => {
    const palabras = normalizar(consulta.trim()).split(/\s+/).filter(Boolean);
    return indice
      .filter(({ insumo, texto }) => {
        if (canalActivo !== 'todos' && insumo.canal !== canalActivo) return false;
        if (categorias.length > 0 && !categorias.includes(insumo.categoria)) return false;
        return palabras.every((palabra) => texto.includes(palabra));
      })
      .map((entrada) => entrada.insumo);
  }, [indice, consulta, canalActivo, categorias]);

  // La paginacion se reinicia sola al cambiar los filtros, sin efectos de por medio.
  const firma = `${consulta}|${canalActivo}|${categorias.join(',')}`;
  const visibles = paginacion.firma === firma ? paginacion.visibles : PAGINA;
  const verMas = useCallback(() => setPaginacion({ firma, visibles: visibles + PAGINA }), [firma, visibles]);

  // Carga progresiva al acercarse al final de la lista.
  useEffect(() => {
    const nodo = centinela.current;
    if (!nodo || visibles >= resultados.length) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) verMas();
      },
      { rootMargin: '320px' },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [visibles, resultados.length, verMas]);

  const hayFiltros = busqueda !== '' || canalActivo !== 'todos' || categorias.length > 0;

  const limpiarFiltros = useCallback(() => {
    setBusqueda('');
    setCanalActivo('todos');
    setCategorias([]);
  }, []);

  const alternarCategoria = useCallback((categoria: string) => {
    setCategorias((previas) =>
      previas.includes(categoria) ? previas.filter((c) => c !== categoria) : [...previas, categoria],
    );
  }, []);

  const despachar = useCallback(
    async (lineas: LineaNueva[], razon: string, alTerminar: () => void) => {
      if (!sesion || lineas.length === 0) return;
      setEnviando(true);
      try {
        const { diferido } = await enviar(sesion.nombre, lineas, razon);
        alTerminar();
        avisar(
          diferido
            ? 'Sin conexion: el pedido quedo guardado y se enviara automaticamente.'
            : 'Pedido enviado a gobernanta.',
          diferido ? 'info' : 'exito',
        );
        router.push('/solicitudes');
      } catch (e) {
        avisar(e instanceof Error ? e.message : 'No se pudo enviar el pedido.', 'error');
      } finally {
        setEnviando(false);
      }
    },
    [avisar, enviar, router, sesion],
  );

  const enviarTodo = useCallback(async () => {
    await despachar(
      anotaciones.map((a) => ({ insumoId: a.insumoId, cantidad: a.cantidad })),
      motivo,
      () => {
        vaciar();
        setMotivo('');
      },
    );
  }, [anotaciones, despachar, motivo, vaciar]);

  const enviarUno = useCallback(
    async (anotacion: Anotacion) => {
      await despachar(
        [{ insumoId: anotacion.insumoId, cantidad: anotacion.cantidad }],
        `Pedido urgente: ${anotacion.nombre}`,
        () => quitar(anotacion.insumoId),
      );
    },
    [despachar, quitar],
  );

  const cargando = estado === 'cargando' && insumos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Cuaderno de cocina"
        descripcion="Anota las cantidades que faltan y envia todo como un solo pedido a gobernanta."
      />

      <Segmentado
        etiqueta="Secciones del cuaderno"
        valor={pestana}
        alCambiar={setPestana}
        className="w-full sm:w-auto"
        opciones={[
          { valor: 'catalogo', etiqueta: 'Catalogo', icono: <Search className="size-4" aria-hidden /> },
          { valor: 'cuaderno', etiqueta: 'Mi cuaderno', icono: <NotebookPen className="size-4" aria-hidden />, cuenta: total },
        ]}
      />

      {pestana === 'catalogo' ? (
        <div className="flex flex-col gap-4">
          {error && insumos.length === 0 && (
            <AvisoError
              mensaje={error}
              accion={
                <Boton tamano="sm" variante="secundario" onClick={() => void recargar()}>
                  Reintentar
                </Boton>
              }
            />
          )}

          <Buscador
            etiqueta="Buscar insumos"
            marcador="Buscar por nombre, categoria o canal"
            valor={busqueda}
            alCambiar={setBusqueda}
          />

          <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
            <Chip activo={canalActivo === 'todos'} alPulsar={() => setCanalActivo('todos')} cuenta={indice.length}>
              Todos
            </Chip>
            {CANALES.map((canal) => (
              <Chip
                key={canal.id}
                activo={canalActivo === canal.id}
                alPulsar={() => setCanalActivo(canal.id)}
                cuenta={porCanal.get(canal.id) ?? 0}
              >
                {canal.nombreCorto}
              </Chip>
            ))}
          </div>

          {categoriasDisponibles.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
              {categoriasDisponibles.map(([categoria, cuenta]) => (
                <Chip
                  key={categoria}
                  activo={categorias.includes(categoria)}
                  alPulsar={() => alternarCategoria(categoria)}
                  cuenta={cuenta}
                >
                  {categoria}
                </Chip>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
            <span>
              {resultados.length} {pluralizar(resultados.length, 'insumo', 'insumos')}
              {hayFiltros ? ' segun los filtros' : ' en el catalogo'}
            </span>
            {hayFiltros && (
              <button type="button" onClick={limpiarFiltros} className="font-medium text-brand hover:underline">
                Quitar filtros
              </button>
            )}
          </div>

          {cargando ? (
            <Tarjeta relleno="ninguno">
              <div className="divide-y divide-line">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="flex-1 space-y-2">
                      <Esqueleto className="h-3.5 w-2/5" />
                      <Esqueleto className="h-3 w-1/4" />
                    </div>
                    <Esqueleto className="h-9 w-32" />
                  </div>
                ))}
              </div>
            </Tarjeta>
          ) : resultados.length === 0 ? (
            <Vacio
              titulo="Sin resultados"
              descripcion="Ningun insumo coincide con la busqueda o los filtros activos."
              icono={<ListFilter className="size-8" aria-hidden />}
              accion={
                hayFiltros ? (
                  <Boton variante="secundario" onClick={limpiarFiltros}>
                    Quitar filtros
                  </Boton>
                ) : undefined
              }
            />
          ) : (
            <>
              <Tarjeta relleno="ninguno">
                <ul className="divide-y divide-line">
                  {resultados.slice(0, visibles).map((insumo) => (
                    <FilaInsumo
                      key={insumo.id}
                      insumo={insumo}
                      cantidad={cantidades.get(insumo.id) ?? 0}
                      alFijar={fijar}
                    />
                  ))}
                </ul>
              </Tarjeta>

              {visibles < resultados.length && (
                <div ref={centinela} className="flex justify-center py-1">
                  <Boton variante="secundario" onClick={verMas}>
                    Ver mas insumos ({resultados.length - visibles} restantes)
                  </Boton>
                </div>
              )}
            </>
          )}

          {total > 0 && (
            <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-10 flex items-center gap-3 rounded-card border border-brand-line bg-brand-soft px-4 py-3 shadow-raised md:bottom-4">
              <p className="min-w-0 flex-1 text-[13px] font-medium text-brand">
                {total} {pluralizar(total, 'insumo anotado', 'insumos anotados')}
              </p>
              <Boton tamano="sm" onClick={() => setPestana('cuaderno')}>
                Revisar y enviar
              </Boton>
            </div>
          )}
        </div>
      ) : (
        <PanelAnotaciones
          anotaciones={anotaciones}
          motivo={motivo}
          alCambiarMotivo={setMotivo}
          alCambiarCantidad={(insumoId, cantidad) => {
            const insumo = porId.get(insumoId);
            if (insumo) fijar(insumo, cantidad);
          }}
          alQuitar={quitar}
          alEnviarTodo={enviarTodo}
          alEnviarUno={enviarUno}
          alVerCatalogo={() => setPestana('catalogo')}
          enviando={enviando}
        />
      )}
    </div>
  );
}
