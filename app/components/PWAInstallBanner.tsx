'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Smartphone, Download } from 'lucide-react';

export default function PWAInstallBanner() {
  const { isStandalone, setShowInstallModal, user } = useApp();
  const [isDismissed, setIsDismissed] = useState(true); // default to true until loaded client-side
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if mobile device
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || isIOSDevice;
      setIsMobile(isMobileDevice);

      // Check dismissed state in local storage
      try {
        if (typeof localStorage !== 'undefined' && localStorage !== null) {
          const dismissed = localStorage.getItem('montalvo_pwa_banner_dismissed') === 'true';
          setIsDismissed(dismissed);
        }
      } catch (e) {
        console.warn("localStorage is not accessible:", e);
      }
    }
  }, []);

  // Don't show if user not logged in, or already in standalone mode, or dismissed, or not on mobile
  if (!user || isStandalone || isDismissed || !isMobile) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the click on the banner
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem('montalvo_pwa_banner_dismissed', 'true');
      }
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
    setIsDismissed(true);
  };

  const handleInstallClick = () => {
    setShowInstallModal(true);
  };

  return (
    <div 
      onClick={handleInstallClick}
      className="bg-primary/95 text-white py-3 px-4 flex items-center justify-between gap-3 text-xs cursor-pointer shadow-clinical-md select-none border-b border-[#004e45] animate-view-enter sticky top-16 z-30"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="p-1 rounded-lg bg-white/10 shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <p className="font-semibold leading-normal truncate">
          Para una mejor experiencia, instala la app en tu celular.
        </p>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        <span className="font-extrabold flex items-center gap-1 hover:underline text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </span>
        <button 
          onClick={handleDismiss}
          className="p-1 text-white/60 hover:text-white transition-colors"
          title="Ignorar"
          aria-label="Ignorar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
