'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle, X, Loader2 } from 'lucide-react';

// ==========================================
// CARD COMPONENT
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#e2e8f0]/80 rounded-card p-5 shadow-clinical-sm card-hover-effect ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-interactive tap-bounce no-select focus-ring-brand cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-clinical-sm hover:shadow-glow',
    secondary: 'bg-primary hover:bg-primary-hover text-white shadow-clinical-sm hover:shadow-glow',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light',
    ghost: 'text-primary hover:bg-primary-light',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-[0_2px_8px_rgba(220,38,38,0.15)]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-6 text-base', // Larger size for clinical ease of use
    lg: 'h-14 px-8 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ==========================================
// INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-[#006156] tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full h-12 px-4 rounded-interactive border bg-white border-[#cbd5e1] text-[#0f172a] text-base placeholder-[#94a3b8] pwa-input focus-ring-brand outline-none ${
          error ? 'border-red-500 focus-ring-brand' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}

// ==========================================
// TEXTAREA COMPONENT
// ==========================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-[#006156] tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full p-4 rounded-interactive border bg-white border-[#cbd5e1] text-[#0f172a] text-base placeholder-[#94a3b8] pwa-input focus-ring-brand outline-none min-h-[100px] resize-none ${
          error ? 'border-red-500 focus-ring-brand' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}

// ==========================================
// BADGE COMPONENT
// ==========================================
interface BadgeProps {
  type: 'status' | 'request';
  value: string;
}

export function Badge({ type, value }: BadgeProps) {
  if (type === 'status') {
    const statusMap: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      Disponible: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Disponible', dot: 'bg-emerald-500' },
      'Stock bajo': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Stock Bajo', dot: 'bg-amber-500' },
      'Sin stock': { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Sin Stock', dot: 'bg-rose-500' },
    };

    const config = statusMap[value] || { bg: 'bg-slate-50', text: 'text-slate-700', label: value, dot: 'bg-slate-500' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  } else {
    // Request statuses: Pendiente, Aprobado, Comprado, En camino, Entregado, Cancelado
    const requestMap: Record<string, { bg: string; text: string; label: string }> = {
      Pendiente: { bg: 'bg-[#cbd5e1]/40', text: 'text-slate-700', label: 'Pendiente' },
      'En revisión': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En revisión' },
      Aprobado: { bg: 'bg-[#39ADA3]/10', text: 'text-[#2e8b83]', label: 'Aprobado' },
      Comprado: { bg: 'bg-[#006156]/10', text: 'text-[#006156]', label: 'Comprado' },
      'En camino': { bg: 'bg-sky-50', text: 'text-sky-700', label: 'En camino' },
      Entregado: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Entregado' },
      Cancelado: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Cancelado' },
    };

    const config = requestMap[value] || { bg: 'bg-slate-100', text: 'text-slate-800', label: value };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }
}

// ==========================================
// MODAL / DIALOG COMPONENT
// ==========================================
// PORTAL COMPONENT
// ==========================================
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isConfirming = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-card border border-[#e2e8f0]/80 shadow-clinical-lg w-full max-w-md overflow-hidden flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[85dvh] animate-view-enter">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 text-[#006156]">
              <AlertCircle className="w-6 h-6 stroke-[#006156]" />
              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            </div>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">{message}</p>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] shrink-0">
            <Button variant="ghost" onClick={onClose} disabled={isConfirming} className="h-10 text-slate-600 hover:bg-slate-100">
              {cancelText}
            </Button>
            <Button variant="primary" onClick={onConfirm} isLoading={isConfirming} className="h-10 px-5">
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ==========================================
// TOAST NOTIFICATIONS MANAGER
// ==========================================
interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: (id: string) => void;
}

function Toast({ id, message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgStyles = {
    success: 'border-l-4 border-emerald-500 bg-white text-slate-800 shadow-[0_4px_12px_rgba(16,185,129,0.08)]',
    info: 'border-l-4 border-sky-500 bg-white text-slate-800 shadow-[0_4px_12px_rgba(14,165,233,0.08)]',
    error: 'border-l-4 border-rose-500 bg-white text-slate-800 shadow-[0_4px_12px_rgba(244,63,94,0.08)]',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-interactive border border-[#e2e8f0]/80 shadow-clinical-md ${bgStyles[type]} w-full max-w-sm animate-view-enter`}>
      {type === 'success' && <div className="p-0.5 bg-emerald-100 rounded-full text-emerald-600 mt-0.5"><Check className="w-4 h-4" /></div>}
      {type === 'error' && <div className="p-0.5 bg-rose-100 rounded-full text-rose-600 mt-0.5"><AlertCircle className="w-4 h-4" /></div>}
      
      <div className="flex-1 text-sm font-semibold tracking-wide leading-snug">{message}</div>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600 mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: 'success' | 'info' | 'error' }>>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-[calc(100vw-3rem)] sm:max-w-sm">
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ==========================================
// SKELETON LOADING
// ==========================================
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`shimmer-skeleton rounded-interactive ${className}`} />
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#cbd5e1] bg-slate-50/50 rounded-[12px] my-6">
      {icon ? (
        <div className="text-slate-400 mb-4">{icon}</div>
      ) : (
        <AlertCircle className="w-12 h-12 text-[#39ADA3] mb-4 stroke-1" />
      )}
      <h3 className="text-base font-bold text-[#006156] mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-5 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
