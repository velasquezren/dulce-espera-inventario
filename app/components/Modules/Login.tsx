'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Input } from '../UI';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
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
      const success = await login(username, password);
      if (!success) {
        setError('Credenciales inválidas. Intente de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión. Intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] md:min-h-screen bg-slate-50/50">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-[12px] shadow-[0_4px_20px_rgba(0,97,86,0.03)] p-8 text-center animate-fade-in">
        {/* Hospital Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.svg" alt="Clinica Montalvo Logo" className="w-16 h-16" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#006156]">CLÍNICA MONTALVO</h1>
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
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-slate-300 text-[#006156] focus:ring-[#006156]/20 cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-500">Recordar sesión</span>
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

        {/* Clinical Note Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-8 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#39ADA3]" />
          <span>Acceso restringido a personal autorizado.</span>
        </div>
      </div>
    </div>
  );
}
