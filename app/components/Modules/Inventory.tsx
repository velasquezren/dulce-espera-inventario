'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal } from '../UI';
import { Search, Trash2, Send, ShoppingBag, Check, HelpCircle, X } from 'lucide-react';
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
    sendSingleItem
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'notebook'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [instantNote, setInstantNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Global order notes/reason
  const [listReason, setListReason] = useState('');

  // Selected category filter state (multiple selection)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);

  // States for inline instant product send
  const [confirmingProductId, setConfirmingProductId] = useState<string | null>(null);
  const [isSendingInstant, setIsSendingInstant] = useState(false);

  // State for notebook item deletion confirmation
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Filter products by search query and category selection
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (query) {
      const keywords = query.split(/\s+/).filter(Boolean);
      matchesSearch = keywords.every(keyword => 
        product.name.toLowerCase().includes(keyword) || 
        (product.category || '').toLowerCase().includes(keyword)
      );
    }
    const matchesCategory = selectedCategoryFilters.length === 0 || selectedCategoryFilters.includes(product.category || 'Otros');
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories present on products or registered in context
  const allCategories = Array.from(
    new Set([...categories, ...products.map((p) => p.category || 'Otros')])
  ).filter(Boolean);

  // Sort filtered products by category then name
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const catA = a.category || 'Otros';
    const catB = b.category || 'Otros';
    if (catA !== catB) {
      return catA.localeCompare(catB);
    }
    return a.name.localeCompare(b.name);
  });

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



  const handleInstantSendSubmit = async (productId: string, quantity: number) => {
    setIsSendingInstant(true);
    try {
      await sendSingleItem(productId, quantity, instantNote);
      showToast('Solicitud urgente enviada con éxito', 'success');
      // If the product was in draft, remove it since it was sent
      const draftItem = draftItems.find((d) => d.productId === productId);
      if (draftItem) {
        removeDraftItem(draftItem.id);
      }
    } catch {
      showToast('Error al enviar la solicitud', 'error');
    } finally {
      setIsSendingInstant(false);
      setConfirmingProductId(null);
      setInstantNote('');
    }
  };

  const handleConfirmSend = async () => {
    setShowSendConfirm(false);
    setIsSending(true);
    try {
      await sendDraftList(listReason);
      showToast('Lista del cuaderno enviada con éxito', 'success');
      setListReason(''); // Reset reason
    } catch {
      showToast('Error al enviar la lista', 'error');
    } finally {
      setIsSending(false);
    }
  };



  return (
    <div className="space-y-6 animate-view-enter w-full max-w-full overflow-x-hidden">
      {/* Title */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <span>Mi Cuaderno de Compras</span>
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
            <p className="font-extrabold text-primary">¿Cómo usar el Cuaderno?</p>
            <p className="mt-1 text-primary-hover font-semibold">
              Anota lo que hace falta en la cocina. Puedes mandar productos por separado o enviar todo el cuaderno junto.
            </p>
          </div>
        )}
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
          {/* Search bar with clear button & interactive focus ring */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o categoría (ej. huevo, lácteos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0f172a] placeholder-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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

          {/* Search Result Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1 py-0.5">
            <span>Resultados: {sortedProducts.length} de {products.length} insumos</span>
            {(searchQuery || selectedCategoryFilters.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilters([]);
                }}
                className="text-primary hover:underline cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            )}
          </div>

          {/* Flat Catalog Products List */}
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-clinical-sm animate-view-enter">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Sin resultados coincidentes</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-semibold">
                No encontramos ningún insumo que coincida con tu búsqueda. Intenta con otros términos o limpia los filtros de categoría.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className="h-9 px-4 text-xs font-bold cursor-pointer"
                  >
                    Limpiar Búsqueda
                  </Button>
                )}
                {selectedCategoryFilters.length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCategoryFilters([])}
                    className="h-9 px-4 text-xs text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Quitar Filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden shadow-clinical-sm">
              <div className="p-1 sm:p-2">
                {sortedProducts.map((product, index) => {
                  const draftItem = draftItems.find((d) => d.productId === product.id);
                  const quantity = draftItem ? draftItem.quantity : 0;

                  return (
                    <div 
                      key={product.id} 
                      className={`p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-[background-color] duration-200 rounded-xl ${
                        quantity > 0 ? 'bg-[#e6f0ef]/30' : ''
                      } ${
                        index < sortedProducts.length - 1 ? 'border-b border-[#f1f5f9]' : ''
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded uppercase tracking-wide">
                            {product.category || 'Otros'}
                          </span>
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
                      </div>

                      {/* Right: Controls & Instant Actions */}
                      {confirmingProductId === product.id ? (
                        /* Inline Confirmation with Note Input */
                        <div className="flex flex-col gap-2 bg-secondary-light border border-secondary/20 p-2.5 rounded-xl animate-view-enter w-full sm:w-80 mt-2 sm:mt-0">
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="text-[11px] font-bold text-primary">
                              ¿Pedir {quantity} {product.unit} ahora?
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleInstantSendSubmit(product.id, quantity)}
                                disabled={isSendingInstant}
                                className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-extrabold tap-bounce cursor-pointer hover:bg-primary-hover shadow-clinical-sm"
                              >
                                {isSendingInstant ? 'Enviando...' : 'Sí, Pedir'}
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmingProductId(null);
                                  setInstantNote('');
                                }}
                                disabled={isSendingInstant}
                                className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white text-xs font-bold tap-bounce cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="Detalle o motivo (ej: marca, urgente, maduro)..."
                            value={instantNote}
                            onChange={(e) => setInstantNote(e.target.value)}
                            disabled={isSendingInstant}
                            className="w-full h-8 px-2.5 rounded-lg border bg-white border-secondary/35 text-xs text-[#0f172a] placeholder-[#94a3b8] outline-none focus:border-primary font-medium"
                          />
                        </div>
                      ) : (
                        /* Normal Controls */
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto border-t border-[#f1f5f9] sm:border-t-0 pt-2.5 sm:pt-0">
                          {/* Qty edit controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(product.id, quantity - 1)}
                              className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] bg-white"
                            >
                              <span className="font-bold">-</span>
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              value={quantity || ''}
                              placeholder="0"
                              onChange={(e) => handleQuantityChange(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 h-9 border border-[#cbd5e1] rounded-lg text-center font-extrabold text-sm text-slate-800 outline-none focus:border-primary bg-white"
                            />

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(product.id, quantity + 1)}
                              className="w-9 h-9 rounded-lg border border-[#cbd5e1] text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer select-none active:scale-[0.95] bg-white"
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
            </div>
          )}
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
