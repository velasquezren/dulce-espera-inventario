'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type TipoAviso = 'exito' | 'error' | 'info';

interface Aviso {
  id: number;
  mensaje: string;
  tipo: TipoAviso;
}

interface Valor {
  avisar: (mensaje: string, tipo?: TipoAviso) => void;
}

const Contexto = createContext<Valor | null>(null);

const DURACION_MS = 4000;

const ESTILOS: Record<TipoAviso, { caja: string; icono: React.ReactNode }> = {
  exito: {
    caja: 'border-exito-line bg-exito-soft text-exito',
    icono: <CheckCircle2 className="size-4 shrink-0" aria-hidden />,
  },
  error: {
    caja: 'border-critico-line bg-critico-soft text-critico',
    icono: <AlertTriangle className="size-4 shrink-0" aria-hidden />,
  },
  info: {
    caja: 'border-info-line bg-info-soft text-info',
    icono: <Info className="size-4 shrink-0" aria-hidden />,
  },
};

export function AvisosProvider({ children }: { children: React.ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const contador = useRef(0);
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const cerrar = useCallback((id: number) => {
    setAvisos((previos) => previos.filter((a) => a.id !== id));
    const t = temporizadores.current.get(id);
    if (t) {
      clearTimeout(t);
      temporizadores.current.delete(id);
    }
  }, []);

  const avisar = useCallback(
    (mensaje: string, tipo: TipoAviso = 'exito') => {
      contador.current += 1;
      const id = contador.current;
      setAvisos((previos) => [...previos.slice(-2), { id, mensaje, tipo }]);
      temporizadores.current.set(
        id,
        setTimeout(() => cerrar(id), DURACION_MS),
      );
    },
    [cerrar],
  );

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => {
      pendientes.forEach(clearTimeout);
      pendientes.clear();
    };
  }, []);

  const valor = useMemo<Valor>(() => ({ avisar }), [avisar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end sm:px-0"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-control border px-3.5 py-3 text-[13px] font-medium shadow-raised animate-subir',
              ESTILOS[aviso.tipo].caja,
            )}
          >
            {ESTILOS[aviso.tipo].icono}
            <p className="flex-1 leading-snug">{aviso.mensaje}</p>
            <button
              type="button"
              onClick={() => cerrar(aviso.id)}
              aria-label="Cerrar aviso"
              className="-mr-1 -mt-0.5 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useAvisos(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAvisos requiere <AvisosProvider>');
  return valor;
}
