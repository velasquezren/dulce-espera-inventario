'use client';

import React from 'react';
import { useApp, AppModule } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Truck, 
  History, 
  User, 
  LogOut,
  X,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { activeModule, setModule, logout, user } = useApp();

  if (!user || activeModule === 'login') return null;

  const navItems: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Mi Cuaderno', icon: Package },
    { id: 'requests', label: 'Solicitudes', icon: ClipboardList },
    { id: 'receptions', label: 'Recepciones', icon: Truck },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'manage-products', label: 'Gestionar Insumos', icon: Settings },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-[#e2e8f0]/80 md:sticky md:top-0 md:h-[100dvh] shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#e2e8f0] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Dulce Espera Logo" className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-primary">DULCE ESPERA</span>
            <span className="text-[10px] font-semibold text-secondary tracking-wider uppercase">Pedidos de Cocina</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeModule === item.id || 
            (item.id === 'inventory' && activeModule === 'detail') ||
            (item.id === 'requests' && activeModule === 'request-form');

          return (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-left cursor-pointer tap-bounce no-select ${
                isActive
                  ? 'bg-primary/5 text-primary border-l-4 border-primary rounded-l-none pl-3'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#e2e8f0] bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer tap-bounce no-select"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
