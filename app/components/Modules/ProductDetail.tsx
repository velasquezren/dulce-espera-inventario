'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, Badge } from '../UI';
import { ArrowLeft, Plus, Calendar, TrendingUp, Archive, HelpCircle } from 'lucide-react';

export default function ProductDetail() {
  const { selectedProductId, products, setModule } = useApp();

  const product = products.find((p) => p.id === selectedProductId);

  if (!product) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <h2 className="text-lg font-bold text-[#006156]">Producto no encontrado</h2>
        <Button variant="ghost" onClick={() => setModule('inventory')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inventario
        </Button>
      </div>
    );
  }

  // Get status
  const getProductStatus = (stock: number, minStock: number): 'Disponible' | 'Stock bajo' | 'Sin stock' => {
    if (stock === 0) return 'Sin stock';
    if (stock <= minStock) return 'Stock bajo';
    return 'Disponible';
  };

  const status = getProductStatus(product.stock, product.minStock);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => setModule('inventory')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#006156] transition-colors cursor-pointer focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2]" />
        Volver al Inventario
      </button>

      {/* Main Detail Card */}
      <Card className="overflow-hidden">
        {/* Mock Graphic Header (Hospital nutrition themed SVG illustration) */}
        <div className="h-44 bg-[#e6f0ef] flex items-center justify-center border-b border-[#cbd5e1]/40 -mx-5 -mt-5 relative">
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold text-[#39ADA3] tracking-wide uppercase px-2.5 py-0.5 bg-white rounded-full shadow-sm">
              {product.category}
            </span>
          </div>
          
          {/* Custom Medical/Nutritional container SVG representation */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#006156]" fill="currentColor">
            {/* Outline of bottle / bowl depending on categories */}
            {product.category.includes('Nutrición') ? (
              // Clinical bottle
              <path d="M40,25 C40,20 42,15 45,15 L55,15 C58,15 60,20 60,25 L60,35 C60,35 65,40 68,45 L68,80 C68,83 65,85 62,85 L38,85 C35,85 32,83 32,80 L32,45 C35,40 40,35 40,35 Z" fill="none" stroke="#006156" strokeWidth="3" strokeLinecap="round" />
            ) : product.category.includes('Carnes') || product.category.includes('Lácteos') ? (
              // Cold food / Protein tray
              <path d="M25,35 L75,35 C78,35 80,38 80,42 L77,78 C77,82 74,85 70,85 L30,85 C26,85 23,82 23,78 L20,42 C20,38 22,35 25,35 Z" fill="none" stroke="#006156" strokeWidth="3" />
            ) : (
              // Generic clean clinical canister
              <rect x="30" y="25" width="40" height="60" rx="8" fill="none" stroke="#006156" strokeWidth="3" />
            )}
            
            {/* Clinical cross detail inside item shape */}
            <path d="M45,55 L55,55 M50,50 L50,60" stroke="#39ADA3" strokeWidth="3" strokeLinecap="round" />
            
            {/* Waves representing content level */}
            <path d="M34,68 Q42,66 50,68 T66,68 L66,81 L34,81 Z" fill="#39ADA3" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Content details */}
        <div className="pt-6 space-y-6">
          {/* Main Titles */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                {product.name}
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                {product.description}
              </p>
            </div>
            <div className="self-start shrink-0">
              <Badge type="status" value={status} />
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-[#f1f5f9] py-5">
            {/* Stat 1: Current Stock */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#e6f0ef] rounded-lg text-[#006156] mt-0.5">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                  Stock Disponible
                </span>
                <span className="text-lg font-black text-slate-800 mt-0.5 block">
                  {product.stock}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {product.unit}
                </span>
              </div>
            </div>

            {/* Stat 2: Avg Consumption */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#ebf7f6] rounded-lg text-[#39ADA3] mt-0.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                  Consumo Promedio
                </span>
                <span className="text-lg font-black text-slate-800 mt-0.5 block">
                  {product.avgConsumption.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {product.avgConsumption.split(' ').slice(1).join(' ')}
                </span>
              </div>
            </div>

            {/* Stat 3: Last Delivery */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                  Último Ingreso
                </span>
                <span className="text-lg font-black text-slate-800 mt-0.5 block">
                  {product.lastDelivery.split('-').reverse().join('/')}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Fecha de entrega
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-[#39ADA3]" />
              <span>Stock mínimo de seguridad: {product.minStock} {product.unit}</span>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setModule('request-form')}
              className="font-bold tracking-wide h-12 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-1" />
              Solicitar Reposición
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
