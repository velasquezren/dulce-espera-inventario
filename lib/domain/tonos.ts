/** Vocabulario de color compartido por insignias, chips y mensajes. */
export type Tono = 'neutral' | 'marca' | 'info' | 'exito' | 'alerta' | 'critico';

export const TONOS: Record<Tono, string> = {
  neutral: 'bg-surface-muted text-ink-soft border-line',
  marca: 'bg-brand-soft text-brand border-brand-line',
  info: 'bg-info-soft text-info border-info-line',
  exito: 'bg-exito-soft text-exito border-exito-line',
  alerta: 'bg-alerta-soft text-alerta border-alerta-line',
  critico: 'bg-critico-soft text-critico border-critico-line',
};
