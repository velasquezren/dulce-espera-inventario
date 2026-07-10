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
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { activeModule, setModule, logout, user, isSidebarCollapsed, setSidebarCollapsed } = useApp();

  if (!user || activeModule === 'login') return null;

  const navItems: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Mi Cuaderno', icon: Package },
    { id: 'requests', label: 'Solicitudes', icon: ClipboardList },
    { id: 'receptions', label: 'Recepciones', icon: Truck },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside 
      className={`hidden md:flex md:flex-col bg-white border-r border-[#e2e8f0]/85 md:fixed md:top-0 md:bottom-0 md:left-0 md:z-30 shrink-0 transition-all duration-300 ease-in-out relative ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header / Interactive Logo Toggle */}
      <div 
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        className={`h-20 border-b border-[#e2e8f0] flex items-center transition-all duration-300 cursor-pointer hover:bg-slate-50/80 active:scale-98 tap-bounce no-select ${
          isSidebarCollapsed ? 'px-4 justify-center' : 'px-5 justify-start gap-3'
        }`}
        title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img 
            src="/logo.svg" 
            alt="Dulce Espera Logo" 
            className={`shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? 'w-11 h-11' : 'w-10 h-10'
            }`} 
          />
          {!isSidebarCollapsed && (
            <div className="flex flex-col animate-fade-in whitespace-nowrap overflow-hidden">
              <span className="font-extrabold text-sm tracking-tight text-primary uppercase">DULCE ESPERA</span>
              <span className="text-[10px] font-bold text-secondary tracking-wider uppercase leading-none mt-0.5">Pedidos de Cocina</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className={`flex-1 py-6 flex flex-col gap-2 overflow-y-auto transition-all duration-300 ${
        isSidebarCollapsed ? 'px-2 items-center' : 'px-4'
      }`}>
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
              title={isSidebarCollapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-semibold tracking-wide text-left cursor-pointer transition-all duration-200 tap-bounce no-select ${
                isSidebarCollapsed 
                  ? 'w-12 h-12 justify-center px-0 py-0' 
                  : 'px-4 py-3 gap-3 w-full'
              } ${
                isActive
                  ? 'bg-primary/5 text-primary border-l-4 border-primary rounded-l-none pl-3'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <Icon className={`w-5.5 h-5.5 stroke-[1.8] shrink-0 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`} />
              {!isSidebarCollapsed && (
                <span className="animate-fade-in whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={`p-4 border-t border-[#e2e8f0] bg-slate-50/50 flex transition-all duration-300 ${
        isSidebarCollapsed ? 'justify-center pb-6' : 'pb-8'
      }`}>
        <button
          onClick={logout}
          title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center rounded-lg text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer tap-bounce no-select ${
            isSidebarCollapsed 
              ? 'w-12 h-12 justify-center px-0 py-0' 
              : 'w-full px-4 py-2.5 gap-3'
          }`}
        >
          <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
          {!isSidebarCollapsed && (
            <span className="animate-fade-in whitespace-nowrap overflow-hidden">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
