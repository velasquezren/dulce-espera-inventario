'use client';

import React from 'react';
import { useApp, AppModule } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Truck, 
  User,
  MessageCircle
} from 'lucide-react';

export default function BottomNav() {
  const { activeModule, setModule, user } = useApp();

  if (!user || activeModule === 'login') return null;

  const items: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventory', label: 'Cuaderno', icon: Package },
    { id: 'requests', label: 'Solicitudes', icon: ClipboardList },
    { id: 'receptions', label: 'Recepciones', icon: Truck },
    { id: 'whatsapp-dispatch', label: 'WhatsApp', icon: MessageCircle },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 pt-1.5 pb-[calc(4px+env(safe-area-inset-bottom,0px))] pwa-nav-glow border-t border-[#e2e8f0]/60 flex items-center justify-around px-1 z-40 bg-white/95 backdrop-blur-md no-select">
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
            className="relative flex flex-col items-center justify-center flex-1 min-w-[48px] max-w-[76px] h-14 rounded-xl tap-bounce no-select transition-all duration-200 cursor-pointer"
          >
            <div className={`px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              isActive ? 'bg-primary/10 text-primary scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}>
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </div>
            <span className={`text-[9px] mt-1 font-bold tracking-wide truncate max-w-full transition-colors duration-200 ${
              isActive ? 'text-primary font-black' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

