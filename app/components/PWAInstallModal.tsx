'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Share, Plus, Download, Smartphone, Info, Monitor } from 'lucide-react';
import { Portal } from './UI';

export default function PWAInstallModal() {
  const { showInstallModal, setShowInstallModal, deferredPrompt, installApp } = useApp();
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
      
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || isIOSDevice;
      setIsMobile(isMobileDevice);
    }
  }, []);

  useEffect(() => {
    if (!showInstallModal) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [showInstallModal]);

  if (!showInstallModal) return null;

  const handleClose = () => {
    setShowInstallModal(false);
  };

  const handleInstallClick = async () => {
    await installApp();
    handleClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[28px] border border-slate-200/80 shadow-clinical-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Download className="w-5.5 h-5.5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg leading-snug">Descargar Aplicación</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Instalación PWA</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Logo & Mini Intro */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <img src="/logo.svg" alt="Logo Dulce Espera" className="w-12 h-12 shrink-0" />
            <div className="text-left">
              <h3 className="font-black text-sm text-slate-800">Dulce Espera Cocina</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
                Instala la app para acceder al inventario rápido, con pantalla completa y soporte sin conexión.
              </p>
            </div>
          </div>

          {/* Conditional Instructions */}
          {deferredPrompt ? (
            /* Android / Chrome standard installation available */
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-500 font-semibold">
                Haz clic en el botón de abajo para iniciar la instalación nativa en tu dispositivo de forma automática.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-sm transition-all shadow-clinical-md active:scale-98 tap-bounce cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Instalar Aplicación en Dispositivo</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS (iPhone/iPad) Custom Instructions */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl flex gap-2.5 text-amber-800">
                <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  Apple no permite la instalación automática de apps desde el navegador. Sigue estos pasos manuales para instalarla en tu iPhone o iPad:
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Abre esta página en el navegador <strong className="text-slate-800">Safari</strong> de tu iPhone/iPad.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Toca el botón <strong className="text-slate-800">Compartir</strong> ubicado en la barra de navegación (ícono de un cuadrado con una flecha hacia arriba: <Share className="inline-block w-4 h-4 text-primary mx-0.5" />).
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Desliza hacia abajo en la lista de opciones y selecciona <strong className="text-slate-800">"Agregar a inicio"</strong> o <strong className="text-slate-800">"Añadir a la pantalla de inicio"</strong> (<Plus className="inline-block w-4 h-4 text-primary mx-0.5" />).
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Escribe el nombre (por defecto "Montalvo Cocina") y pulsa <strong className="text-primary font-bold">"Agregar"</strong> (o "Añadir") en la esquina superior derecha.
                  </div>
                </div>
              </div>

              <div className="bg-primary-light border border-primary/10 rounded-xl p-3.5 text-center mt-2.5">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Resultado</span>
                <p className="text-[11px] text-primary-hover font-bold">
                  ¡Listo! Aparecerá el ícono de "Dulce Espera" en la pantalla de inicio de tu celular como una App nativa.
                </p>
              </div>
            </div>
          ) : (
            /* Other Browsers (Firefox Android, Edge Mobile, etc.) / General guide */
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Si no ves el botón de instalación directa, puedes instalar la aplicación de forma manual en tu navegador móvil:
              </p>
              
              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Toca el botón de <strong className="text-slate-800">menú del navegador</strong> (usualmente 3 puntos horizontales o verticales <span className="font-bold">...</span> en la esquina).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Busca la opción que dice <strong className="text-slate-800">"Instalar aplicación"</strong>, <strong className="text-slate-800">"Instalar"</strong>, o <strong className="text-slate-800">"Agregar a la pantalla principal"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-normal pt-0.5">
                    Confirma la acción. La app se agregará a tu pantalla de inicio inmediatamente.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            {isMobile ? <Smartphone className="w-4 h-4 text-slate-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
            <span>{isIOS ? 'Detectado: iOS (Apple)' : 'Detectado: Dispositivo'}</span>
          </div>
          <button
            onClick={handleClose}
            className="text-primary hover:underline font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
