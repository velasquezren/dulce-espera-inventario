'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Input } from '../UI';
import { ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, loginAsCompras } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password, rememberMe);
      if (!success) {
        setError('Credenciales inválidas. Intente de nuevo.');
      }
    } catch {
      setError('Error de conexión. Intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center p-4 bg-[#f8fafc] overflow-hidden select-none font-sans">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-2xl shadow-clinical-lg p-7 text-center animate-fade-in -translate-y-8 sm:-translate-y-12">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src="/logo.svg" alt="Clínica Montalvo Logo" className="w-16 h-16" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#006156]">CLÍNICA MONTALVO</h1>
            <p className="text-xs font-bold text-[#39ADA3] uppercase tracking-widest mt-1">
              Inventario de Cocina
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <Input
            id="username"
            label="Usuario"
            type="text"
            placeholder="Ingrese su usuario..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />

          {/* Remember Session Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded text-[#006156] accent-[#006156]"
              />
              <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                Recordar sesión activa
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-extrabold tracking-wide mt-2 min-h-[46px]"
            isLoading={isLoading}
          >
            Ingresar al Sistema
          </Button>
        </form>

        {/* 🛒 Quick Access for Purchases / Encargada de Compras */}
        <div className="pt-5 border-t border-slate-100 mt-6 space-y-2">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-left">
            Acceso Directo a Compras:
          </p>
          <button
            type="button"
            onClick={loginAsCompras}
            className="w-full min-h-[50px] flex items-center justify-between p-3.5 rounded-xl bg-[#e6f0ef] hover:bg-[#d5e7e5] border border-[#39ADA3]/40 text-[#006156] font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white text-[#006156] shadow-xs">
                <ShoppingBag className="w-4 h-4 text-[#006156]" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-xs text-[#006156]">Ingresar a Compras</div>
                <div className="text-[10px] text-[#39ADA3] font-bold">Ver pedidos de cocina y notas de voz</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#006156] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Clinical Note Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#39ADA3]" />
          <span>Clínica Montalvo • FileMaker Integrated PWA</span>
        </div>
      </div>
    </div>
  );
}
