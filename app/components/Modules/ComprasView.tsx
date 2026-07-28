'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, useToast } from '../UI';
import { 
  Search, 
  CheckCircle2, 
  Printer, 
  Share2, 
  RotateCw, 
  LogOut, 
  Truck,
  Volume2,
  Check,
  Calendar,
  ShoppingBag,
  Store
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { RequestItem } from '../../lib/mockData';

// Backend logic for classifying items into purchase groups (Mercado vs Supermercado)
function getGrupoInsumo(categoria: string, nombre: string): string {
  const cat = (categoria || '').toLowerCase().trim();
  const nom = (nombre || '').toLowerCase();

  const mercadoKeywords = ["verdura", "fruta", "carne", "proteina", "pollo", "pescado", "embutido", "fresco", "huevo", "pimenton", "platano", "tomate", "cebolla", "papa"];
  if (mercadoKeywords.some(kw => cat.includes(kw) || nom.includes(kw))) {
    return 'Mercado (Plaza / Perecederos)';
  }
  return 'Supermercado (Víveres / Secos)';
}

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

    // Group items by Grupo
    const grouped = req.items.reduce((acc, item) => {
      const g = getGrupoInsumo('', item.productName);
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {} as Record<string, typeof req.items>);

    let tableContentHtml = '';
    let globalIndex = 1;

    Object.entries(grouped).forEach(([grupoName, items]) => {
      tableContentHtml += `
        <tr style="background: #e6f0ef;">
          <td colspan="3" style="padding: 10px; font-weight: 900; color: #006156; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #006156;">
            GRUPO: ${grupoName} (${items.length} insumos)
          </td>
        </tr>
      `;
      items.forEach((item) => {
        tableContentHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: center; color: #64748b;">${globalIndex++}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #0f172a; font-size: 14px;">${item.productName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 900; text-align: center; color: #006156; font-size: 16px;">${item.quantity} ${item.unit}</td>
          </tr>
        `;
      });
    });

    const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HOJA DE COMPRAS - DULCE ESPERA</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 3px solid #006156; padding-bottom: 12px; margin-bottom: 20px; }
          .title { color: #006156; font-size: 24px; font-weight: 900; margin: 0; }
          .meta { font-size: 14px; color: #475569; margin-top: 6px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #006156; color: white; padding: 10px; text-transform: uppercase; font-size: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">FECHA: ${req.date}</h1>
          <div class="meta">Solicitado por: <strong>${req.user}</strong> (Pedido N° ${orderNum})</div>
        </div>
        ${req.reason ? `<div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;"><strong>Motivo:</strong> "${req.reason}"</div>` : ''}
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>Nombre del Insumo</th>
              <th style="text-align: center; width: 160px;">Cantidad / Presentación</th>
            </tr>
          </thead>
          <tbody>
            ${tableContentHtml}
          </tbody>
        </table>
        <div style="margin-top: 25px; font-weight: 900; text-align: right; color: #006156; font-size: 15px;">
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
    let text = `🛒 *DULCE ESPERA - PEDIDO DEL ${req.date}*\n`;
    text += `*Solicitante:* ${req.user}\n`;
    text += `*Pedido N°:* ${orderNum}\n`;
    
    // Group items by Grupo for WhatsApp
    const grouped = req.items.reduce((acc, item) => {
      const g = getGrupoInsumo('', item.productName);
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {} as Record<string, typeof req.items>);

    Object.entries(grouped).forEach(([grupoName, items]) => {
      text += `\n📌 *GRUPO: ${grupoName.toUpperCase()}*\n`;
      items.forEach((item, idx) => {
        text += `  ${idx + 1}. *${item.productName}* — ${item.quantity} ${item.unit}\n`;
        if (item.notes) text += `     _Obs: ${item.notes}_\n`;
      });
    });

    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la PWA._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-28 overflow-y-auto">
      
      {/* ─── Encabezado Oficial Dulce Espera con Logo ─── */}
      <header className="sticky top-0 z-30 bg-[#006156] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Dulce Espera Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              DULCE ESPERA
            </h1>
            <p className="text-[10px] text-emerald-100/90 font-bold uppercase tracking-wider">
              Inventario de Cocina • Pedidos por Grupo de Compra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 active:scale-95 disabled:opacity-50 min-h-[40px]"
            title="Actualizar"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Filtros Planos (Sin Cajas Envolventes) ─── */}
      <div className="sticky top-[57px] z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer min-h-[38px] ${
                statusFilter === 'All' 
                  ? 'bg-[#006156] text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({requests.length})
            </button>
            
            <button
              onClick={() => setStatusFilter('Pendiente')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
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
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                statusFilter === 'Comprado' 
                  ? 'bg-[#39ADA3] text-white' 
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comprados ({purchasedCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por fecha, insumo o grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#006156] min-h-[38px]"
            />
          </div>
        </div>
      </div>

      {/* ─── FLUTO PLANO CON PEDIDOS ORGANIZADOS POR GRUPO DE COMPRA ─── */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-12 animate-view-enter">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold border-b border-slate-200">
            No se encontraron pedidos.
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const orderNum = filteredRequests.length - idx;
            const isPending = req.status === 'Pendiente' || req.status === 'En revisión';
            const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

            // Group items strictly by Grupo de Compra (Mercado vs Supermercado)
            const itemsByGrupo = req.items.reduce((acc, item) => {
              const grupoName = getGrupoInsumo('', item.productName);
              if (!acc[grupoName]) acc[grupoName] = [];
              acc[grupoName].push(item);
              return acc;
            }, {} as Record<string, typeof req.items>);

            return (
              <div 
                key={req.id}
                className="border-b-2 border-slate-200 pb-12 space-y-6"
              >
                {/* 1. TÍTULO PRINCIPAL: LA FECHA DEL PEDIDO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-6 h-6 text-[#006156] shrink-0" />
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        FECHA: {req.date}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1.5">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-[#006156] font-black border border-emerald-200">
                        Pedido N° {orderNum}
                      </span>
                      <span>•</span>
                      <span>Solicitado por: <strong className="text-slate-900 font-black">{req.user}</strong></span>
                    </div>
                  </div>

                  {/* Estado Destacado */}
                  <div>
                    {isPending ? (
                      <span className="text-xs font-black uppercase text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5 w-fit">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Por Comprar
                      </span>
                    ) : (
                      <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 w-fit">
                        <Truck className="w-4 h-4 text-[#006156]" />
                        Comprado
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Reproductor de Audio (Si existe) */}
                {req.audioUrl && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#006156]">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#006156] animate-pulse" />
                        Instrucción en Nota de Voz de Cocina
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-[#006156] px-2.5 py-0.5 rounded-full font-bold">
                        Audio Adjunto
                      </span>
                    </div>
                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration}
                      label="Toca para reproducir nota de voz"
                      className="w-full bg-white border-emerald-200"
                    />
                  </div>
                )}

                {/* 3. Motivo / Observación */}
                {req.reason && (
                  <div className="text-xs text-slate-700 bg-slate-100/70 p-4 rounded-xl">
                    <strong className="text-[#006156] block mb-0.5 font-black">Observación de Cocina:</strong>
                    <p className="italic text-slate-800 font-semibold text-sm">&ldquo;{req.reason}&rdquo;</p>
                  </div>
                )}

                {/* 4. TABLAS ORGANIZADAS POR GRUPO DE COMPRA (SIN ID PÚBLICO) */}
                <div className="my-8 space-y-6">
                  <div className="flex items-center justify-between text-xs font-black text-slate-600 px-1 uppercase tracking-wider">
                    <span>Insumos Organizados por Grupo de Compra</span>
                    <span className="text-[#006156] font-black">
                      Total: {totalQty} unidades
                    </span>
                  </div>

                  {Object.entries(itemsByGrupo).map(([grupoName, itemsGroup], groupIdx) => {
                    const isMercado = grupoName.includes('Mercado');
                    const groupIcon = isMercado ? <ShoppingBag className="w-4 h-4 text-[#006156]" /> : <Store className="w-4 h-4 text-[#39ADA3]" />;

                    return (
                      <div key={groupIdx} className="space-y-3">
                        {/* Cabecera del Grupo de Compra */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e6f0ef] border border-[#39ADA3]/40 text-[#006156] font-black text-xs uppercase tracking-wider w-fit">
                          {groupIcon}
                          <span>GRUPO: {grupoName} ({itemsGroup.length} insumos)</span>
                        </div>

                        {/* Tabla Holgada por Grupo (Sin Columna ID Público) */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#006156] text-white">
                              <tr>
                                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-center w-12">#</th>
                                <th className="py-3.5 px-4 font-black uppercase tracking-wider">Nombre del Insumo</th>
                                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-center w-40">Cantidad / Presentación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {itemsGroup.map((item, itemIdx) => (
                                <tr key={itemIdx} className={itemIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                                  <td className="py-4 px-4 font-bold text-slate-400 text-center">{itemIdx + 1}</td>
                                  <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                                    {item.productName}
                                    {item.notes && (
                                      <span className="block text-xs font-normal text-slate-400 italic mt-0.5">
                                        Obs: {item.notes}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <span className="inline-block px-3.5 py-1.5 bg-emerald-50 text-[#006156] font-black text-sm rounded-xl border border-emerald-200">
                                      {item.quantity} {item.unit}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 5. Acciones del Pedido */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req, orderNum)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px]"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Imprimir Hoja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req, orderNum)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#006156] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px]"
                    >
                      <Share2 className="w-4 h-4 text-[#006156]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, 'comprado')}
                      className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-black text-xs shadow-clinical-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wide"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#39ADA3]" />
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
