'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal } from '../UI';
import { Search, Trash2, Send, ShoppingBag, Check, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useToast } from '../UI';

export default function Inventory() {
  const { 
    products, 
    categories,
    draftItems, 
    addDraftItem, 
    updateDraftItem, 
    removeDraftItem, 
    sendDraftList,
    sendSingleItem,
    setModule
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'notebook'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Global order notes/reason
  const [listReason, setListReason] = useState('');

  // Collapsible accordion state for categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Selected category filter state (multiple selection)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);

  // States for inline instant product send
  const [confirmingProductId, setConfirmingProductId] = useState<string | null>(null);
  const [isSendingInstant, setIsSendingInstant] = useState(false);

  // State for notebook item deletion confirmation
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Filter products by search query and category selection
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilters.length === 0 || selectedCategoryFilters.includes(product.category || 'Otros');
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories present on products or registered in context
  const allCategories = Array.from(
    new Set([...categories, ...products.map((p) => p.category || 'Otros')])
  ).filter(Boolean);

  // Group filtered products by category
  const productsByCategory: Record<string, typeof products> = {};
  allCategories.forEach((cat) => {
    const matching = filteredProducts.filter((p) => (p.category || 'Otros') === cat);
    if (matching.length > 0) {
      productsByCategory[cat] = matching;
    }
  });

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleQuantityChange = (productId: string, newQty: number) => {
    const draftItem = draftItems.find((d) => d.productId === productId);
    if (newQty <= 0) {
      if (draftItem) {
        removeDraftItem(draftItem.id);
      }
    } else {
      if (draftItem) {
        updateDraftItem(draftItem.id, newQty, draftItem.notes || '');
      } else {
        addDraftItem(productId, newQty, '');
      }
    }
  };

  const handleNotesChange = (productId: string, notes: string) => {
    const draftItem = draftItems.find((d) => d.productId === productId);
    if (draftItem) {
      updateDraftItem(draftItem.id, draftItem.quantity, notes);
    } else {
      // If setting notes first, default quantity to 1
      addDraftItem(productId, 1, notes);
    }
  };

  const handleInstantSendSubmit = async (productId: string, quantity: number, notes: string) => {
    setIsSendingInstant(true);
    try {
      await sendSingleItem(productId, quantity, notes);
      showToast('Solicitud urgente enviada con éxito', 'success');
      // If the product was in draft, remove it since it was sent
      const draftItem = draftItems.find((d) => d.productId === productId);
      if (draftItem) {
        removeDraftItem(draftItem.id);
      }
    } catch (e) {
      showToast('Error al enviar la solicitud', 'error');
    } finally {
      setIsSendingInstant(false);
      setConfirmingProductId(null);
    }
  };

  const handleConfirmSend = async () => {
    setShowSendConfirm(false);
    setIsSending(true);
    try {
      await sendDraftList(listReason);
      showToast('Lista del cuaderno enviada con éxito', 'success');
      setListReason(''); // Reset reason
    } catch (e) {
      showToast('Error al enviar la lista', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Active search query forces expansion of all matching categories
  const isSearching = searchQuery.trim() !== '';

  return (
    <div className="space-y-6 animate-view-enter pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Mi Cuaderno de Compras</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Anota lo que hace falta en la cocina. Puedes mandar productos por separado o enviar todo el cuaderno junto.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold border-b-2 text-center transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="hidden sm:inline">1. Catálogo de Insumos</span>
          <span className="sm:hidden">1. Catálogo</span>
        </button>
        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold border-b-2 text-center transition-all relative cursor-pointer ${
            activeTab === 'notebook'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="hidden sm:inline">2. Mi Cuaderno Pendiente</span>
          <span className="sm:hidden">2. Mi Cuaderno</span>
          {draftItems.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-1.5 bg-primary text-white text-[10px] font-black rounded-full shrink-0 align-middle">
              {draftItems.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CATALOGO */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre (ej. Huevo, Café, Azúcar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] outline-none focus:border-primary"
            />
          </div>
          
          {/* Category Horizontal Filter Bar */}
          <div className="w-full max-w-full overflow-hidden">
            <div 
              className="flex flex-nowrap items-center gap-2 overflow-x-auto pt-1 pb-2.5 px-1.5 snap-x scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedCategoryFilters([])}
                className={`h-9 px-4 rounded-full text-xs font-extrabold border transition-all shrink-0 snap-start cursor-pointer tap-bounce flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategoryFilters.length === 0
                    ? 'bg-primary text-white border-primary shadow-clinical-sm'
                    : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span>Todos</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedCategoryFilters.length === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {products.length}
                </span>
              </button>
              {allCategories.map((cat) => {
                const count = products.filter((p) => (p.category || 'Otros') === cat).length;
                const isSelected = selectedCategoryFilters.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategoryFilters((prev) =>
                        prev.includes(cat)
                          ? prev.filter((c) => c !== cat)
                          : [...prev, cat]
                      );
                    }}
                    className={`h-9 px-4 rounded-full text-xs font-extrabold border transition-all shrink-0 snap-start cursor-pointer tap-bounce flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-clinical-sm'
                        : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouped Products List */}
          <div className="space-y-4">
            {Object.keys(productsByCategory).length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm bg-white border border-slate-100 rounded-xl">
                No se encontraron productos en el catálogo.
              </div>
            ) : (
              Object.keys(productsByCategory).map((catName) => {
                const categoryProducts = productsByCategory[catName];
                const isCollapsed = !isSearching && !!collapsedCategories[catName];

                return (
                  <div key={catName} className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden shadow-clinical-sm">
                    {/* Category Accordion Header */}
                    <button
                      onClick={() => toggleCategory(catName)}
                      className="w-full px-5 py-4 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between border-b border-[#e2e8f0] text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-primary uppercase tracking-wider">
                          {catName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                          {categoryProducts.length}
                        </span>
                      </div>
                      
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {/* Category Products list */}
                    {!isCollapsed && (
                      <div className="divide-y divide-[#f1f5f9] p-1 sm:p-2 space-y-1">
                        {categoryProducts.map((product) => {
                          const draftItem = draftItems.find((d) => d.productId === product.id);
                          const quantity = draftItem ? draftItem.quantity : 0;
                          const notes = draftItem ? draftItem.notes : '';

                          return (
                            <div key={product.id} className="p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              {/* Left: Info */}
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                                    {product.name}
                                  </h3>
                                  <span className="text-[10px] font-bold text-secondary bg-secondary-light px-2 py-0.5 rounded uppercase tracking-wide">
                                    {product.unit}
                                  </span>
                                  {quantity > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded shrink-0 animate-fade-in">
                                      <Check className="w-3 h-3" />
                                      Anotado
                                    </span>
                                  )}
                                </div>
                                
                                {/* Notes Input */}
                                <div className="pt-1">
                                  <input
                                    type="text"
                                    placeholder="Observación (ej: marca, maduro, urgente)..."
                                    value={notes}
                                    onChange={(e) => handleNotesChange(product.id, e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-[#e2e8f0] text-xs text-[#0f172a] placeholder-[#94a3b8] outline-none focus:border-primary"
                                  />
                                </div>
                              </div>

                              {/* Right: Controls & Instant Actions */}
                              {confirmingProductId === product.id ? (
                                /* Inline Confirmation */
                                <div className="flex items-center gap-2.5 justify-between sm:justify-end bg-secondary-light border border-secondary/20 px-3 py-1.5 rounded-xl animate-view-enter w-full sm:w-auto mt-2 sm:mt-0 pt-2 pb-2 sm:py-1.5">
                                  <span className="text-[11px] font-bold text-primary">
                                    ¿Pedir {quantity} {product.unit} ahora?
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => handleInstantSendSubmit(product.id, quantity, notes || '')}
                                      disabled={isSendingInstant}
                                      className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-extrabold tap-bounce cursor-pointer hover:bg-primary-hover shadow-clinical-sm"
                                    >
                                      {isSendingInstant ? 'Enviando...' : 'Sí, Pedir'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmingProductId(null)}
                                      disabled={isSendingInstant}
                                      className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white text-xs font-bold tap-bounce cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Normal Controls */
                                <div className="flex flex-col items-end gap-2 w-full sm:w-auto border-t border-[#f1f5f9] sm:border-t-0 pt-2.5 sm:pt-0">
                                  {/* Qty edit controls */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                      className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95]"
                                    >
                                      <span className="font-bold">-</span>
                                    </button>
                                    
                                    <input
                                      type="number"
                                      min="0"
                                      value={quantity || ''}
                                      placeholder="0"
                                      onChange={(e) => handleQuantityChange(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-14 h-9 border border-[#cbd5e1] rounded-lg text-center font-extrabold text-sm text-slate-800 outline-none focus:border-primary"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                      className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95]"
                                    >
                                      <span className="font-bold">+</span>
                                    </button>
                                  </div>

                                  {/* Pedir solo este */}
                                  {quantity > 0 && (
                                    <div className="animate-fade-in w-full sm:w-auto">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setConfirmingProductId(product.id)}
                                        className="w-full sm:w-36 h-9 px-3 text-xs font-bold flex items-center justify-center gap-1.5 tap-bounce"
                                        title="Pedir este producto de inmediato de forma individual"
                                      >
                                        <Send className="w-3.5 h-3.5 shrink-0" />
                                        <span className="whitespace-nowrap">Pedir solo este</span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MI CUADERNO PENDIENTE */}
      {activeTab === 'notebook' && (
        <div className="space-y-5">
          {draftItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cbd5e1] rounded-[16px] text-center shadow-[0_2px_8px_rgba(0,97,86,0.01)] py-16">
              <ShoppingBag className="w-16 h-16 text-secondary mb-4 stroke-1 animate-pulse-subtle" />
              <h3 className="text-lg font-bold text-primary">Tu cuaderno está vacío</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm font-medium">
                No tienes productos anotados. Ve al catálogo para seleccionar los insumos necesarios para la semana.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('catalog')}
                className="mt-6 font-bold flex items-center gap-2 tap-bounce"
              >
                Ver Catálogo de Insumos
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-primary tracking-wider uppercase px-1">
                  Productos Anotados en el Cuaderno ({draftItems.length})
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  {draftItems.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Info */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                              {item.productName}
                            </h3>
                            <span className="text-[10px] font-bold text-secondary bg-secondary-light px-2 py-0.5 rounded uppercase tracking-wide">
                              {item.unit}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-400 italic">
                              <span className="font-bold text-slate-500 not-italic mr-1">Observación:</span> &ldquo;{item.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3.5 border-t border-[#f1f5f9] sm:border-t-0 pt-3.5 sm:pt-0 justify-between sm:justify-end w-full sm:w-auto">
                          {removingItemId === item.id ? (
                            /* Inline deletion confirmation */
                            <div className="flex items-center gap-1.5 animate-view-enter justify-between w-full sm:w-auto">
                              <span className="text-[11px] font-bold text-red-500">¿Quitar de la lista?</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    removeDraftItem(item.id);
                                    setRemovingItemId(null);
                                  }}
                                  className="h-8 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer tap-bounce shadow-sm"
                                >
                                  Sí, Quitar
                                </button>
                                <button
                                  onClick={() => setRemovingItemId(null)}
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white text-xs font-bold cursor-pointer tap-bounce"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Qty edit controls */
                            <>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity - 1 <= 0) {
                                      setRemovingItemId(item.id);
                                    } else {
                                      updateDraftItem(item.id, item.quantity - 1, item.notes || '');
                                    }
                                  }}
                                  className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] bg-white"
                                >
                                  <span className="font-bold">-</span>
                                </button>
                                
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity || ''}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    updateDraftItem(item.id, val, item.notes || '');
                                  }}
                                  className="w-14 h-9 border border-[#cbd5e1] rounded-lg text-center font-extrabold text-sm text-slate-800 outline-none focus:border-primary bg-white"
                                />

                                <button
                                  type="button"
                                  onClick={() => updateDraftItem(item.id, item.quantity + 1, item.notes || '')}
                                  className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] bg-white"
                                >
                                  <span className="font-bold">+</span>
                                </button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRemovingItemId(item.id)}
                                className="w-9 h-9 p-0 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-500 tap-bounce"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Detalle o Motivo de la solicitud */}
              <Card className="p-4 bg-slate-50/50 space-y-2 border border-dashed border-[#e2e8f0]">
                <label className="text-xs font-bold text-primary uppercase tracking-wide block">
                  Detalle / Motivo de la Solicitud (Opcional)
                </label>
                <textarea
                  value={listReason}
                  onChange={(e) => setListReason(e.target.value)}
                  placeholder="Ej. Reabastecimiento regular para la cocina de la semana, ingredientes para dieta líquida..."
                  className="w-full h-20 p-3 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] placeholder-[#94a3b8] bg-white outline-none focus:border-primary"
                />
              </Card>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e2e8f0] flex flex-col items-center">
                <Button
                  variant="primary"
                  onClick={() => setShowSendConfirm(true)}
                  className="w-full sm:w-80 h-14 font-extrabold text-base tracking-wide tap-bounce shadow-clinical-md"
                >
                  Enviar Lista Completa
                </Button>
                <p className="text-xs text-slate-400 font-semibold mt-2.5 text-center">
                  Al enviar, todos los productos anotados serán despachados a Gobernación como una sola solicitud.
                </p>
              </div>
            </div>
          )}
        </div>
      )}



      {/* CONFIRM MODAL: SEND FULL LIST */}
      <ConfirmModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={handleConfirmSend}
        title="Enviar Cuaderno Completo"
        message={`¿Deseas enviar la lista de ${draftItems.length} productos anotados a Gobernación? Esto registrará la solicitud agrupada para la semana.`}
        confirmText="Enviar Todo"
        cancelText="Cancelar"
        isConfirming={isSending}
      />
    </div>
  );
}
