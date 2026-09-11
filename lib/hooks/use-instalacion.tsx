'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Plataforma = 'android' | 'ios' | 'escritorio';

interface Valor {
  instalada: boolean;
  /** true cuando el navegador ofrece el dialogo nativo de instalacion. */
  disponible: boolean;
  plataforma: Plataforma;
  instalar: () => Promise<boolean>;
}

const Contexto = createContext<Valor | null>(null);

function suscribirInstalacion(alCambiar: () => void): () => void {
  const consulta = window.matchMedia('(display-mode: standalone)');
  consulta.addEventListener('change', alCambiar);
  window.addEventListener('appinstalled', alCambiar);
  return () => {
    consulta.removeEventListener('change', alCambiar);
    window.removeEventListener('appinstalled', alCambiar);
  };
}

function estaInstalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'escritorio';
}

const sinCambios = () => () => {};

export function InstalacionProvider({ children }: { children: React.ReactNode }) {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null);

  const instalada = useSyncExternalStore(suscribirInstalacion, estaInstalada, () => false);
  const plataforma = useSyncExternalStore<Plataforma>(sinCambios, detectarPlataforma, () => 'escritorio');

  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacion);
    };
    const instalado = () => setEvento(null);

    window.addEventListener('beforeinstallprompt', capturar);
    window.addEventListener('appinstalled', instalado);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturar);
      window.removeEventListener('appinstalled', instalado);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return false;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    setEvento(null);
    return outcome === 'accepted';
  }, [evento]);

  const valor = useMemo<Valor>(
    () => ({ instalada, disponible: evento !== null, plataforma, instalar }),
    [instalada, evento, plataforma, instalar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useInstalacion(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useInstalacion requiere <InstalacionProvider>');
  return valor;
}
