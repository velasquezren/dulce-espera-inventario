'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, EmptyState, useToast } from '../UI';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Printer, 
  Share2, 
  RotateCw, 
  LogOut, 
  User, 
  Calendar, 
  Truck,
  Volume2,
  Check
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { RequestItem } from '../../lib/mockData';

export default function ComprasView() {
  const { requests, refreshRequests, updateRequestStatus, logout } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pendiente' | 'Comprado'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRequests();
      showToast('Lista de pedidos actualizada', 'success');
    } catch {
      showToast('Error al actualizar pedidos', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      showToast(`Pedido actualizado a "${newStatus}"`, 'success');
    } catch {
      showToast('Error al cambiar el estado del pedido', 'error');
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.items && req.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase())));
      
      if (statusFilter === 'All') return matchesSearch;
      if (statusFilter === 'Pendiente') return matchesSearch && (req.status === 'Pendiente' || req.status === 'En revisión');
      if (statusFilter === 'Comprado') return matchesSearch && (req.status === 'Comprado' || req.status === 'Entregado');
      return matchesSearch;
    });
  }, [requests, searchQuery, statusFilter]);

  // Counts
  const pendingCount = requests.filter(r => r.status === 'Pendiente' || r.status === 'En revisión').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado' || r.status === 'Entregado').length;

  const handlePrintRequest = (req: RequestItem, orderNum: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = req.items.map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${item.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 900; text-align: center; color: #006156; font-size: 16px;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-style: italic; color: #64748b;">${item.notes || '-'}</td>
      </tr>
    `).join('');

    const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HOJA DE COMPRAS N° ${orderNum} - CLÍNICA MONTALVO</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 3px solid #006156; padding-bottom: 12px; margin-bottom: 20px; }
          .title { color: #006156; font-size: 22px; font-weight: 900; margin: 0; }
          .meta { font-size: 13px; color: #64748b; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #006156; color: white; padding: 10px; text-transform: uppercase; font-size: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">CLÍNICA MONTALVO — PEDIDO N° ${orderNum}</h1>
          <div class="meta">Solicitado por: <strong>${req.user}</strong> | Fecha: ${req.date}</div>
        </div>
        ${req.reason ? `<div style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin-bottom: 15px;"><strong>Motivo:</strong> "${req.reason}"</div>` : ''}
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>Producto / Insumo</th>
              <th style="text-align: center;">Unidad</th>
              <th style="text-align: center;">Cantidad</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-weight: bold; text-align: right; color: #006156;">
          Total Insumos: ${req.items.length} | Total Unidades: ${totalQty}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleShareWhatsApp = (req: RequestItem, orderNum: number) => {
    let text = `🛒 *CLÍNICA MONTALVO - PEDIDO N° ${orderNum}*\n`;
    text += `*Solicitante:* ${req.user}\n`;
    text += `*Fecha:* ${req.date}\n`;
    text += `\n*INSUMOS REQUERIDOS:*\n`;
    req.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName}* — ${item.quantity} ${item.unit}\n`;
      if (item.notes) text += `   _Obs: ${item.notes}_\n`;
    });
    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la plataforma._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-24 overflow-y-auto">
      
      {/* ─── Top Header (Limpio & Elegante) ─── */}
      <header className="sticky top-0 z-30 bg-[#006156] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-clinical-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-5 h-5 text-[#39ADA3]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              CLÍNICA MONTALVO
            </h1>
            <p className="text-[11px] text-emerald-100/80 font-semibold">
              Gestión de Compras y Pedidos de Cocina
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 disabled:opacity-50"
            title="Actualizar pedidos"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Control de Filtros Limpio (3 Pestañas Simples + Buscador) ─── */}
      <div className="sticky top-[61px] z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Pestañas Ultra-Simples */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'All' 
                  ? 'bg-[#006156] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({requests.length})
            </button>
            
            <button
              onClick={() => setStatusFilter('Pendiente')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Pendiente' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Por Comprar ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Comprado')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Comprado' 
                  ? 'bg-[#39ADA3] text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comprados ({purchasedCount})</span>
            </button>
          </div>

          {/* Buscador Rápido */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insumo o cocinera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#006156]"
            />
          </div>
        </div>
      </div>

      {/* ─── LISTADO DE PEDIDOS LIMPIO Y ESPACIOSO ─── */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-view-enter">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold bg-white border border-slate-200 rounded-2xl shadow-xs">
            No se encontraron pedidos en esta vista.
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const orderNum = filteredRequests.length - idx;
            const isPending = req.status === 'Pendiente' || req.status === 'En revisión';

            return (
              <div 
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-clinical-sm p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all"
              >
                {/* 1. Fila de Encabezado: Número, Usuario, Fecha y Estado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006156] flex items-center justify-center font-black text-sm shrink-0 border border-emerald-100">
                      #{orderNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-800">
                          Pedido N° {orderNum}
                        </h2>
                        <Badge type="request" value={req.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Solicitante: <strong className="text-slate-800">{req.user}</strong> • {req.date}
                      </p>
                    </div>
                  </div>

                  {/* Estado Visual Destacado */}
                  <div className="self-start sm:self-auto">
                    {isPending ? (
                      <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Por Comprar
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#006156]" />
                        Comprado / En Camino
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Reproductor de Audio (Si existe) */}
                {req.audioUrl && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#006156]">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#006156] animate-pulse" />
                        Instrucción en Nota de Voz de Cocina
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-[#006156] px-2 py-0.5 rounded-full font-bold">
                        Audio Adjunto
                      </span>
                    </div>

                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration}
                      label="Toca para reproducir mensaje de voz"
                      className="w-full bg-white border-emerald-200"
                    />
                  </div>
                )}

                {/* 3. Motivo u Observaciones de Cocina */}
                {req.reason && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
                    <span className="font-extrabold text-[#006156] text-[10px] uppercase block mb-1">
                      Observación / Justificación:
                    </span>
                    <p className="font-semibold italic text-slate-800">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>
                )}

                {/* 4. Tabla Limpia de Insumos */}
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-0.5">
                    Insumos Requeridos ({req.items.length})
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 font-extrabold text-center w-10">#</th>
                          <th className="py-2.5 px-3 font-extrabold">Insumo / Producto</th>
                          <th className="py-2.5 px-3 font-extrabold text-center w-24">Unidad</th>
                          <th className="py-2.5 px-3 font-extrabold text-center w-24">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {req.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className={itemIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                            <td className="py-2.5 px-3 font-bold text-slate-400 text-center">{itemIdx + 1}</td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-800 text-sm">
                              {item.productName}
                              {item.notes && (
                                <span className="block text-xs font-normal text-slate-400 italic mt-0.5">
                                  Obs: {item.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-500 uppercase text-[11px]">{item.unit}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-[#006156] font-black text-sm rounded-lg border border-emerald-200">
                                {item.quantity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. BARRA DE ACCIÓN PRINCIPAL (UBICACIÓN CLARA Y DIRECTA) */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Botones Secundarios Útiles (Imprimir / WhatsApp) */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Imprimir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#006156] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#006156]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* BOTÓN PRINCIPAL DESTACADO (MARCAR COMO COMPRADO) */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, 'comprado')}
                      className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-extrabold text-xs shadow-clinical-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#39ADA3]" />
                      <span>Marcar como Comprado</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </main>

    </div>
  );
}
