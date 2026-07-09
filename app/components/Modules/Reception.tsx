'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal, EmptyState } from '../UI';
import { Check, HelpCircle } from 'lucide-react';
import { useToast } from '../UI';

export default function Reception() {
  const { receptions, confirmReception } = useApp();
  const { showToast } = useToast();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const pendingReceptions = receptions.filter((r) => r.status === 'Pendiente');

  const handleOpenConfirm = (id: string) => {
    setConfirmId(id);
  };

  const handleCloseConfirm = () => {
    setConfirmId(null);
  };

  const handleConfirm = async () => {
    if (!confirmId) return;

    setIsConfirming(true);
    try {
      await confirmReception(confirmId);
      showToast('Pedido recibido en cocina', 'success');
    } catch {
      showToast('Error al confirmar recepción', 'error');
    } finally {
      setIsConfirming(false);
      setConfirmId(null);
    }
  };

  const selectedReception = receptions.find((r) => r.id === confirmId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight text-[#006156] flex items-center gap-2">
          <span>Recepciones de Pedido</span>
          <button 
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-0.5 rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center justify-center tap-bounce shrink-0 ${
              showHelp ? 'text-primary bg-primary-light' : 'text-slate-400 hover:text-primary hover:bg-slate-100'
            }`}
            aria-label="Ayuda"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </h1>
        {showHelp && (
          <div className="p-4 bg-primary-light border border-primary/10 rounded-xl animate-view-enter text-xs text-primary leading-relaxed shadow-clinical-sm">
            <p className="font-semibold text-primary">Sobre esta página</p>
            <p className="mt-1 text-primary-hover font-semibold">
              Confirma la llegada de los insumos solicitados para la cocina.
            </p>
          </div>
        )}
      </div>

      {/* Grid list of pending deliveries */}
      {pendingReceptions.length === 0 ? (
        <EmptyState
          title="Sin recepciones pendientes"
          description="Todos los pedidos e insumos programados han sido confirmados y recibidos."
          icon={<Check className="w-12 h-12 text-[#39ADA3] stroke-[3]" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingReceptions.map((item) => (
            <Card key={item.id} className="p-4 border border-slate-200/80 hover:border-slate-300 shadow-clinical-sm transition-all duration-150 flex flex-col gap-3.5">
              {/* Product Info & Quantity badge */}
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1 min-w-0 flex-1 text-left">
                  {/* Date (Small and subtle) */}
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Entrega: {item.date.split('-').reverse().join('/')}
                  </span>
                  
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug">
                    {item.productName}
                  </h3>
                  
                  
                  {/* ID Badge: Hidden on mobile, shown on desktop (sm and up) */}
                  <span className="hidden sm:inline-block mt-1 bg-[#ebf7f6] text-secondary text-[9px] font-bold px-2 py-0.5 rounded border border-secondary/10 uppercase tracking-wider">
                    ID: #{item.id}
                  </span>
                </div>
                
                {/* Quantity badge */}
                <div className="shrink-0 text-right bg-primary-light border border-primary/10 px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center min-w-[75px]">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-1">Esperado</span>
                  <span className="text-xs font-black text-primary leading-none whitespace-nowrap">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              </div>

              {/* Confirm Reception Button */}
              <div className="border-t border-[#f1f5f9] pt-3">
                <Button
                  variant="primary"
                  onClick={() => handleOpenConfirm(item.id)}
                  className="w-full font-bold h-9.5 text-xs tracking-wide"
                >
                  <Check className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  Confirmar Recepción
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={confirmId !== null}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        title="Confirmar Recepción de Mercancía"
        message={`¿Confirmas que has recibido la cantidad de ${selectedReception?.quantity} ${selectedReception?.unit} de ${selectedReception?.productName}? Se registrará el ingreso de inmediato.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isConfirming={isConfirming}
      />
    </div>
  );
}
