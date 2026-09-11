'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, LogOut, RotateCw, ShoppingBag } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Buscador } from '@/components/ui/buscador';
import { Chip } from '@/components/ui/filtros';
import { Confirmacion } from '@/components/ui/dialogo';
import { AvisoError, Esqueleto, Vacio } from '@/components/ui/estados';
import { Metrica } from '@/components/ui/metrica';
import { useAvisos } from '@/components/ui/avisos';
import { Marca } from '@/components/shell/marca';
import { reportes } from '@/lib/api/reportes';
import { CLAVES } from '@/lib/almacenamiento';
import { estado as definicionEstado, estaAbierto } from '@/lib/domain/estados';
import type { EstadoPedido, Pedido } from '@/lib/domain/tipos';
import { normalizar } from '@/lib/texto';
import { useChecklist } from '@/lib/hooks/use-checklist';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';
import { TarjetaCompra } from './tarjeta-compra';
import { HojaImpresion } from './hoja-impresion';

type Filtro = 'porComprar' | 'comprados' | 'todos';

interface CambioPendiente {
  pedido: Pedido;
  estado: EstadoPedido;
}

export function VistaCompras() {
  const { avisar } = useAvisos();
  const { salir } = useSesion();
  const { pedidos, estado, error, recargar, cambiarEstado } = usePedidos();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('porComprar');
  const [cambio, setCambio] = useState<CambioPendiente | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [imprimir, setImprimir] = useState<Pedido | null>(null);

  useEffect(() => {
    if (!imprimir) return;
    const id = window.setTimeout(() => {
      window.print();
      setImprimir(null);
    }, 80);
    return () => window.clearTimeout(id);
  }, [imprimir]);

  const lineasVigentes = useMemo(
    () => new Set(pedidos.flatMap((pedido) => pedido.lineas.map((linea) => linea.id))),
    [pedidos],
  );
  const { marcadas, alternar } = useChecklist(CLAVES.checklist, lineasVigentes);

  const porComprar = useMemo(
    () => pedidos.filter((p) => estaAbierto(p.estado) || p.estado === 'aceptado'),
    [pedidos],
  );
  const comprados = useMemo(
    () => pedidos.filter((p) => p.estado === 'comprado' || p.estado === 'entregado'),
    [pedidos],
  );

  const visibles = useMemo(() => {
    const base = filtro === 'porComprar' ? porComprar : filtro === 'comprados' ? comprados : pedidos;
    const consulta = normalizar(busqueda.trim());
    if (!consulta) return base;
    return base.filter(
      (pedido) =>
        normalizar(pedido.folio).includes(consulta) ||
        normalizar(pedido.solicitante).includes(consulta) ||
        pedido.lineas.some((linea) => normalizar(linea.nombre).includes(consulta)),
    );
  }, [filtro, porComprar, comprados, pedidos, busqueda]);

  const confirmarCambio = async () => {
    if (!cambio) return;
    setProcesando(true);
    try {
      await cambiarEstado(cambio.pedido.id, cambio.estado);
      avisar(`Pedido ${cambio.pedido.folio} marcado como ${definicionEstado(cambio.estado).etiqueta.toLowerCase()}.`);
      setCambio(null);
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo actualizar el pedido.', 'error');
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
    <>
      <div data-no-imprimir className="min-h-[100dvh] bg-canvas">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/90 px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur sm:px-6">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Marca />
              <span className="hidden rounded-full border border-brand-line bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand sm:inline-block">
                Área de compras
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Boton variante="secundario" tamano="sm" onClick={actualizar} cargando={actualizando}>
                <RotateCw className="size-4" aria-hidden />
                <span className="hidden sm:inline">Actualizar</span>
              </Boton>
              <Boton variante="fantasma" tamano="sm" onClick={salir} className="text-critico">
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </Boton>
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Lista de compras</h1>
            <p className="mt-1 text-[13px] text-ink-muted">
              Marca los insumos a medida que los compras. Las marcas quedan guardadas en este dispositivo.
            </p>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <Metrica etiqueta="Por comprar" valor={porComprar.length} tono="alerta" />
            <Metrica etiqueta="Comprados" valor={comprados.length} tono="exito" />
          </div>

          <Buscador
            etiqueta="Buscar pedidos"
            marcador="Buscar por número, insumo o solicitante"
            valor={busqueda}
            alCambiar={setBusqueda}
          />

          <div className="flex flex-wrap gap-2">
            <Chip activo={filtro === 'porComprar'} alPulsar={() => setFiltro('porComprar')} cuenta={porComprar.length}>
              Por comprar
            </Chip>
            <Chip activo={filtro === 'comprados'} alPulsar={() => setFiltro('comprados')} cuenta={comprados.length}>
              Comprados
            </Chip>
            <Chip activo={filtro === 'todos'} alPulsar={() => setFiltro('todos')} cuenta={pedidos.length}>
              Todos
            </Chip>
          </div>

          <a
            href={reportes.excelPendientes()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-brand hover:underline"
          >
            <FileSpreadsheet className="size-3.5" aria-hidden />
            Excel maestro de pedidos pendientes
          </a>

          {cargando ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Esqueleto key={i} className="h-24 rounded-card" />
              ))}
            </div>
          ) : visibles.length === 0 ? (
            <Vacio
              titulo="No hay pedidos en esta vista"
              descripcion="Cuando cocina envíe una lista nueva aparecerá aquí para comprarla."
              icono={<ShoppingBag className="size-8" aria-hidden />}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {visibles.map((pedido, indice) => (
                <TarjetaCompra
                  key={pedido.id}
                  pedido={pedido}
                  marcadas={marcadas}
                  alMarcar={alternar}
                  alCambiarEstado={(seleccion, siguiente) => setCambio({ pedido: seleccion, estado: siguiente })}
                  alImprimir={setImprimir}
                  inicialAbierto={indice === 0 && filtro === 'porComprar'}
                />
              ))}
            </div>
          )}
        </main>

        <Confirmacion
          abierto={cambio !== null}
          alCerrar={() => setCambio(null)}
          alConfirmar={confirmarCambio}
          titulo="Cambiar el estado del pedido"
          mensaje={
            cambio
              ? `El pedido ${cambio.pedido.folio} pasara a "${definicionEstado(cambio.estado).etiqueta}". Cocina vera el cambio de inmediato.`
              : ''
          }
          textoConfirmar="Confirmar"
          destructivo={cambio?.estado === 'rechazado'}
          procesando={procesando}
        />
      </div>

      {imprimir && <HojaImpresion pedido={imprimir} />}
    </>
  );
}
