import Link from 'next/link';
import { Logotipo } from '@/components/shell/marca';

export default function NoEncontrado() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <Logotipo tamano={52} />
      <div className="max-w-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Página no encontrada</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          La dirección que abriste no existe o fue movida.
        </p>
      </div>
      <Link
        href="/panel"
        className="inline-flex h-11 items-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
      >
        Volver al panel
      </Link>
    </div>
  );
}
