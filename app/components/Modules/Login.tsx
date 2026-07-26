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
    <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center p-4 bg-[#f8fafc] overflow-hidden select-none">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-[16px] shadow-clinical-lg p-8 text-center animate-fade-in -translate-y-10 sm:-translate-y-16">
        {/* Hospital Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.svg" alt="Dulce Espera Logo" className="w-16 h-16" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#006156]">DULCE ESPERA</h1>
            <p className="text-xs font-semibold text-[#39ADA3] uppercase tracking-wider mt-1">
              Inventario de Cocina
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <Input
            id="username"
            label="Usuario"
            type="text"
            placeholder="Ingrese su usuario o correo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />

          {/* Remember Session Option */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                  rememberMe 
                    ? 'bg-primary border-primary shadow-clinical-sm' 
                    : 'border-[#cbd5e1] bg-white group-hover:border-primary/50'
                }`}>
                  {rememberMe && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Recordar sesión</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold tracking-wide mt-2"
            isLoading={isLoading}
          >
            Ingresar al Sistema
          </Button>
        </form>

        {/* Quick Access for Purchases / Encargada de Compras */}
        <div className="pt-5 border-t border-slate-100 mt-6 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
            Acceso Rápido de Gestión
          </p>
          <button
            type="button"
            onClick={loginAsCompras}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#e6f0ef] hover:bg-[#d5e7e5] border border-[#39ADA3]/30 text-[#006156] font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white text-[#006156] shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">Ingresar a Compras</div>
                <div className="text-[10px] text-[#39ADA3] font-semibold">Ver pedidos aceptados y pendientes</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#006156] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Clinical Note Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-8 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#39ADA3]" />
          <span>Acceso restringido a personal autorizado.</span>
        </div>
      </div>
    </div>
  );
}
