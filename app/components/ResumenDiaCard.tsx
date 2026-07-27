'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle2, PackageCheck } from 'lucide-react';

interface ResumenDiaCardProps {
  total: number;
  faltantes: number;
  pedidos: number;
  recibidos: number;
}

export default function ResumenDiaCard({ total, faltantes, pedidos, recibidos }: ResumenDiaCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-clinical-sm space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e6f0ef] text-[#006156] flex items-center justify-center font-bold">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#006156] uppercase tracking-wide">
              Resumen Operativo de la Cocina
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold">
              Total de insumos monitoreados: <strong className="text-slate-700">{total}</strong>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase text-[#39ADA3] bg-[#ebf7f6] px-2.5 py-1 rounded-full border border-[#39ADA3]/30 hidden sm:inline-block">
          Sincronizado con FileMaker
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Faltantes */}
        <div className="bg-rose-50/70 border border-rose-200/60 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Faltan</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-800 mt-1">
            {faltantes}
          </span>
        </div>

        {/* Pedidos */}
        <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Ya Pedidos</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
            {pedidos}
          </span>
        </div>

        {/* Recibidos / Listos */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Llegaron</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#006156] mt-1">
            {recibidos}
          </span>
        </div>
      </div>
    </div>
  );
}
