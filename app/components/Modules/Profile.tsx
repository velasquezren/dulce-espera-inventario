'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../UI';
import { User, LogOut, UserCheck } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useApp();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#006156]">Mi Perfil de Usuario</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Información de tu cuenta clínica y privilegios de acceso.
        </p>
      </div>

      {/* Main card */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center pb-6 border-b border-[#f1f5f9] mb-6">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-full bg-[#006156]/10 text-[#006156] flex items-center justify-center mb-4">
            <User className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h2 className="text-lg font-black text-slate-800 tracking-tight">{user.name}</h2>
          <span className="text-xs font-bold text-[#39ADA3] bg-[#ebf7f6] px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
            {user.role}
          </span>
        </div>

        {/* User Properties details */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-2.5 border-b border-[#f1f5f9]/70">
            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wide">Usuario de Sistema</span>
            <span className="font-bold text-slate-700">{user.username}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wide">Estado de Cuenta</span>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <UserCheck className="w-4 h-4" />
              Sesión Activa
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="border-t border-[#f1f5f9] pt-6 mt-6">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full font-bold h-12 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 tracking-wide"
          >
            <LogOut className="w-5 h-5 mr-2 text-rose-500" />
            Cerrar Sesión del Dispositivo
          </Button>
        </div>
      </Card>
    </div>
  );
}
