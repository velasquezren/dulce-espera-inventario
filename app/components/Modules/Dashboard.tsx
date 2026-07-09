'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../UI';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  Truck,
  PlusCircle,
  Package,
  History,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    products, 
    requests, 
    receptions, 
    setModule 
  } = useApp();

  // Statistics calculation
  const pendingRequests = requests.filter(r => r.status === 'Pendiente').length;
  
  const criticalProducts = products.filter(p => p.stock <= p.minStock).length;
  
  const approvedRequests = requests.filter(
    r => r.status === 'Aprobado' || r.status === 'Comprado' || r.status === 'En camino'
  ).length;

  const receivedToday = receptions.filter((r) => {
    if (r.status !== 'Recibido' || !r.receivedDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return r.receivedDate.startsWith(today);
  }).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#006156]">Panel de Control</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Resumen operativo del abasto de cocina de Clínica Montalvo.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Solicitudes Pendientes */}
        <Card 
          onClick={() => setModule('requests')}
          className="cursor-pointer hover:border-[#39ADA3] group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-400 block tracking-wide uppercase">
                Sol. Pendientes
              </span>
              <span className="text-3xl font-extrabold text-[#0f172a] mt-1 block">
                {pendingRequests}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-[#ebf7f6] group-hover:text-[#39ADA3] transition-colors">
              <ClipboardList className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-bold text-[#39ADA3] group-hover:underline">
            <span>Ver solicitudes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Card>

        {/* KPI 2: Productos Críticos */}
        <Card 
          onClick={() => setModule('inventory')}
          className="cursor-pointer hover:border-red-200 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-400 block tracking-wide uppercase">
                Prod. Críticos
              </span>
              <span className={`text-3xl font-extrabold mt-1 block ${criticalProducts > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {criticalProducts}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg transition-colors ${criticalProducts > 0 ? 'bg-rose-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-500 group-hover:text-red-600">
            <span>Revisar niveles de stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Card>

        {/* KPI 3: Solicitudes Aprobadas */}
        <Card 
          onClick={() => setModule('requests')}
          className="cursor-pointer hover:border-[#006156] group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-400 block tracking-wide uppercase">
                Aprobados en Curso
              </span>
              <span className="text-3xl font-extrabold text-[#0f172a] mt-1 block">
                {approvedRequests}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-[#e6f0ef] group-hover:text-[#006156] transition-colors">
              <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-bold text-[#006156] group-hover:underline">
            <span>Seguimiento de pedidos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Card>

        {/* KPI 4: Productos Recibidos Hoy */}
        <Card 
          onClick={() => setModule('receptions')}
          className="cursor-pointer hover:border-[#39ADA3] group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-400 block tracking-wide uppercase">
                Recibidos Hoy
              </span>
              <span className="text-3xl font-extrabold text-[#0f172a] mt-1 block">
                {receivedToday}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-[#ebf7f6] group-hover:text-[#39ADA3] transition-colors">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-bold text-[#39ADA3] group-hover:underline">
            <span>Ver recepciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Card>
      </div>

      {/* Quick Access Menu */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#006156] tracking-wide uppercase">
          Accesos Rápidos
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Access 1: Solicitar Insumos */}
          <button
            onClick={() => setModule('inventory')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-[#e2e8f0] rounded-[12px] hover:border-[#006156] hover:bg-[#e6f0ef]/20 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,97,86,0.01)]"
          >
            <div className="w-12 h-12 rounded-full bg-[#e6f0ef] text-[#006156] flex items-center justify-center mb-3">
              <PlusCircle className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="font-bold text-sm text-[#006156] tracking-wide">Solicitar Insumos</span>
            <span className="text-xs text-slate-400 mt-1">Crear nueva requisición</span>
          </button>

          {/* Quick Access 2: Ver Inventario */}
          <button
            onClick={() => setModule('inventory')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-[#e2e8f0] rounded-[12px] hover:border-[#006156] hover:bg-[#e6f0ef]/20 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,97,86,0.01)]"
          >
            <div className="w-12 h-12 rounded-full bg-[#ebf7f6] text-[#39ADA3] flex items-center justify-center mb-3">
              <Package className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="font-bold text-sm text-[#006156] tracking-wide">Ver Inventario</span>
            <span className="text-xs text-slate-400 mt-1">Consultar productos y niveles</span>
          </button>

          {/* Quick Access 3: Historial */}
          <button
            onClick={() => setModule('history')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-[#e2e8f0] rounded-[12px] hover:border-[#006156] hover:bg-[#e6f0ef]/20 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,97,86,0.01)]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
              <History className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="font-bold text-sm text-[#006156] tracking-wide">Bitácora / Historial</span>
            <span className="text-xs text-slate-400 mt-1">Historial de entradas y salidas</span>
          </button>

          {/* Quick Access 4: Recepciones */}
          <button
            onClick={() => setModule('receptions')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-[#e2e8f0] rounded-[12px] hover:border-[#006156] hover:bg-[#e6f0ef]/20 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,97,86,0.01)]"
          >
            <div className="w-12 h-12 rounded-full bg-[#ebf7f6] text-[#39ADA3] flex items-center justify-center mb-3">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="font-bold text-sm text-[#006156] tracking-wide">Recepciones</span>
            <span className="text-xs text-slate-400 mt-1">Ingresar pedidos recibidos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
