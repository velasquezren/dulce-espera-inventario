'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal, EmptyState } from '../UI';
import { Check, HelpCircle, Package, Calendar, User } from 'lucide-react';
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
      showToast('Pedido recibido en cocina con éxito', 'success');
    } catch {
      showToast('Error al confirmar recepción', 'error');
    } finally {
      setIsConfirming(false);
      setConfirmId(null);
    }
  };

  const selectedReception = receptions.find((r) => r.id === confirmId);

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <span>Recepciones de Pedido</span>
          <button 
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-0.5 rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center justify-center tap-bounce shrink-0 ${
              showHelp ? 'text-primary bg-primary-light' : 'text-slate-400 hover:text-primary hover:bg-slate-100'
            }`}
            aria-label="Ayuda"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h1>
        <p className="text-xs text-slate-400 font-semibold">
          Confirma el ingreso de pedidos completos a la cocina
        </p>

        {showHelp && (
          <div className="p-4 bg-primary-light border border-primary/10 rounded-xl animate-view-enter text-xs text-primary leading-relaxed shadow-clinical-sm mt-2">
            <p className="font-semibold text-primary">Sobre esta página</p>
            <p className="mt-1 text-primary-hover font-semibold">
              Aquí puedes confirmar la llegada de pedidos completos a la cocina central. Se muestra un resumen de insumos solicitados para que verifiques todo antes de presionar confirmar.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingReceptions.map((item) => (
            <Card key={item.id} className="p-5 border border-slate-200/80 hover:border-slate-300 shadow-clinical-sm transition-all duration-150 flex flex-col gap-4 bg-white rounded-2xl">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Entrega: {item.date.split('-').reverse().join('/')}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    Pedido de {item.solicitante}
                  </h3>
                  <span className="inline-block mt-1 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    ID: #{item.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                
                <span className="text-[10px] font-extrabold bg-primary-light text-primary px-2.5 py-1 rounded-full border border-primary/10 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {item.items.length} Insumo{item.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Products list inside the order */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {item.items.map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                    <span className="font-semibold text-slate-700 truncate pr-2">{prod.productName}</span>
                    <span className="font-black text-primary shrink-0 whitespace-nowrap bg-primary-light/60 px-2 py-0.5 rounded-md text-[11px]">
                      {prod.quantity} {prod.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Confirm Reception Button */}
              <div className="border-t border-slate-100 pt-3 mt-auto">
                <Button
                  variant="primary"
                  onClick={() => handleOpenConfirm(item.id)}
                  className="w-full font-bold h-10 text-xs tracking-wide bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Confirmar Entrega de Pedido
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
        message={`¿Confirmas que has recibido todos los insumos del pedido de ${selectedReception?.solicitante}? Se registrará el ingreso de inmediato en cocina.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isConfirming={isConfirming}
      />
    </div>
  );
}
