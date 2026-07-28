'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Store,
  Tag,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare
} from 'lucide-react';
import AudioPlayer from '../AudioPlayer';
import { RequestItem } from '../../lib/mockData';

// Helper to get category for an item
function getItemCategory(productName: string): string {
  const name = (productName || '').toLowerCase();
  if (name.includes('tomate') || name.includes('cebolla') || name.includes('papa') || name.includes('zanahoria') || name.includes('lechuga') || name.includes('limon') || name.includes('pimenton') || name.includes('platano') || name.includes('verdura')) {
    return 'Verduras';
  }
  if (name.includes('manzana') || name.includes('fruta') || name.includes('naranja')) {
    return 'Frutas';
  }
  if (name.includes('leche') || name.includes('queso') || name.includes('mantequilla') || name.includes('crema') || name.includes('yogur')) {
    return 'Lácteos';
  }
  if (name.includes('carne') || name.includes('pollo') || name.includes('pescado') || name.includes('huevo') || name.includes('jamon')) {
    return 'Carnes y Proteínas';
  }
  if (name.includes('detergente') || name.includes('jabón') || name.includes('limpiador') || name.includes('esponja') || name.includes('papel')) {
    return 'Limpieza';
  }
  if (name.includes('comino') || name.includes('harina') || name.includes('aceite') || name.includes('arroz') || name.includes('sal') || name.includes('azucar') || name.includes('fideos')) {
    return 'Abarrotes';
  }
  return 'Otros';
}

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

  // Persistent State to track checked items per order: { `${orderId}-${itemIdx}`: boolean }
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // State to track expanded groups per order: { `${orderId}-${grupoName}`: boolean }
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Load saved checklist from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dulce_espera_checklist_v1');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error al cargar checklist guardado', e);
    }
  }, []);

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('dulce_espera_checklist_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al guardar checklist', e);
      }
      return updated;
    });
  };

  const toggleGroupExpand = (orderId: string, grupoName: string) => {
    const key = `${orderId}-${grupoName}`;
    setExpandedGroups(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key] // Default is expanded (true) if undefined
    }));
  };

  const isGroupExpanded = (orderId: string, grupoName: string) => {
    const key = `${orderId}-${grupoName}`;
    return expandedGroups[key] !== false; // Default true (expanded)
  };

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

    // Sort items by category
    const sortedItems = [...req.items].sort((a, b) => {
      const catA = getItemCategory(a.productName);
      const catB = getItemCategory(b.productName);
      return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
    });

    // Group items by Grupo
    const grouped = sortedItems.reduce((acc, item) => {
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
          <td colspan="4" style="padding: 10px; font-weight: 900; color: #006156; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #006156;">
            GRUPO: ${grupoName} (${items.length} insumos)
          </td>
        </tr>
      `;
      items.forEach((item) => {
        const categoryStr = getItemCategory(item.productName);
        tableContentHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: center; color: #64748b;">${globalIndex++}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #006156;">${categoryStr}</td>
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
              <th style="width: 120px;">Categoría</th>
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
    
    // Sort items by category
    const sortedItems = [...req.items].sort((a, b) => {
      const catA = getItemCategory(a.productName);
      const catB = getItemCategory(b.productName);
      return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
    });

    // Group items by Grupo for WhatsApp
    const grouped = sortedItems.reduce((acc, item) => {
      const g = getGrupoInsumo('', item.productName);
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {} as Record<string, typeof req.items>);

    Object.entries(grouped).forEach(([grupoName, items]) => {
      text += `\n📌 *GRUPO: ${grupoName.toUpperCase()}*\n`;
      items.forEach((item, idx) => {
        const cat = getItemCategory(item.productName);
        text += `  ${idx + 1}. [${cat}] *${item.productName}* — ${item.quantity} ${item.unit}\n`;
        if (item.notes) text += `     _Obs: ${item.notes}_\n`;
      });
    });

    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz en la PWA._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-28 overflow-y-auto">
      
      {/* ─── Encabezado Plano y Minimalista Dulce Espera ─── */}
      <header className="sticky top-0 z-30 bg-[#006156] text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Dulce Espera Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wide">
              DULCE ESPERA
            </h1>
            <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">
              Checklist de Compras de Cocina
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Actualizar"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="h-9 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border border-rose-300/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ─── Filtros Planos Adaptados a Celular (Grid de 3 Columnas Perfectas) ─── */}
      <div className="sticky top-[53px] z-20 bg-white border-b border-slate-200 px-3 sm:px-8 py-2.5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          {/* Grid de 3 Columnas para Celular */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl w-full sm:w-auto border border-slate-200/60">
            <button
              onClick={() => setStatusFilter('All')}
              className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center min-h-[36px] flex items-center justify-center ${
                statusFilter === 'All' 
                  ? 'bg-[#006156] text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({requests.length})
            </button>
            
            <button
              onClick={() => setStatusFilter('Pendiente')}
              className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center min-h-[36px] flex items-center justify-center gap-1 ${
                statusFilter === 'Pendiente' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span className="truncate">Por Comprar ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Comprado')}
              className={`py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center min-h-[36px] flex items-center justify-center gap-1 ${
                statusFilter === 'Comprado' 
                  ? 'bg-[#39ADA3] text-white shadow-xs' 
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Comprados ({purchasedCount})</span>
            </button>
          </div>

          {/* Buscador Rápido */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insumo o grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#006156] min-h-[36px]"
            />
          </div>
        </div>
      </div>

      {/* ─── FLUTO DE PEDIDOS CON GRUPOS DESPLEGABLES Y CHECKLIST PERSISTENTE EN LOCALSTORAGE ─── */}
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

            // Calculate checked items count for this order
            const checkedCountForOrder = req.items.filter((_, itemIdx) => checkedItems[`${req.id}-${itemIdx}`]).length;

            // Sort items by category and name
            const sortedItems = [...req.items].sort((a, b) => {
              const catA = getItemCategory(a.productName);
              const catB = getItemCategory(b.productName);
              return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
            });

            // Group sorted items by Grupo de Compra (Mercado vs Supermercado)
            const itemsByGrupo = sortedItems.reduce((acc, item) => {
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

                  {/* Estado y Progreso del Checklist */}
                  <div className="flex flex-col items-start sm:items-end gap-1.5">
                    {isPending ? (
                      <span className="text-xs font-black uppercase text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5 w-fit">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Por Comprar
                      </span>
                    ) : (
                      <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 w-fit">
                        <Truck className="w-4 h-4 text-[#006156]" />
                        Comprado
                      </span>
                    )}

                    {/* Progress Checklist Pill */}
                    <div className="text-[11px] font-extrabold text-[#006156] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Checklist en tienda: <strong>{checkedCountForOrder} / {req.items.length} listos</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Reproductor de Audio (Si existe) */}
                {req.audioUrl && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#006156]">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#006156]" />
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

                {/* 4. GRUPOS DESPLEGABLES (MERCADO / SUPERMERCADO) + CHECKLIST FÁCIL PARA TELÉFONO */}
                <div className="my-8 space-y-6">
                  <div className="flex items-center justify-between text-xs font-black text-slate-600 px-1 uppercase tracking-wider">
                    <span>Insumos Organizados por Grupo (Desplegable)</span>
                    <span className="text-[#006156] font-black">
                      Total: {totalQty} unidades
                    </span>
                  </div>

                  {Object.entries(itemsByGrupo).map(([grupoName, itemsGroup], groupIdx) => {
                    const isMercado = grupoName.includes('Mercado');
                    const groupIcon = isMercado ? <ShoppingBag className="w-4.5 h-4.5 text-[#006156]" /> : <Store className="w-4.5 h-4.5 text-[#39ADA3]" />;
                    const expanded = isGroupExpanded(req.id, grupoName);

                    return (
                      <div key={groupIdx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                        
                        {/* Cabecera Interactiva Desplegable del Grupo */}
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(req.id, grupoName)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-[#e6f0ef] hover:bg-[#d5e7e5] text-[#006156] font-black text-xs uppercase tracking-wider transition-all cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            {groupIcon}
                            <span>GRUPO: {grupoName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white text-[#006156] text-[11px] font-extrabold shadow-xs">
                              {itemsGroup.length} insumos
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-bold text-xs text-[#006156]">
                            <span>{expanded ? 'Ocultar' : 'Ver'}</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Lista Desplegable con Checklist Fáciles de Marcar en el Teléfono (Guardado en localStorage) */}
                        {expanded && (
                          <div className="divide-y divide-slate-100">
                            {itemsGroup.map((item, itemIdx) => {
                              // Global item index within order
                              const originalItemIndex = req.items.findIndex(i => i.productName === item.productName);
                              const isChecked = checkedItems[`${req.id}-${originalItemIndex}`] || false;
                              const categoryName = getItemCategory(item.productName);

                              return (
                                <div 
                                  key={itemIdx}
                                  onClick={() => toggleItemCheck(req.id, originalItemIndex)}
                                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
                                    isChecked ? 'bg-emerald-50/70 opacity-75' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  {/* Checkbox Táctil Grande */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="shrink-0 text-[#006156] min-h-[44px] min-w-[44px] flex items-center justify-center">
                                      {isChecked ? (
                                        <CheckSquare className="w-6 h-6 text-[#006156]" />
                                      ) : (
                                        <Square className="w-6 h-6 text-slate-300 hover:text-[#006156]" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-extrabold text-sm ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                          {item.productName}
                                        </span>
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                                          <Tag className="w-2.5 h-2.5" />
                                          {categoryName}
                                        </span>
                                      </div>

                                      {item.notes && (
                                        <p className="text-xs text-slate-400 italic mt-0.5">
                                          Obs: {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Cantidad / Presentación */}
                                  <div className="shrink-0">
                                    <span className={`inline-block px-3.5 py-1.5 text-sm font-black rounded-xl border transition-all ${
                                      isChecked 
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                                        : 'bg-[#e6f0ef] text-[#006156] border-[#39ADA3]/40'
                                    }`}>
                                      {item.quantity} {item.unit}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

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
