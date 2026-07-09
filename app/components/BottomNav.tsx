'use client';

import React from 'react';
import { useApp, AppModule } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Truck, 
  User 
} from 'lucide-react';

export default function BottomNav() {
  const { activeModule, setModule, user } = useApp();

  if (!user || activeModule === 'login') return null;

  const items: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'requests', label: 'Solicitudes', icon: ClipboardList },
    { id: 'receptions', label: 'Recepciones', icon: Truck },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e2e8f0] flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = 
          activeModule === item.id || 
          (item.id === 'inventory' && activeModule === 'detail') ||
          (item.id === 'requests' && activeModule === 'request-form');

        return (
          <button
            key={item.id}
            onClick={() => setModule(item.id)}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-lg transition-all duration-100 cursor-pointer ${
              isActive ? 'text-[#006156]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5.5 h-5.5 stroke-[1.8]`} />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
