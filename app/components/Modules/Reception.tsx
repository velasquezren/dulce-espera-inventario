'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal, EmptyState } from '../UI';
import { Truck, Calendar, ShoppingBag, Check } from 'lucide-react';
import { useToast } from '../UI';

export default function Reception() {
  const { receptions, confirmReception } = useApp();
  const { showToast } = useToast();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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
    } catch (err) {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#006156]">Recepciones de Pedido</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Confirma la llegada de los insumos solicitados para la cocina.
        </p>
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
            <Card key={item.id} className="flex flex-col justify-between p-5 border border-slate-200/80 hover:border-slate-300 shadow-clinical-sm transition-all duration-150">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary bg-[#ebf7f6] px-2.5 py-0.5 rounded-full border border-secondary/10">
                    ID: #{item.id}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Prog: {item.date.split('-').reverse().join('/')}
                  </span>
                </div>

                {/* Product details */}
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug">
                  {item.productName}
                </h3>

                {/* Grid layout for details (ideal for mobile) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-50/50 border border-[#e2e8f0]/60 p-2.5 rounded-xl flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cant. Esperada</span>
                    <span className="text-xs font-black text-primary truncate">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 border border-[#e2e8f0]/60 p-2.5 rounded-xl flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Proveedor</span>
                    <span className="text-xs font-bold text-slate-700 truncate" title={item.supplier}>
                      {item.supplier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Reception Button */}
              <div className="border-t border-[#f1f5f9] pt-4 mt-5">
                <Button
                  variant="primary"
                  onClick={() => handleOpenConfirm(item.id)}
                  className="w-full font-bold h-11 tracking-wide"
                >
                  <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
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
        message={`¿Confirmas que has recibido la cantidad de ${selectedReception?.quantity} ${selectedReception?.unit} de ${selectedReception?.productName} provisto por ${selectedReception?.supplier}? Se registrará el ingreso de inmediato.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isConfirming={isConfirming}
      />
    </div>
  );
}
