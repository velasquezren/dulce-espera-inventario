'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip } from '@/components/ui/filtros';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { useAvisos } from '@/components/ui/avisos';
import { CANALES } from '@/lib/domain/canales';
import type { CanalId, Insumo } from '@/lib/domain/tipos';
import { normalizar, pluralizar } from '@/lib/texto';
import { useCatalogo } from '@/lib/hooks/use-catalogo';
import { useCuaderno } from '@/lib/hooks/use-cuaderno';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';
import { FilaInsumo } from './fila-insumo';
import { PanelAnotaciones } from './panel-anotaciones';

const PAGINA = 50;
const ORDEN_CANAL = new Map(CANALES.map((c, indice) => [c.id, indice]));

type Pestana = 'buscar' | 'cuaderno';
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

  const [pestana, setPestana] = useState<Pestana>('buscar');
  const [busqueda, setBusqueda] = useState('');
  const [canalActivo, setCanalActivo] = useState<FiltroCanal>('todos');
  const [paginacion, setPaginacion] = useState({ firma: '', visibles: PAGINA });
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const consulta = useDeferredValue(busqueda);
  const centinela = useRef<HTMLDivElement>(null);

  /** Indice ordenado y sin acentos: se recalcula solo cuando cambia el catalogo. */
  const indice = useMemo<Entrada[]>(
    () =>
      insumos
        .map((insumo) => ({
          insumo,
          texto: normalizar(`${insumo.nombre} ${insumo.categoria} ${insumo.presentacion}`),
        }))
        .sort((a, b) => {
          const canal = (ORDEN_CANAL.get(a.insumo.canal) ?? 9) - (ORDEN_CANAL.get(b.insumo.canal) ?? 9);
          if (canal !== 0) return canal;
          return a.insumo.nombre.localeCompare(b.insumo.nombre, 'es');
        }),
    [insumos],
  );

  const porCanal = useMemo(() => {
    const cuenta = new Map<CanalId, number>();
    for (const { insumo } of indice) cuenta.set(insumo.canal, (cuenta.get(insumo.canal) ?? 0) + 1);
    return cuenta;
  }, [indice]);

  const resultados = useMemo(() => {
    const palabras = normalizar(consulta.trim()).split(/\s+/).filter(Boolean);
    return indice
      .filter(({ insumo, texto }) => {
        if (canalActivo !== 'todos' && insumo.canal !== canalActivo) return false;
        return palabras.every((palabra) => texto.includes(palabra));
      })
      .map((entrada) => entrada.insumo);
  }, [indice, consulta, canalActivo]);

  const firma = `${consulta}|${canalActivo}`;
  const visibles = paginacion.firma === firma ? paginacion.visibles : PAGINA;
  const verMas = useCallback(() => setPaginacion({ firma, visibles: visibles + PAGINA }), [firma, visibles]);

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

  const mandar = useCallback(async () => {
    if (!sesion || anotaciones.length === 0) return;
    setEnviando(true);
    try {
      const { diferido } = await enviar(
        sesion.nombre,
        anotaciones.map((a) => ({ insumoId: a.insumoId, cantidad: a.cantidad })),
        motivo,
      );
      vaciar();
      setMotivo('');
      avisar(
        diferido ? 'Sin internet: el pedido se guardó y se manda solo.' : 'Listo, el pedido ya se mandó.',
        diferido ? 'info' : 'exito',
      );
      router.push('/solicitudes');
    } catch {
      avisar('No se pudo mandar el pedido. Intenta otra vez.', 'error');
    } finally {
      setEnviando(false);
    }
  }, [anotaciones, avisar, enviar, motivo, router, sesion, vaciar]);

  const cargando = estado === 'cargando' && insumos.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina titulo="Cuaderno" descripcion="Anota lo que falta y mándalo todo junto." />

      <div className="grid grid-cols-2 gap-2">
        <Boton
          variante={pestana === 'buscar' ? 'principal' : 'secundario'}
          tamano="lg"
          onClick={() => setPestana('buscar')}
        >
          Buscar
        </Boton>
        <Boton
          variante={pestana === 'cuaderno' ? 'principal' : 'secundario'}
          tamano="lg"
          onClick={() => setPestana('cuaderno')}
        >
          Mi lista{total > 0 ? ` (${total})` : ''}
        </Boton>
      </div>

      {pestana === 'buscar' ? (
        <div className="flex flex-col gap-4">
          {error && insumos.length === 0 && (
            <AvisoError
              mensaje="No se pudo cargar la lista de productos."
              accion={
                <Boton variante="secundario" onClick={() => void recargar()}>
                  Reintentar
                </Boton>
              }
            />
          )}

          <Buscador
            etiqueta="Buscar productos"
            marcador="Escribe lo que buscas"
            valor={busqueda}
            alCambiar={setBusqueda}
          />

          <div className="flex gap-2 overflow-x-auto pb-1 sin-barra">
            <Chip activo={canalActivo === 'todos'} alPulsar={() => setCanalActivo('todos')}>
              Todo
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

          {cargando ? (
            <Tarjeta relleno="ninguno">
              <div className="divide-y divide-line">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 space-y-2">
                      <Esqueleto className="h-4 w-2/5" />
                      <Esqueleto className="h-3.5 w-1/4" />
                    </div>
                    <Esqueleto className="h-11 w-36" />
                  </div>
                ))}
              </div>
            </Tarjeta>
          ) : resultados.length === 0 ? (
            <Vacio
              titulo="No encontramos nada"
              descripcion="Prueba con otra palabra o toca Todo para ver la lista completa."
              icono={<Search className="size-10" aria-hidden />}
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
                <div ref={centinela} className="flex justify-center">
                  <Boton variante="secundario" onClick={verMas}>
                    Ver más productos
                  </Boton>
                </div>
              )}
            </>
          )}

          {total > 0 && (
            <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-10 md:bottom-4">
              <Boton tamano="lg" ancho onClick={() => setPestana('cuaderno')} className="shadow-raised">
                Ver mi lista · {total} {pluralizar(total, 'cosa', 'cosas')}
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
          alEnviar={mandar}
          alVerCatalogo={() => setPestana('buscar')}
          enviando={enviando}
        />
      )}
    </div>
  );
}
