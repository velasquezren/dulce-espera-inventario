'use client';

import { CheckCircle2, CloudOff, Download, LogOut, Smartphone } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Insignia } from '@/components/ui/insignia';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/components/ui/superficie';
import { iniciales } from '@/lib/texto';
import { useEnLinea } from '@/lib/hooks/use-conexion';
import { useInstalacion } from '@/lib/hooks/use-instalacion';
import { usePedidos } from '@/lib/hooks/use-pedidos';
import { useSesion } from '@/lib/hooks/use-sesion';

export function VistaCuenta() {
  const { sesion, salir } = useSesion();
  const { instalada, disponible, plataforma, instalar } = useInstalacion();
  const enLinea = useEnLinea();
  const { enCola } = usePedidos();

  if (!sesion) return null;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina titulo="Mi cuenta" descripcion="Datos de la sesion y estado de la aplicacion en este dispositivo." />

      <Tarjeta>
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand">
            {iniciales(sesion.nombre)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-ink">{sesion.nombre}</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">{sesion.usuario}</p>
          </div>
          <Insignia tono="marca" className="ml-auto capitalize">
            {sesion.rol}
          </Insignia>
        </div>
      </Tarjeta>

      <Seccion titulo="Estado del dispositivo">
        <div className="grid gap-3 sm:grid-cols-2">
          <Tarjeta className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-ink-muted">
              {enLinea ? (
                <CheckCircle2 className="size-4 text-exito" aria-hidden />
              ) : (
                <CloudOff className="size-4 text-alerta" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-[13px] font-medium text-ink">{enLinea ? 'Conectado' : 'Sin conexion'}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {enLinea
                  ? 'Los pedidos se envian directamente al servidor.'
                  : 'Puedes seguir anotando: los pedidos se guardan y se envian al recuperar la senal.'}
              </p>
            </div>
          </Tarjeta>

          <Tarjeta className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              {enCola > 0 ? (
                <CloudOff className="size-4 text-alerta" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 text-exito" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-[13px] font-medium text-ink">
                {enCola > 0 ? `${enCola} pedidos en espera` : 'Todo sincronizado'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {enCola > 0
                  ? 'Se enviaran automaticamente cuando vuelva la conexion.'
                  : 'No hay pedidos pendientes de enviar en este dispositivo.'}
              </p>
            </div>
          </Tarjeta>
        </div>
      </Seccion>

      <Seccion titulo="Aplicacion instalable">
        <Tarjeta className="flex flex-col gap-3">
          {instalada ? (
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-exito" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Estas usando la aplicacion instalada en el dispositivo, con soporte sin conexion.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Instala la aplicacion para abrirla desde la pantalla de inicio, a pantalla completa y con acceso sin
                conexion.
              </p>
              {disponible ? (
                <Boton
                  variante="secundario"
                  onClick={() => {
                    void instalar();
                  }}
                  className="self-start"
                >
                  <Download className="size-4" aria-hidden />
                  Instalar aplicacion
                </Boton>
              ) : (
                <p className="rounded-control border border-line bg-surface-muted px-3.5 py-2.5 text-xs leading-relaxed text-ink-muted">
                  {plataforma === 'ios'
                    ? 'En iPhone o iPad: abre el menu Compartir de Safari y elige "Agregar a inicio".'
                    : 'Abre el menu del navegador y elige "Instalar aplicacion" o "Agregar a pantalla de inicio".'}
                </p>
              )}
            </>
          )}
        </Tarjeta>
      </Seccion>

      <Boton variante="secundario" onClick={salir} className="self-start text-critico">
        <LogOut className="size-4" aria-hidden />
        Cerrar sesion
      </Boton>
    </div>
  );
}
