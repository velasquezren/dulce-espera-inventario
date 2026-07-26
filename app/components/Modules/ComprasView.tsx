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
  Package, 
  User, 
  Calendar, 
  Mic, 
  Truck,
  Filter,
  Volume2
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { RequestItem } from '../../lib/mockData';

export default function ComprasView() {
  const { requests, refreshRequests, updateRequestStatus, logout } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pendiente' | 'En revisión' | 'Aceptado' | 'Comprado' | 'Entregado'>('All');
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
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.items && req.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  // Counts
  const pendingCount = requests.filter(r => r.status === 'Pendiente').length;
  const revisionCount = requests.filter(r => r.status === 'En revisión' || r.status === 'Aceptado').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado').length;
  const deliveredCount = requests.filter(r => r.status === 'Entregado').length;

  const handlePrintRequest = (req: RequestItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = req.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 14px;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 16px; text-align: center; color: #006156;">${item.quantity} ${item.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">${item.notes || '-'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ORDEN DE COMPRA - DULCE ESPERA</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; }
          .header { text-align: center; border-bottom: 3px solid #006156; padding-bottom: 15px; margin-bottom: 25px; }
          .title { color: #006156; font-size: 24px; font-weight: 800; margin: 0; }
          .subtitle { color: #39ADA3; font-size: 14px; font-weight: 700; margin-top: 4px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; font-weight: 600; background: #f8fafc; padding: 12px 18px; border-radius: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #006156; color: white; padding: 12px; font-size: 13px; text-align: left; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">ORDEN DE COMPRA DE INSUMOS</h1>
          <div class="subtitle">DULCE ESPERA - GESTIÓN DE ABASTO</div>
        </div>
        <div class="meta">
          <div><strong>ID Pedido:</strong> #${req.id.slice(0, 8).toUpperCase()}</div>
          <div><strong>Solicitado Por:</strong> ${req.user}</div>
          <div><strong>Fecha:</strong> ${req.date}</div>
        </div>
        ${req.reason ? `<div style="background: #e6f0ef; padding: 12px; border-radius: 8px; font-size: 13px; color: #006156; margin-bottom: 20px;"><strong>Motivo / Observación:</strong> "${req.reason}"</div>` : ''}
        <table>
          <thead>
            <tr>
              <th>Producto / Insumo</th>
              <th style="text-align: center;">Cantidad Solicitada</th>
              <th>Notas Adicionales</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="footer">
          Documento generado automáticamente para la encargada de compras de Dulce Espera.
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

  const handleShareWhatsApp = (req: RequestItem) => {
    let text = `🛒 *PEDIDO DE COMPRAS - DULCE ESPERA*\n`;
    text += `*ID:* #${req.id.slice(0, 8).toUpperCase()}\n`;
    text += `*Solicitante:* ${req.user}\n`;
    text += `*Fecha:* ${req.date}\n`;
    if (req.reason) text += `*Motivo:* "${req.reason}"\n`;
    text += `\n*INSUMOS REQUERIDOS:*\n`;
    req.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName}* — ${item.quantity} ${item.unit}\n`;
      if (item.notes) text += `   _Obs: ${item.notes}_\n`;
    });
    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la aplicación._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#f8fafc] flex flex-col overflow-hidden select-none animate-fade-in">
      {/* ─── Top Header (Exclusive for Compras) ─── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-clinical-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006156] text-white flex items-center justify-center shadow-clinical-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#006156] tracking-tight">
              PANEL DE COMPRAS & ABASTO
            </h1>
            <p className="text-xs text-slate-400 font-bold tracking-wide hidden sm:block">
              Revisión de solicitudes de la señora de cocina y audios de voz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content Body ─── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* KPI Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Pendiente' ? 'All' : 'Pendiente')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              statusFilter === 'Pendiente' 
                ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-500/30' 
                : 'bg-white border-rose-200 text-rose-900 hover:bg-rose-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Pendientes de Compra</span>
              <Clock className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{pendingCount}</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'En revisión' ? 'All' : 'En revisión')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              statusFilter === 'En revisión' 
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/30' 
                : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">En Revisión / Aceptado</span>
              <Package className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{revisionCount}</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'Comprado' ? 'All' : 'Comprado')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              statusFilter === 'Comprado' 
                ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/30' 
                : 'bg-white border-indigo-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Comprados / En Camino</span>
              <Truck className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{purchasedCount}</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'Entregado' ? 'All' : 'Entregado')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              statusFilter === 'Entregado' 
                ? 'bg-[#006156] text-white border-[#004d44] ring-2 ring-[#006156]/30' 
                : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Entregados a Cocina</span>
              <CheckCircle2 className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{deliveredCount}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por insumo, código o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#006156]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['All', 'Pendiente', 'En revisión', 'Comprado', 'Entregado'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#006156] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'Todos' : st}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Orders List (Large Screen Responsive Cards) ─── */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <EmptyState
              title="No hay pedidos para mostrar"
              description="No se encontraron pedidos de cocina en esta categoría o con los filtros seleccionados."
            />
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-white border-2 border-slate-200 hover:border-[#39ADA3]/50 rounded-3xl p-5 sm:p-7 shadow-clinical-md space-y-5 transition-all"
              >
                {/* Order Top Bar: ID, Date, User, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006156] flex items-center justify-center font-black text-sm shrink-0 border border-emerald-100">
                      #{req.id.slice(0, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-800">
                          Pedido #{req.id.slice(0, 8).toUpperCase()}
                        </h2>
                        <Badge type="request" value={req.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#39ADA3]" />
                          Solicitante: <strong className="text-slate-700">{req.user}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {req.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Action Button */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {req.status === 'Pendiente' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, 'comprado')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-clinical-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Marcar como Comprado</span>
                      </button>
                    )}
                    {req.status === 'Comprado' && (
                      <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        En camino a cocina
                      </span>
                    )}
                  </div>
                </div>

                {/* PROMINENT AUDIO BANNER (IF AUDIO EXISTS) */}
                {req.audioUrl ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-400/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#006156] font-extrabold text-xs uppercase tracking-wider">
                        <Volume2 className="w-5 h-5 text-emerald-600 animate-pulse" />
                        <span>Instrucción en Nota de Voz de la Señora de Cocina</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Audio Opcional
                      </span>
                    </div>

                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration} 
                      label="Escuchar mensaje de voz"
                      className="w-full bg-white border-emerald-300 py-2.5 px-4 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 italic">
                    Sin nota de voz adjunta.
                  </div>
                )}

                {/* Reason / Comment */}
                {req.reason && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-[#006156] uppercase tracking-wider text-[10px] block mb-1">
                      Motivo u Observación de Cocina:
                    </span>
                    &ldquo;{req.reason}&rdquo;
                  </div>
                )}

                {/* Items Table / Cards */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Insumos Solicitados ({req.items.length})
                  </h3>
                  <div className="divide-y divide-slate-100 bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden">
                    {req.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="font-bold text-slate-800 text-sm">
                          {item.productName}
                          {item.notes && (
                            <span className="block text-xs font-normal text-slate-500 italic mt-0.5">
                              Obs: &ldquo;{item.notes}&rdquo;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-extrabold text-[#006156] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
                          <span>{item.quantity}</span>
                          <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-400">
                    Total de renglones: {req.items.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Imprimir Grande</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" />
                      <span>Enviar WhatsApp</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
