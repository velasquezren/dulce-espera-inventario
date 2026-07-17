'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal } from '../UI';
import { Plus, Trash2, FolderPlus, Layers, Search, HelpCircle, X } from 'lucide-react';
import { useToast } from '../UI';

export default function ManageProducts() {
  const { 
    products, 
    categories, 
    addCategory, 
    removeCategory, 
    updateProductCategory
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'organize' | 'categories'>('organize');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Category form states
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete category confirmation
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<string | null>(null);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      showToast('Por favor, ingresa el nombre de la categoría', 'error');
      return;
    }
    if (categories.includes(name)) {
      showToast('La categoría ya existe', 'error');
      return;
    }
    addCategory(name);
    showToast('Categoría creada con éxito', 'success');
    setNewCategoryName('');
  };

  const handleConfirmDeleteCategory = () => {
    if (!deleteCategoryTarget) return;
    removeCategory(deleteCategoryTarget);
    showToast('Categoría eliminada (los productos se movieron a "Otros")', 'success');
    setDeleteCategoryTarget(null);
  };

  // Filter products by search and category filter
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (query) {
      const keywords = query.split(/\s+/).filter(Boolean);
      matchesSearch = keywords.every(keyword => 
        product.name.toLowerCase().includes(keyword)
      );
    }
    const matchesCategory = categoryFilter === 'All' || (product.category || 'Otros') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-view-enter">
      {/* Header */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <span>Organizar Insumos</span>
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
              Organiza los productos de la base de datos en tus propias categorías para encontrarlos más rápido al pedir.
            </p>
          </div>
        )}
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('organize')}
          className={`flex-1 py-3 text-sm font-extrabold border-b-2 text-center transition-all ${
            activeTab === 'organize'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Organizar Productos ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-3 text-sm font-extrabold border-b-2 text-center transition-all ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mis Categorías ({categories.length})
        </button>
      </div>

      {/* VIEW: ORGANIZE PRODUCTS */}
      {activeTab === 'organize' && (
        <div className="space-y-4">
          {/* Search & Category Filter bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                placeholder="Buscar insumo por nombre..."
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
            
            <div className="sm:col-span-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] bg-white outline-none focus:border-primary cursor-pointer font-semibold"
              >
                <option value="All">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Result Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1 py-0.5">
            <span>Resultados: {filteredProducts.length} de {products.length} insumos</span>
            {(searchQuery || categoryFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                }}
                className="text-primary hover:underline cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>

          {/* Products List & Classifier Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-clinical-sm animate-view-enter">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Sin resultados coincidentes</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-semibold">
                No encontramos ningún insumo que coincida con tu búsqueda. Intenta con otros términos o cambia la categoría filtrada.
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
                {categoryFilter !== 'All' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setCategoryFilter('All')}
                    className="h-9 px-4 text-xs text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Mostrar Todas
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden shadow-clinical-sm">
              <div className="divide-y divide-[#f1f5f9]">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    {/* Left: Product Name & Category Info */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-bold text-secondary bg-secondary-light px-2 py-0.5 rounded uppercase tracking-wide">
                          {product.unit}
                        </span>
                      </div>
                      
                      <div className="pt-0.5">
                        <span className="text-[10px] font-extrabold text-primary bg-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wide inline-block">
                          Categoría actual: {product.category || 'Otros'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Classifier Select Dropdown */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-[#f1f5f9] sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                      <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Mover a:</span>
                      <select
                        value={product.category || 'Otros'}
                        onChange={(e) => {
                          updateProductCategory(product.id, e.target.value);
                          showToast(`"${product.name}" clasificado en "${e.target.value}"`, 'success');
                        }}
                        className="h-10 px-3.5 rounded-xl border border-[#cbd5e1] text-xs font-bold text-slate-800 bg-white outline-none focus:border-primary cursor-pointer hover:border-slate-300 transition-colors shadow-clinical-sm"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="lg:col-span-1">
            <Card className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4" />
                Nueva Categoría
              </h2>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carnes, Verduras, Postres..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] outline-none focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 font-bold flex items-center justify-center gap-1.5 tap-bounce"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Crear Categoría
                </Button>
              </form>
            </Card>
          </div>

          {/* Categories list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Lista de Categorías Activas
            </h2>

            <div className="bg-white border border-[#e2e8f0] rounded-[16px] overflow-hidden shadow-clinical-sm">
              <div className="divide-y divide-[#f1f5f9]">
                {categories.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 font-semibold">
                    No hay categorías registradas.
                  </div>
                ) : (
                  categories.map((c) => (
                    <div 
                      key={c} 
                      className="p-4 hover:bg-slate-50/50 flex items-center justify-between gap-4 text-sm font-semibold text-slate-700"
                    >
                      <div className="flex items-center gap-2 text-slate-800">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>{c}</span>
                        <span className="text-xs text-slate-400 font-medium">
                          ({products.filter(p => (p.category || 'Otros') === c).length} insumos clasificados)
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => setDeleteCategoryTarget(c)}
                        disabled={c === 'Otros'}
                        className={`p-2 rounded-lg tap-bounce ${
                          c === 'Otros' 
                            ? 'text-slate-300 hover:bg-transparent cursor-not-allowed' 
                            : 'hover:bg-red-50 text-red-500'
                        }`}
                        title={c === 'Otros' ? 'No se puede eliminar la categoría predeterminada' : 'Eliminar categoría'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CATEGORY */}
      <ConfirmModal
        isOpen={deleteCategoryTarget !== null}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deleteCategoryTarget}"? Los productos asignados a ella no se eliminarán, sino que se moverán automáticamente a la categoría general "Otros".`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
