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
  X
} from 'lucide-react';

export default function Sidebar() {
  const { activeModule, setModule, logout, user, isMobileSidebarOpen, setMobileSidebarOpen } = useApp();

  if (!user || activeModule === 'login') return null;

  const navItems: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'requests', label: 'Solicitudes', icon: ClipboardList },
    { id: 'receptions', label: 'Recepciones', icon: Truck },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-[#e2e8f0]/80 flex flex-col min-h-screen
        transition-transform duration-300 ease-out md:transition-none
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#e2e8f0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Clinica Montalvo Logo" className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#006156]">CLÍNICA MONTALVO</span>
              <span className="text-[10px] font-semibold text-[#39ADA3] tracking-wider uppercase">Inventarios Cocina</span>
            </div>
          </div>
          {/* Close Button on Mobile */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 tap-bounce"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
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
                  ? 'bg-[#006156]/5 text-[#006156] border-l-4 border-[#006156] rounded-l-none pl-3'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#006156]'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? 'text-[#006156]' : 'text-slate-400'}`} />
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
    </>
  );
}
