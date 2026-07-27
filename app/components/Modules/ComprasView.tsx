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
  FileText,
  ChevronRight
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { RequestItem } from '../../lib/mockData';

export default function ComprasView() {
  const { requests, refreshRequests, updateRequestStatus, logout } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pendiente' | 'En revisión' | 'Aceptado' | 'Comprado' | 'Entregado'>('All');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
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
      
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  // Active selected order
  const currentReq = useMemo(() => {
    if (filteredRequests.length === 0) return null;
    const idx = Math.min(selectedIndex, filteredRequests.length - 1);
    return filteredRequests[idx] || filteredRequests[0];
  }, [filteredRequests, selectedIndex]);

  // Counts
  const pendingCount = requests.filter(r => r.status === 'Pendiente').length;
  const revisionCount = requests.filter(r => r.status === 'En revisión' || r.status === 'Aceptado').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado').length;
  const deliveredCount = requests.filter(r => r.status === 'Entregado').length;

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
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#f8fafc] flex flex-col overflow-hidden select-none font-sans animate-fade-in">
      
      {/* ─── Header Principal (Verde Institucional) ─── */}
      <header className="bg-[#006156] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-clinical-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-4 h-4 text-[#39ADA3]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              CLÍNICA MONTALVO
            </h1>
            <p className="text-[11px] text-emerald-100/80 font-semibold">
              Panel de Pedidos de Cocina para Compras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Barra de Filtros Minimalista ─── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        {/* Pestañas de Estado */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'All' ? 'bg-[#006156] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('Pendiente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'Pendiente' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('En revisión')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'En revisión' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            En revisión ({revisionCount})
          </button>
          <button
            onClick={() => setStatusFilter('Comprado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'Comprado' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
            }`}
          >
            Comprados ({purchasedCount})
          </button>
          <button
            onClick={() => setStatusFilter('Entregado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'Entregado' ? 'bg-[#006156] text-white shadow-xs' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            Entregados ({deliveredCount})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por insumo o cocinera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#006156]"
          />
        </div>
      </div>

      {/* ─── Vista Principal: Lista Integrada Minimalista ─── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Selector Izquierdo (Lista de Pedidos) */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No hay pedidos en esta sección
            </div>
          ) : (
            filteredRequests.map((req, idx) => {
              const isSelected = currentReq?.id === req.id;
              const orderNum = filteredRequests.length - idx;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`p-3.5 transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected 
                      ? 'bg-emerald-50/70 border-l-4 border-l-[#006156]' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">
                      Pedido #{orderNum}
                    </span>
                    <Badge type="request" value={req.status} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#006156]" />
                      {req.user}
                    </span>
                    <span className="text-slate-400 text-[10px]">{req.date}</span>
                  </div>

                  {req.audioUrl && (
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006156] bg-emerald-100/70 px-2 py-0.5 rounded w-fit mt-1">
                      <Volume2 className="w-3 h-3 text-[#006156] animate-pulse" />
                      <span>Nota de Voz</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Panel Derecho (Planilla Única Limpia del Pedido) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] flex flex-col items-center">
          {!currentReq ? (
            <div className="m-auto text-center text-slate-400 text-xs font-bold">
              Selecciona un pedido para visualizar los insumos.
            </div>
          ) : (
            (() => {
              const currentOrderNum = filteredRequests.length - selectedIndex;
              const totalUnits = currentReq.items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-clinical-sm overflow-hidden flex flex-col my-auto">
                  
                  {/* Encabezado del Pedido */}
                  <div className="bg-[#006156] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded">
                          Solicitud de Cocina
                        </span>
                        <Badge type="request" value={currentReq.status} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        PEDIDO N° {currentOrderNum}
                      </h2>
                      <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100/90 mt-1">
                        <span>Solicitante: <strong>{currentReq.user}</strong></span>
                        <span>•</span>
                        <span>Fecha: <strong>{currentReq.date}</strong></span>
                      </div>
                    </div>

                    {/* Botón de Cambio de Estado Rápido */}
                    <div>
                      {currentReq.status === 'Pendiente' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(currentReq.id, 'comprado')}
                          className="px-4 py-2.5 rounded-xl bg-[#39ADA3] hover:bg-[#2e8b83] text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar como Comprado</span>
                        </button>
                      )}
                      {currentReq.status === 'Comprado' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-emerald-100 font-bold text-xs flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#39ADA3]" />
                          <span>En camino a cocina</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenido del Pedido */}
                  <div className="p-5 sm:p-6 space-y-5">
                    
                    {/* Reproductor de Nota de Voz Prominente */}
                    {currentReq.audioUrl && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-[#006156] uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Volume2 className="w-4.5 h-4.5 text-[#006156] animate-pulse" />
                            Nota de Voz enviada por la Señora de Cocina
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-[#006156] px-2 py-0.5 rounded-full font-bold">
                            Audio Adjunto
                          </span>
                        </div>
                        <AudioPlayer 
                          audioUrl={currentReq.audioUrl} 
                          duration={currentReq.audioDuration}
                          label="Toca para reproducir mensaje de voz"
                          className="w-full bg-white border-emerald-200"
                        />
                      </div>
                    )}

                    {/* Motivo / Observaciones */}
                    {currentReq.reason && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        <span className="font-extrabold text-[#006156] uppercase tracking-wider text-[10px] block mb-1">
                          Motivo u Observación de Cocina:
                        </span>
                        <p className="font-semibold italic leading-relaxed text-slate-800">
                          &ldquo;{currentReq.reason}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Tabla Limpia de Insumos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-xs font-extrabold text-slate-600">
                        <span>Lista de Insumos ({currentReq.items.length})</span>
                        <span className="text-[#006156]">
                          Total Unidades: <strong>{totalUnits}</strong>
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#006156] text-white">
                            <tr>
                              <th className="py-2.5 px-3 font-bold text-center w-10">#</th>
                              <th className="py-2.5 px-3 font-bold">Insumo / Producto</th>
                              <th className="py-2.5 px-3 font-bold text-center w-24">Unidad</th>
                              <th className="py-2.5 px-3 font-bold text-center w-24">Cantidad</th>
                              <th className="py-2.5 px-3 font-bold">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentReq.items.map((item, idx) => (
                              <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                                <td className="py-2.5 px-3 font-bold text-slate-400 text-center">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-extrabold text-slate-800 text-sm">{item.productName}</td>
                                <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{item.unit}</td>
                                <td className="py-2.5 px-3 text-center font-black text-[#006156] text-sm">
                                  {item.quantity}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 italic">{item.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Barra de Acciones del Pedido */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
                    <span className="font-bold text-slate-400">Clínica Montalvo — Panel Compras</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintRequest(currentReq, currentOrderNum)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Imprimir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(currentReq, currentOrderNum)}
                        className="px-3.5 py-2 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-white" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>

      </div>
    </div>
  );
}
