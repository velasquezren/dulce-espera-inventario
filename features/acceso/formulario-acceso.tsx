'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/campo';
import { Logotipo } from '@/components/shell/marca';
import { Pantalla } from '@/components/shell/pantalla-carga';
import { useSesion } from '@/lib/hooks/use-sesion';

export function FormularioAcceso() {
  const router = useRouter();
  const { estado, sesion, acceder, accederComoCompras } = useSesion();

  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (estado !== 'activa' || !sesion) return;
    router.replace(sesion.rol === 'compras' ? '/compras' : '/panel');
  }, [estado, sesion, router]);

  if (estado === 'cargando') return <Pantalla mensaje="Verificando la sesion" />;
  if (estado === 'activa') return <Pantalla mensaje="Entrando al sistema" />;

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!usuario.trim() || !clave) {
      setError('Escribe tu usuario y tu contrasena.');
      return;
    }

    setEnviando(true);
    setError('');
    const resultado = await acceder(usuario, clave, recordar);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logotipo tamano={64} prioridad />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-brand">Clinica Montalvo</h1>
            <p className="mt-0.5 text-[13px] text-ink-muted">Inventario e insumos de cocina</p>
          </div>
        </div>

        <div className="mt-7 rounded-panel border border-line bg-surface p-6 shadow-card">
          <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
            {error && (
              <p role="alert" className="rounded-control border border-critico-line bg-critico-soft px-3.5 py-2.5 text-[13px] text-critico">
                {error}
              </p>
            )}

            <Entrada
              id="usuario"
              etiqueta="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={enviando}
              required
            />

            <div className="relative">
              <Entrada
                id="clave"
                etiqueta="Contrasena"
                type={verClave ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete="current-password"
                disabled={enviando}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                className="absolute right-1.5 top-[26px] flex size-9 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {verClave ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-soft">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="size-4 rounded border-line-strong accent-brand"
              />
              Mantener la sesion abierta en este dispositivo
            </label>

            <Boton type="submit" ancho tamano="lg" cargando={enviando}>
              Ingresar
            </Boton>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Acceso del area de compras</p>
            <button
              type="button"
              onClick={accederComoCompras}
              className="mt-2.5 flex w-full items-center gap-3 rounded-control border border-line-strong bg-surface px-3.5 py-3 text-left transition-colors hover:border-brand-line hover:bg-brand-soft/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
                <ShoppingBag className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">Entrar como compras</span>
                <span className="block text-[11px] text-ink-muted">Acceso directo, sin contrasena</span>
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
          <ShieldCheck className="size-3.5 text-accent" aria-hidden />
          Uso interno de la Clinica Montalvo
        </p>
      </div>
    </main>
  );
}
