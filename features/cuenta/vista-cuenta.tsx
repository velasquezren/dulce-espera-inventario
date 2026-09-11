'use client';

import { Download, LogOut, Smartphone } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { EncabezadoPagina, Tarjeta } from '@/components/ui/superficie';
import { iniciales } from '@/lib/texto';
import { useInstalacion } from '@/lib/hooks/use-instalacion';
import { useSesion } from '@/lib/hooks/use-sesion';

export function VistaCuenta() {
  const { sesion, salir } = useSesion();
  const { instalada, disponible, plataforma, instalar } = useInstalacion();

  if (!sesion) return null;

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina titulo="Mi cuenta" />

      <Tarjeta>
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-xl font-semibold text-brand">
            {iniciales(sesion.nombre)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-ink">{sesion.nombre}</p>
            <p className="mt-0.5 text-[15px] capitalize text-ink-muted">{sesion.rol}</p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="text-base font-semibold text-ink">
              {instalada ? 'La app ya está instalada' : 'Instala la app en el teléfono'}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">
              {instalada
                ? 'La estás usando desde la pantalla de inicio y funciona aunque se corte el internet.'
                : 'Se abre desde la pantalla de inicio, más rápido y sin necesidad de buscar la página.'}
            </p>
          </div>
        </div>

        {!instalada &&
          (disponible ? (
            <Boton
              tamano="lg"
              ancho
              onClick={() => {
                void instalar();
              }}
            >
              <Download className="size-5" aria-hidden />
              Instalar la app
            </Boton>
          ) : (
            <p className="rounded-control border border-line bg-surface-muted px-4 py-3 text-sm leading-relaxed text-ink-soft">
              {plataforma === 'ios'
                ? 'En iPhone o iPad: toca el botón de Compartir de Safari y elige "Agregar a inicio".'
                : 'Abre el menú del navegador y elige "Instalar aplicación".'}
            </p>
          ))}
      </Tarjeta>

      <Boton variante="secundario" tamano="lg" ancho onClick={salir} className="text-critico">
        <LogOut className="size-5" aria-hidden />
        Cerrar sesión
      </Boton>
    </div>
  );
}
