'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, useToast } from '../UI';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Printer, 
  Share2, 
  RotateCw, 
  LogOut, 
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
      showToast('Pedidos actualizados', 'success');
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
      showToast('Error al cambiar el estado', 'error');
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
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 3px solid #006156; padding-bottom: 10px; margin-bottom: 15px; }
          .title { color: #006156; font-size: 20px; font-weight: 900; margin: 0; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #006156; color: white; padding: 8px; text-transform: uppercase; font-size: 11px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">CLÍNICA MONTALVO — PEDIDO N° ${orderNum}</h1>
          <div class="meta">Solicitado por: <strong>${req.user}</strong> | Fecha: ${req.date}</div>
        </div>
        ${req.reason ? `<div style="background: #f1f5f9; padding: 8px; border-radius: 6px; margin-bottom: 12px; font-size: 12px;"><strong>Motivo:</strong> "${req.reason}"</div>` : ''}
        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
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
        <div style="margin-top: 15px; font-weight: bold; text-align: right; color: #006156; font-size: 13px;">
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
    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la PWA._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-28 overflow-y-auto">
      
      {/* ─── Encabezado Plano Limpio ─── */}
      <header className="sticky top-0 z-30 bg-[#006156] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-4.5 h-4.5 text-[#39ADA3]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
              CLÍNICA MONTALVO
            </h1>
            <p className="text-[10px] text-emerald-100/90 font-bold uppercase tracking-wider">
              Pedidos de Compras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 active:scale-95 disabled:opacity-50 min-h-[40px]"
            title="Actualizar"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Filtros Planos (Sin Cajas Envolventes) ─── */}
      <div className="sticky top-[57px] z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer min-h-[38px] ${
                statusFilter === 'All' 
                  ? 'bg-[#006156] text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({requests.length})
            </button>
            
            <button
              onClick={() => setStatusFilter('Pendiente')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                statusFilter === 'Pendiente' 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Por Comprar ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Comprado')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                statusFilter === 'Comprado' 
                  ? 'bg-[#39ADA3] text-white' 
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comprados ({purchasedCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insumo o cocinera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#006156] min-h-[38px]"
            />
          </div>
        </div>
      </div>

      {/* ─── FLUTO TOTALMENTE PLANO (SIN NINGUNA CAJA ANIDADA) ─── */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 animate-view-enter">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold border-b border-slate-200">
            No hay pedidos disponibles.
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const orderNum = filteredRequests.length - idx;
            const isPending = req.status === 'Pendiente' || req.status === 'En revisión';

            return (
              <div 
                key={req.id}
                className="border-b-2 border-slate-200 pb-8 space-y-4"
              >
                {/* 1. Título e Info del Pedido (Plano en página) */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#006156]">
                        Pedido N° {orderNum}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-700">
                        {req.user}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Fecha: {req.date}
                    </p>
                  </div>

                  {/* Estado Plano */}
                  {isPending ? (
                    <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Por Comprar
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#006156]" />
                      Comprado
                    </span>
                  )}
                </div>

                {/* 2. Reproductor de Audio Plano (Si existe) */}
                {req.audioUrl && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold text-[#006156] flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-[#006156] animate-pulse" />
                      <span>Nota de Voz de Cocina</span>
                    </div>
                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration}
                      label="Escuchar nota de voz"
                      className="w-full bg-white border-slate-200"
                    />
                  </div>
                )}

                {/* 3. Motivo / Observación */}
                {req.reason && (
                  <div className="text-xs text-slate-700 bg-slate-100/70 p-3 rounded-lg">
                    <strong className="text-[#006156]">Observación:</strong> &ldquo;{req.reason}&rdquo;
                  </div>
                )}

                {/* 4. Lista Plana de Insumos (SIN CAJA NI TABLA ENCAJONADA) */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Insumos a Comprar ({req.items.length}):
                  </div>

                  <div className="divide-y divide-slate-100 bg-white border-t border-b border-slate-200">
                    {req.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="py-2.5 px-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 text-xs">{itemIdx + 1}.</span>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm">{item.productName}</span>
                            {item.notes && (
                              <span className="block text-xs text-slate-400 italic">Obs: {item.notes}</span>
                            )}
                          </div>
                        </div>

                        <div className="font-black text-sm text-[#006156] shrink-0">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Acciones Planas Directas */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Imprimir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#006156] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#006156]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, 'comprado')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#006156] hover:bg-[#004d44] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#39ADA3]" />
                      <span>MARCAR COMO COMPRADO</span>
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
