'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, Input, Textarea, ConfirmModal } from '../UI';
import { ArrowLeft, Check, ClipboardCheck, Minus, Plus } from 'lucide-react';
import { useToast } from '../UI';

export default function RequestForm() {
  const { products, selectedProductId, createRequest, setModule } = useApp();
  const { showToast } = useToast();

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Set default product if selected previously
  useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
    } else if (products.length > 0) {
      setProductId(products[0].id);
    }
  }, [selectedProductId, products]);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) return;
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    try {
      await createRequest(productId, quantity, notes);
      setIsCompleted(true);
      showToast('Solicitud enviada correctamente', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al enviar la solicitud', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted && selectedProduct) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#e6f0ef] text-[#006156] flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(0,97,86,0.05)]">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#006156]">Requisición Creada</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Tu solicitud ha sido transmitida al departamento de compras y nutrición.
          </p>
        </div>
        <Card className="text-left bg-slate-50 border border-slate-200">
          <div className="space-y-2.5 text-xs text-slate-600">
            <div><span className="font-bold text-slate-500 uppercase tracking-wide mr-2">Producto:</span> {selectedProduct.name}</div>
            <div><span className="font-bold text-slate-500 uppercase tracking-wide mr-2">Cantidad:</span> {quantity} {selectedProduct.unit}</div>
            {notes && <div><span className="font-bold text-slate-500 uppercase tracking-wide mr-2">Notas:</span> {notes}</div>}
          </div>
        </Card>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => setModule('requests')} className="font-bold">
            Ver Mis Solicitudes
          </Button>
          <Button variant="ghost" onClick={() => setModule('inventory')} className="text-slate-500 hover:bg-slate-100">
            Ir al Inventario
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Back link */}
      <button
        onClick={() => setModule('inventory')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#006156] transition-colors cursor-pointer focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2]" />
        Volver al Inventario
      </button>

      {/* Main Request Form */}
      <Card>
        <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4 mb-6">
          <div className="p-2 bg-[#e6f0ef] rounded-lg text-[#006156]">
            <ClipboardCheck className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#006156] tracking-tight">Nueva Solicitud de Insumos</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Elige el insumo y cantidad que necesitas en cocina.</p>
          </div>
        </div>

        <form onSubmit={handleOpenConfirm} className="space-y-5">
          {/* Product selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#006156] tracking-wide uppercase px-0.5">
              Producto / Insumo
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setQuantity(1);
              }}
              className="w-full h-12 px-3.5 rounded-lg border border-[#cbd5e1] text-base text-[#0f172a] font-semibold bg-white outline-none focus:border-[#006156] focus:ring-2 focus:ring-[#006156]/10 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity selector (Optimized with large touch controls) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#006156] tracking-wide uppercase px-0.5">
              Cantidad Necesaria
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-12 h-12 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] transition-all"
              >
                <Minus className="w-5 h-5 stroke-[2]" />
              </button>
              
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 h-12 border border-[#cbd5e1] rounded-lg text-center font-bold text-lg text-slate-800 outline-none focus:border-[#006156]"
              />

              <button
                type="button"
                onClick={handleIncrement}
                className="w-12 h-12 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] transition-all"
              >
                <Plus className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Unit helper display */}
          {selectedProduct && (
            <div className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3">
              Unidad de medida: <span className="text-[#006156] font-bold">{selectedProduct.unit}</span>.
              <span className="block mt-0.5">Stock actual: {selectedProduct.stock} {selectedProduct.unit}</span>
            </div>
          )}

          {/* Observations */}
          <Textarea
            id="notes"
            label="Observaciones o Motivo"
            placeholder="Ej: Para dietas post-operatorio del fin de semana..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold tracking-wide mt-3"
            disabled={!productId || quantity <= 0}
          >
            Enviar Solicitud
          </Button>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Solicitud de Insumos"
        message={`¿Estás seguro que deseas solicitar ${quantity} ${selectedProduct?.unit} de ${selectedProduct?.name}? Esta acción notificará al área de abasto.`}
        confirmText="Confirmar Envío"
        cancelText="Cancelar"
        isConfirming={isSubmitting}
      />
    </div>
  );
}
