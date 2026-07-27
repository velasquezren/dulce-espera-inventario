'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, EmptyState, useToast } from '../UI';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Share2, 
  RotateCw, 
  LogOut, 
  User, 
  Calendar, 
  Truck,
  Volume2,
  FileText
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

  // Selected request
  const currentReq = useMemo(() => {
    if (filteredRequests.length === 0) return null;
    const idx = Math.min(selectedIndex, filteredRequests.length - 1);
    return filteredRequests[idx] || filteredRequests[0];
  }, [filteredRequests, selectedIndex]);

  // KPI Counts
  const pendingCount = requests.filter(r => r.status === 'Pendiente').length;
  const revisionCount = requests.filter(r => r.status === 'En revisión' || r.status === 'Aceptado').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado').length;
  const deliveredCount = requests.filter(r => r.status === 'Entregado').length;

  const handlePrintRequest = (req: RequestItem, orderNum: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = req.items.map((item, idx) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: center; color: #64748b; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 15px; color: #0f172a;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; text-align: center; color: #475569; font-size: 13px;">${item.unit}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 900; font-size: 18px; text-align: center; color: #006156;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-style: italic;">${item.notes || '-'}</td>
      </tr>
    `).join('');

    const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HOJA DE COMPRAS N° ${orderNum} - CLÍNICA MONTALVO</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; bg: #ffffff; }
          .header { text-align: center; border-bottom: 3px solid #006156; padding-bottom: 15px; margin-bottom: 25px; }
          .logo-title { color: #006156; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
          .subtitle { color: #39ADA3; font-size: 14px; font-weight: 800; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
          .meta-box { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; background: #f8fafc; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .meta-item { display: flex; flex-direction: column; }
          .meta-label { text-transform: uppercase; font-size: 10px; color: #94a3b8; font-weight: 800; letter-spacing: 0.5px; }
          .meta-val { font-weight: 800; color: #0f172a; font-size: 15px; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 12px; overflow: hidden; }
          th { background: #006156; color: white; padding: 14px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
          .reason-box { background: #f0fdf4; border: 1.5px dashed #86efac; padding: 14px 18px; border-radius: 12px; font-size: 13px; color: #166534; margin-bottom: 20px; }
          .summary-bar { background: #f1f5f9; padding: 14px 20px; border-radius: 12px; margin-top: 25px; display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="logo-title">CLÍNICA MONTALVO</h1>
          <div class="subtitle">HOJA DE PEDIDO DE COMPRAS DE COCINA N° ${orderNum}</div>
        </div>
        <div class="meta-box">
          <div class="meta-item">
            <span class="meta-label">Solicitado Por</span>
            <span class="meta-val">${req.user}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Fecha y Hora</span>
            <span class="meta-val">${req.date}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Estado</span>
            <span class="meta-val" style="color: #006156;">${req.status}</span>
          </div>
        </div>
        ${req.reason ? `
          <div class="reason-box">
            <strong>Motivo / Observación de Cocina:</strong> "${req.reason}"
          </div>
        ` : ''}
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Producto / Insumo</th>
              <th style="text-align: center; width: 100px;">Unidad</th>
              <th style="text-align: center; width: 120px;">Cantidad</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="summary-bar">
          <span>Total de Insumos: ${req.items.length}</span>
          <span style="color: #006156;">Total Unidades a Comprar: ${totalQty}</span>
        </div>
        <div class="footer">
          Documento generado para la encargada de compras • Clínica Montalvo / FileMaker Sync.
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleShareWhatsApp = (req: RequestItem, orderNum: number) => {
    let text = `🛒 *HOJA DE COMPRAS N° ${orderNum} - CLÍNICA MONTALVO*\n`;
    text += `*Solicitante:* ${req.user}\n`;
    text += `*Fecha:* ${req.date}\n`;
    text += `*Estado:* ${req.status}\n`;
    if (req.reason) text += `*Motivo:* "${req.reason}"\n`;
    text += `\n*INSUMOS A COMPRAR:*\n`;
    req.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName}* — ${item.quantity} ${item.unit}\n`;
      if (item.notes) text += `   _Obs: ${item.notes}_\n`;
    });
    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la plataforma._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#f8fafc] flex flex-col overflow-hidden select-none animate-fade-in font-sans">
      
      {/* ─── Official Header (Clínica Montalvo Dark Green) ─── */}
      <header className="bg-gradient-to-r from-[#004d44] via-[#006156] to-[#004d44] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-clinical-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <ShoppingBag className="w-5 h-5 text-[#39ADA3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                CLÍNICA MONTALVO
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#39ADA3]/20 text-[#39ADA3] border border-[#39ADA3]/30 uppercase tracking-widest hidden sm:inline-block">
                Módulo de Compras
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-semibold tracking-wide">
              Panel de pedidos de cocina, audios de voz y despacho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-white/20 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content Body ─── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

        {/* ══════ LEFT SIDEBAR: ORDERS LIST ══════ */}
        <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          
          {/* KPI Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-1.5 text-center shrink-0">
            <div 
              onClick={() => setStatusFilter(statusFilter === 'Pendiente' ? 'All' : 'Pendiente')}
              className={`p-2 rounded-xl cursor-pointer transition-all border ${
                statusFilter === 'Pendiente' ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-rose-800 border-rose-100 hover:bg-rose-50'
              }`}
            >
              <div className="text-[9px] font-black uppercase">Pendientes</div>
              <div className="text-base font-black leading-tight mt-0.5">{pendingCount}</div>
            </div>

            <div 
              onClick={() => setStatusFilter(statusFilter === 'En revisión' ? 'All' : 'En revisión')}
              className={`p-2 rounded-xl cursor-pointer transition-all border ${
                statusFilter === 'En revisión' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-amber-800 border-amber-100 hover:bg-amber-50'
              }`}
            >
              <div className="text-[9px] font-black uppercase">Revisión</div>
              <div className="text-base font-black leading-tight mt-0.5">{revisionCount}</div>
            </div>

            <div 
              onClick={() => setStatusFilter(statusFilter === 'Comprado' ? 'All' : 'Comprado')}
              className={`p-2 rounded-xl cursor-pointer transition-all border ${
                statusFilter === 'Comprado' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-800 border-indigo-100 hover:bg-indigo-50'
              }`}
            >
              <div className="text-[9px] font-black uppercase">Comprados</div>
              <div className="text-base font-black leading-tight mt-0.5">{purchasedCount}</div>
            </div>

            <div 
              onClick={() => setStatusFilter(statusFilter === 'Entregado' ? 'All' : 'Entregado')}
              className={`p-2 rounded-xl cursor-pointer transition-all border ${
                statusFilter === 'Entregado' ? 'bg-[#006156] text-white border-[#004d44]' : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50'
              }`}
            >
              <div className="text-[9px] font-black uppercase">Entregados</div>
              <div className="text-base font-black leading-tight mt-0.5">{deliveredCount}</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 shrink-0 bg-white">
            <div className="relative">
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

          {/* List of Orders */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">
                No hay pedidos en este filtro
              </div>
            ) : (
              filteredRequests.map((req, idx) => {
                const isSelected = currentReq?.id === req.id;
                const orderNum = filteredRequests.length - idx;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-emerald-50/80 border-l-4 border-l-[#006156] shadow-xs' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        Pedido de Cocina #{orderNum}
                      </span>
                      <Badge type="request" value={req.status} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#006156]" />
                        {req.user}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {req.date}
                      </span>
                    </div>

                    {req.audioUrl && (
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006156] bg-emerald-100/60 px-2 py-0.5 rounded-md w-fit">
                        <Volume2 className="w-3 h-3 text-[#006156] animate-pulse" />
                        <span>Nota de Voz</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══════ RIGHT: OFFICIAL SHEET DISPLAY ══════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc] flex flex-col items-center">
          {!currentReq ? (
            <div className="m-auto bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm max-w-md">
              <EmptyState
                title="Selecciona un pedido"
                description="Haz clic en cualquier pedido del menú lateral para visualizar la planilla completa de insumos."
              />
            </div>
          ) : (
            (() => {
              const currentOrderNum = filteredRequests.length - selectedIndex;
              const totalUnits = currentReq.items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-clinical-lg overflow-hidden flex flex-col animate-view-enter my-auto">
                  
                  {/* Top Sheet Banner */}
                  <div className="bg-gradient-to-r from-[#006156] to-[#004d44] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-200 text-xs font-black uppercase tracking-wider">
                          Hoja Oficial de Compra
                        </span>
                        <Badge type="request" value={currentReq.status} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        PEDIDO DE COCINA N° {currentOrderNum}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100/90 pt-1">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#39ADA3]" />
                          Solicitante: <strong className="text-white font-bold">{currentReq.user}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#39ADA3]" />
                          Fecha: <strong className="text-white font-bold">{currentReq.date}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Button for Compras */}
                    <div className="self-start sm:self-center shrink-0">
                      {currentReq.status === 'Pendiente' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(currentReq.id, 'comprado')}
                          className="px-5 py-3 rounded-2xl bg-[#39ADA3] hover:bg-[#2e8b83] text-white font-black text-xs shadow-clinical-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar como Comprado</span>
                        </button>
                      )}
                      {currentReq.status === 'Comprado' && (
                        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-emerald-200 font-bold text-xs flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#39ADA3]" />
                          <span>En camino a cocina</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    
                    {/* PROMINENT AUDIO PLAYER BANNER */}
                    {currentReq.audioUrl && (
                      <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#006156] font-extrabold text-xs uppercase tracking-wider">
                            <Volume2 className="w-5 h-5 text-[#006156] animate-pulse" />
                            <span>Nota de Voz Enviada por la Señora de Cocina</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#006156] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            Audio Opcional
                          </span>
                        </div>

                        <AudioPlayer 
                          audioUrl={currentReq.audioUrl} 
                          duration={currentReq.audioDuration}
                          label="Toca para reproducir la nota de voz"
                          className="w-full bg-white border-emerald-300 py-3 px-4 shadow-sm"
                        />
                      </div>
                    )}

                    {/* Reason / Notes */}
                    {currentReq.reason && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                        <span className="font-extrabold text-[#006156] uppercase tracking-wider text-[10px] block mb-1">
                          Motivo / Justificación de Cocina:
                        </span>
                        <p className="font-medium italic leading-relaxed text-sm text-slate-800">
                          &ldquo;{currentReq.reason}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Table of Items */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#006156]" />
                          <span>Lista de Insumos Solicitados ({currentReq.items.length})</span>
                        </h3>
                        <span className="text-xs font-bold text-[#006156] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Total: <strong>{totalUnits} unidades</strong>
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#006156] text-white">
                            <tr>
                              <th className="py-3 px-4 font-black uppercase text-[10px] tracking-wider w-10 text-center">#</th>
                              <th className="py-3 px-4 font-black uppercase text-[10px] tracking-wider">Insumo / Producto</th>
                              <th className="py-3 px-4 font-black uppercase text-[10px] tracking-wider text-center w-24">Unidad</th>
                              <th className="py-3 px-4 font-black uppercase text-[10px] tracking-wider text-center w-28">Cantidad</th>
                              <th className="py-3 px-4 font-black uppercase text-[10px] tracking-wider">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentReq.items.map((item, idx) => (
                              <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                                <td className="py-3.5 px-4 font-bold text-slate-400 text-center text-xs">{idx + 1}</td>
                                <td className="py-3.5 px-4 font-extrabold text-slate-800 text-sm">{item.productName}</td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-500 uppercase text-[11px]">{item.unit}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="inline-block px-3 py-1 bg-emerald-50 text-[#006156] font-black text-sm rounded-xl border border-emerald-200 shadow-xs">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 italic text-xs">
                                  {item.notes ? `"${item.notes}"` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Sheet Bottom Toolbar */}
                  <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="text-xs font-bold text-slate-500">
                      Mostrando Solicitud {selectedIndex + 1} de {filteredRequests.length}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintRequest(currentReq, currentOrderNum)}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Imprimir Hoja Completa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(currentReq, currentOrderNum)}
                        className="px-4 py-2.5 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-white" />
                        <span>Enviar a WhatsApp</span>
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
