'use client';

import React from 'react';
import { useApp, AppModule } from '../../context/AppContext';
import {
  ClipboardList,
  Truck,
  PlusCircle,
  History,
  MessageCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user, setModule } = useApp();

  const actions: Array<{
    id: AppModule;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    hoverBorder: string;
  }> = [
    {
      id: 'inventory',
      title: 'Anotar en Cuaderno',
      description: 'Registra los insumos que hacen falta para la cocina.',
      icon: PlusCircle,
      colorClass: 'text-primary bg-primary-light',
      hoverBorder: 'hover:border-primary'
    },
    {
      id: 'requests',
      title: 'Mis Solicitudes',
      description: 'Consulta el estado y avance de tus pedidos enviados.',
      icon: ClipboardList,
      colorClass: 'text-primary bg-primary-light',
      hoverBorder: 'hover:border-primary'
    },
    {
      id: 'whatsapp-dispatch',
      title: 'Despachar WhatsApp',
      description: 'Envía el reporte del pedido a un coordinador para su aprobación.',
      icon: MessageCircle,
      colorClass: 'text-primary bg-primary-light',
      hoverBorder: 'hover:border-primary'
    },
    {
      id: 'receptions',
      title: 'Confirmar Recepción',
      description: 'Verifica y firma la entrega de productos de Gobernación.',
      icon: Truck,
      colorClass: 'text-primary bg-primary-light',
      hoverBorder: 'hover:border-primary'
    },
    {
      id: 'history',
      title: 'Historial / Bitácora',
      description: 'Revisa el registro histórico de todas las acciones de la cocina.',
      icon: History,
      colorClass: 'text-primary bg-primary-light',
      hoverBorder: 'hover:border-primary'
    }
  ];

  return (
    <div className="space-y-8 animate-view-enter py-4 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Acciones Rápidas</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Hola, {user?.name || 'Personal de Cocina'}. Selecciona una acción para comenzar.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => setModule(act.id)}
              className={`w-full text-left bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-clinical-sm hover:shadow-clinical-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-start gap-4 ${act.hoverBorder}`}
            >
              <div className={`p-3.5 rounded-xl ${act.colorClass} shrink-0`}>
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1 mt-0.5">
                <h3 className="font-extrabold text-slate-800 text-base leading-snug tracking-tight">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
