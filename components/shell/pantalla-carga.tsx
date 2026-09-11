import { Logotipo } from './marca';

export function Pantalla({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <Logotipo tamano={56} prioridad />
      <div>
        <p className="text-sm font-semibold tracking-tight text-brand">Dulce Espera</p>
        <p className="mt-1 text-[13px] text-ink-muted">{mensaje}</p>
      </div>
      <span className="sr-only" role="status">
        {mensaje}
      </span>
    </div>
  );
}
