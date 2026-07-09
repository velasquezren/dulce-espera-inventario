'use client';

import React, { useEffect, useState } from 'react';

export default function ErrorDebugger() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(`Error: ${event.message} en ${event.filename}:${event.lineno}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(`Promesa Rechazada: ${message}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-700 text-white p-4 font-mono text-xs z-[9999] overflow-auto max-h-60 shadow-xl border-t-2 border-white">
      <div className="font-bold flex items-center justify-between border-b border-white/20 pb-1.5 mb-1.5">
        <span>⚠️ DETECTOR DE ERRORES EN DISPOSITIVO:</span>
        <button 
          onClick={() => setError(null)} 
          className="text-white hover:bg-white/20 px-2 py-0.5 rounded font-bold transition-colors"
        >
          Cerrar [X]
        </button>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{error}</p>
      <p className="text-[10px] text-white/70 mt-2 italic font-semibold">
        Por favor copia este error o toma una captura para solucionarlo.
      </p>
    </div>
  );
}
