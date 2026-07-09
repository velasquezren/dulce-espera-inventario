'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Input } from '../UI';
import { Search, Filter, AlertTriangle, ArrowRight, Package } from 'lucide-react';

export default function Inventory() {
  const { products, viewProductDetails } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Categories extraction
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Helper to determine status
  const getProductStatus = (stock: number, minStock: number): 'Disponible' | 'Stock bajo' | 'Sin stock' => {
    if (stock === 0) return 'Sin stock';
    if (stock <= minStock) return 'Stock bajo';
    return 'Disponible';
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    
    const status = getProductStatus(product.stock, product.minStock);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#006156]">Inventario de Insumos</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Consulta de stock disponible y solicitud de reposiciones.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-4 space-y-4 shadow-[0_2px_8px_rgba(0,97,86,0.01)]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Buscar insumos por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#cbd5e1] text-[#0f172a] text-base placeholder-[#94a3b8] transition-all duration-150 focus:border-[#006156] focus:ring-2 focus:ring-[#006156]/10 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {/* Category Dropdown */}
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold text-[#006156] tracking-wide uppercase px-0.5">
              Categoría
            </span>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] font-semibold bg-white outline-none focus:border-[#006156] cursor-pointer appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none stroke-[1.8]" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold text-[#006156] tracking-wide uppercase px-0.5">
              Estado de Stock
            </span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] font-semibold bg-white outline-none focus:border-[#006156] cursor-pointer appearance-none"
              >
                <option value="All">Todos los Estados</option>
                <option value="Disponible">Disponible</option>
                <option value="Stock bajo">Stock Bajo</option>
                <option value="Sin stock">Sin Stock</option>
              </select>
              <AlertTriangle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cbd5e1] rounded-[12px] text-center shadow-[0_2px_8px_rgba(0,97,86,0.01)]">
          <Package className="w-12 h-12 text-[#39ADA3] mb-4 stroke-1" />
          <h3 className="text-base font-bold text-[#006156]">No se encontraron insumos</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Intente ajustando los filtros o el término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const status = getProductStatus(product.stock, product.minStock);

            return (
              <Card
                key={product.id}
                onClick={() => viewProductDetails(product.id)}
                className="cursor-pointer hover:border-[#006156]/50 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold text-[#39ADA3] tracking-wide uppercase px-2 py-0.5 bg-[#ebf7f6] rounded">
                      {product.category}
                    </span>
                    <Badge type="status" value={status} />
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-base mt-3 group-hover:text-[#006156] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1.5 font-semibold">
                    Unidad: {product.unit}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4 mt-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                      Stock Disponible
                    </span>
                    <span className={`text-xl font-black mt-0.5 block ${
                      status === 'Sin stock' ? 'text-red-600' : status === 'Stock bajo' ? 'text-amber-500' : 'text-slate-800'
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs font-bold text-[#006156] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver detalle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
