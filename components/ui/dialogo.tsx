'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEsCliente } from '@/lib/hooks/use-cliente';
import { Boton, BotonIcono } from './boton';

const FOCALIZABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Portal({ children }: { children: React.ReactNode }) {
  const enCliente = useEsCliente();
  if (!enCliente) return null;
  return createPortal(children, document.body);
}

interface DialogoProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
  pie?: React.ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
}

const ANCHOS = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const;

export function Dialogo({ abierto, alCerrar, titulo, descripcion, children, pie, ancho = 'sm' }: DialogoProps) {
  const panel = useRef<HTMLDivElement>(null);
  const previo = useRef<HTMLElement | null>(null);
  const idTitulo = useId();

  const alTeclado = useCallback(
    (evento: React.KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        alCerrar();
        return;
      }
      if (evento.key !== 'Tab' || !panel.current) return;

      const focos = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCALIZABLES));
      if (focos.length === 0) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    },
    [alCerrar],
  );

  useEffect(() => {
    if (!abierto) return;

    previo.current = document.activeElement as HTMLElement | null;
    const desbordeOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const foco = panel.current?.querySelector<HTMLElement>(FOCALIZABLES);
    (foco ?? panel.current)?.focus();

    return () => {
      document.body.style.overflow = desbordeOriginal;
      previo.current?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-0 backdrop-blur-[2px] animate-aparecer sm:items-center sm:p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) alCerrar();
        }}
      >
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTitulo}
          tabIndex={-1}
          onKeyDown={alTeclado}
          className={cn(
            'flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-panel border border-line bg-surface shadow-overlay animate-subir outline-none sm:rounded-panel',
            ANCHOS[ancho],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 id={idTitulo} className="text-base font-semibold tracking-tight text-ink">
                {titulo}
              </h2>
              {descripcion && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{descripcion}</p>}
            </div>
            <BotonIcono etiqueta="Cerrar" tamano="sm" onClick={alCerrar} className="-mr-1.5 -mt-1">
              <X className="size-4" aria-hidden />
            </BotonIcono>
          </div>

          {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>}

          {pie && (
            <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-muted px-5 py-3.5">
              {pie}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

interface ConfirmacionProps {
  abierto: boolean;
  alCerrar: () => void;
  alConfirmar: () => void;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  procesando?: boolean;
  destructivo?: boolean;
  /** Aviso adicional cuando la accion se puede completar pero conviene revisar algo. */
  advertencia?: string;
  children?: React.ReactNode;
}

export function Confirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  procesando = false,
  destructivo = false,
  advertencia,
  children,
}: ConfirmacionProps) {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      descripcion={mensaje}
      pie={
        <>
          <Boton variante="fantasma" onClick={alCerrar} disabled={procesando}>
            {textoCancelar}
          </Boton>
          <Boton
            variante={destructivo ? 'peligro' : 'principal'}
            onClick={alConfirmar}
            cargando={procesando}
          >
            {textoConfirmar}
          </Boton>
        </>
      }
    >
      {advertencia && (
        <p className="rounded-control border border-alerta-line bg-alerta-soft px-3.5 py-2.5 text-[13px] text-alerta">
          {advertencia}
        </p>
      )}
      {children}
    </Dialogo>
  );
}
