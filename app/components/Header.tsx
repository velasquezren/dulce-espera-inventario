'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Wifi, WifiOff, Check, AlertTriangle } from 'lucide-react';

export default function Header() {
  const { 
    user, 
    isOnline, 
    notifications, 
    markNotificationRead, 
    clearNotifications,
    setModule,
    activeModule
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const moduleTitles: Record<string, string> = {
    dashboard: 'Panel de Control',
    inventory: 'Inventario de Insumos',
    detail: 'Detalle de Insumo',
    'request-form': 'Nueva Solicitud',
    requests: 'Solicitudes de Cocina',
    receptions: 'Recepción de Pedidos',
    history: 'Bitácora de Movimientos',
    profile: 'Mi Perfil de Usuario',
  };

  const currentTitle = moduleTitles[activeModule] || 'Clínica Montalvo';

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0]/85 px-4 md:px-8 flex items-center justify-between no-select">
      {/* Title / Section Name */}
      <div className="flex items-center gap-3">
        {/* Mobile View: Clinic Logo + Brand Title (Static, no click action) */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/logo.svg" alt="Logo Clínica Montalvo" className="w-8 h-8" />
          <span className="font-bold text-[#006156] tracking-tight text-lg">Dulce Espera</span>
        </div>

        {/* Desktop View: Active Page Title */}
        <div className="hidden md:flex items-center gap-3">
          <h2 className="font-extrabold text-slate-800 text-lg tracking-tight">
            {currentTitle}
          </h2>
          <span className="text-xs font-semibold text-[#39ADA3] bg-[#ebf7f6] px-2.5 py-0.5 rounded-full">
            Cocina y Nutrición
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className="flex items-center">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">En línea</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 animate-pulse-subtle">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo Offline</span>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-slate-100/80 active:scale-95 text-slate-600 hover:text-primary transition-all duration-150 focus:outline-none tap-bounce flex items-center justify-center"
            >
              <Bell className="w-5.5 h-5.5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm px-1 shrink-0 leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-card border border-[#e2e8f0]/80 shadow-clinical-lg py-2 z-50 animate-view-enter max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-primary">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs font-bold text-primary hover:underline transition-all cursor-pointer"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#f1f5f9]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                      No hay notificaciones.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setModule('requests');
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          !notif.read ? 'bg-primary-light/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-xs text-[#0f172a]">{notif.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-1 font-bold">{notif.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info Capsule (Desktop) */}
        {user && (
          <div
            onClick={() => setModule('profile')}
            className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-4 cursor-pointer hover:opacity-80 transition-opacity tap-bounce"
          >
            <div className="w-8 h-8 rounded-full bg-[#006156]/10 text-[#006156] font-bold flex items-center justify-center text-sm">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
