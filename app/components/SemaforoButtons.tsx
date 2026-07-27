'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export type InsumoEstado = 'disponible' | 'faltante' | 'pedido' | 'recibido';

interface SemaforoButtonsProps {
  currentEstado: InsumoEstado;
  onEstadoChange: (newEstado: InsumoEstado) => void;
  disabled?: boolean;
}

export default function SemaforoButtons({ currentEstado, onEstadoChange, disabled = false }: SemaforoButtonsProps) {
  return (
    <div className="flex items-center gap-1.5 w-full sm:w-auto font-sans">
      {/* 🔴 Button 1: Falta */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEstadoChange('faltante')}
        className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 border ${
          currentEstado === 'faltante'
            ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500/30 animate-semaforo-active'
            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
        }`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Falta</span>
      </button>

      {/* 🟡 Button 2: Ya Pedí */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEstadoChange('pedido')}
        className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 border ${
          currentEstado === 'pedido'
            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30 animate-semaforo-active'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
        }`}
      >
        <Clock className="w-4 h-4 shrink-0" />
        <span>Ya Pedí</span>
      </button>

      {/* 🟢 Button 3: Llegó */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEstadoChange('recibido')}
        className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 border ${
          currentEstado === 'recibido' || currentEstado === 'disponible'
            ? 'bg-[#39ADA3] text-white border-[#2e8b83] shadow-md ring-2 ring-[#39ADA3]/30 animate-semaforo-active'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Llegó</span>
      </button>
    </div>
  );
}
