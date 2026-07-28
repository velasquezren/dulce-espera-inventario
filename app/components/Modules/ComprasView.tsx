'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../UI';
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
  CheckSquare,
  User,
  Filter
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
  const [confirmModalOrder, setConfirmModalOrder] = useState<RequestItem | null>(null);

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
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  const isGroupExpanded = (orderId: string, grupoName: string) => {
    const key = `${orderId}-${grupoName}`;
    return expandedGroups[key] !== false; // Default expanded (true)
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRequests();
      showToast('Lista de compras actualizada', 'success');
    } catch {
      showToast('Error al actualizar lista', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      showToast(`Pedido marcado como "${newStatus}"`, 'success');
      setConfirmModalOrder(null);
    } catch {
      showToast('Error al actualizar el estado', 'error');
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

  // Overall Global Counts
  const pendingCount = requests.filter(r => r.status === 'Pendiente' || r.status === 'En revisión').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado' || r.status === 'Entregado').length;

  const handlePrintRequest = (req: RequestItem, orderNum: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sortedItems = [...req.items].sort((a, b) => {
      const catA = getItemCategory(a.productName);
      const catB = getItemCategory(b.productName);
      return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
    });

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
          <td colspan="4" style="padding: 10px 12px; font-weight: 800; color: #006156; text-transform: uppercase; font-size: 12px; border-bottom: 2px solid #006156;">
            GRUPO DE COMPRA: ${grupoName} (${items.length} productos)
          </td>
        </tr>
      `;
      items.forEach((item) => {
        const categoryStr = getItemCategory(item.productName);
        tableContentHtml += `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: center; color: #64748b;">${globalIndex++}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #006156;">${categoryStr}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a; font-size: 13px;">${item.productName}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 800; text-align: center; color: #006156; font-size: 14px;">${item.quantity} ${item.unit}</td>
          </tr>
        `;
      });
    });

    const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HOJA DE COMPRAS - CLÍNICA MONTALVO</title>
        <style>
          body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0f172a; background: #ffffff; line-height: 1.4; }
          .header { border-bottom: 2px solid #006156; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { color: #006156; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
          .sub { color: #39ADA3; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 12px; }
          .meta { font-size: 13px; color: #475569; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          th { background: #006156; color: white; padding: 10px 12px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; text-align: left; }
          .footer { margin-top: 28px; font-weight: 800; text-align: right; color: #006156; font-size: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">CLÍNICA MONTALVO</div>
            <div class="sub">Gestión de Insumos & Compras • Dulce Espera</div>
            <div class="title">ORDEN DE COMPRA — FECHA: ${req.date}</div>
            <div class="meta">Solicitante: <strong>${req.user}</strong> (Pedido N° ${orderNum})</div>
          </div>
        </div>
        ${req.reason ? `<div style="background: #f8fafc; border-left: 3px solid #006156; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #334155;"><strong>Nota de Cocina:</strong> "${req.reason}"</div>` : ''}
        <table>
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;">#</th>
              <th style="width: 130px;">Categoría</th>
              <th>Nombre del Insumo</th>
              <th style="text-align: center; width: 160px;">Cantidad Requerida</th>
            </tr>
          </thead>
          <tbody>
            ${tableContentHtml}
          </tbody>
        </table>
        <div class="footer">
          Total Insumos Requeridos: ${req.items.length} | Unidades Totales: ${totalQty}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleShareWhatsApp = (req: RequestItem, orderNum: number) => {
    let text = `🛒 *CLÍNICA MONTALVO — LISTA DE COMPRAS*\n`;
    text += `📅 *Fecha:* ${req.date}\n`;
    text += `👤 *Solicitado por:* ${req.user}\n`;
    text += `📋 *Pedido N°:* ${orderNum}\n`;
    
    const sortedItems = [...req.items].sort((a, b) => {
      const catA = getItemCategory(a.productName);
      const catB = getItemCategory(b.productName);
      return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
    });

    const grouped = sortedItems.reduce((acc, item) => {
      const g = getGrupoInsumo('', item.productName);
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {} as Record<string, typeof req.items>);

    Object.entries(grouped).forEach(([grupoName, items]) => {
      text += `\n📍 *GRUPO: ${grupoName.toUpperCase()}*\n`;
      items.forEach((item, idx) => {
        const cat = getItemCategory(item.productName);
        text += `  ${idx + 1}. [${cat}] *${item.productName}* — ${item.quantity} ${item.unit}\n`;
        if (item.notes) text += `     _Obs: ${item.notes}_\n`;
      });
    });

    if (req.audioUrl) text += `\n🔊 _Incluye nota de voz adjunta en la PWA._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-32 overflow-y-auto antialiased">
      
      {/* ─── 1. ENCABEZADO HOSPITALARIO (Blanco, Logo Puro) ─── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Puro (Sin caja/card) + Identidad Clínica Montalvo */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Clínica Montalvo Logo" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#006156] tracking-tight leading-none">
                  CLÍNICA MONTALVO
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#e6f0ef] text-[#006156] text-[10px] font-extrabold uppercase tracking-wider border border-[#39ADA3]/30">
                  Modulo de Compras
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39ADA3] animate-pulse inline-block" />
                Checklist de Insumos & Pedidos de Cocina
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200/60"
              title="Actualizar pedidos"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#006156] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Salir de Compras"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* ─── 2. FILTROS SUBTILES (Sin Cards de Resumen, Botones No Invasivos) ─── */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Filtros sutiles tipo pestañas ligeras */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'All' 
                  ? 'bg-[#006156] text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Todos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {requests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Pendiente')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Pendiente' 
                  ? 'bg-[#006156] text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>Por Comprar</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'Pendiente' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Comprado')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Comprado' 
                  ? 'bg-[#006156] text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Comprados</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'Comprado' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {purchasedCount}
              </span>
            </button>
          </div>

          {/* Input de Búsqueda Sutil */}
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar insumo, solicitante o fecha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-[#006156] rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all min-h-[36px]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ─── 3. LISTADO DE PEDIDOS (Una Card Principal por Pedido, Sin Cards Anidadas) ─── */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 animate-view-enter">
        
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200/80 rounded-2xl p-8 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No hay pedidos registrados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No se encontraron solicitudes con los filtros aplicados.
            </p>
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const orderNum = filteredRequests.length - idx;
            const isPending = req.status === 'Pendiente' || req.status === 'En revisión';
            const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

            // Checked items count for this order
            const checkedCountForOrder = req.items.filter((_, itemIdx) => checkedItems[`${req.id}-${itemIdx}`]).length;

            // Sort items by category and name
            const sortedItems = [...req.items].sort((a, b) => {
              const catA = getItemCategory(a.productName);
              const catB = getItemCategory(b.productName);
              return catA.localeCompare(catB) || a.productName.localeCompare(b.productName);
            });

            // Group sorted items by Mercado vs Supermercado
            const itemsByGrupo = sortedItems.reduce((acc, item) => {
              const grupoName = getGrupoInsumo('', item.productName);
              if (!acc[grupoName]) acc[grupoName] = [];
              acc[grupoName].push(item);
              return acc;
            }, {} as Record<string, typeof req.items>);

            return (
              <article 
                key={req.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5"
              >
                
                {/* Cabecera del Pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-lg sm:text-xl tracking-tight">
                        <Calendar className="w-5 h-5 text-[#006156] shrink-0" />
                        <span>FECHA: {req.date}</span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-md bg-[#e6f0ef] text-[#006156] text-xs font-black border border-[#39ADA3]/30">
                        Pedido N° {orderNum}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Solicitado por: <strong className="text-slate-900 font-extrabold">{req.user}</strong>
                      </span>
                      <span>•</span>
                      <span>{req.items.length} insumos ({totalQty} unidades)</span>
                    </div>
                  </div>

                  {/* Badges de Estado */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-[#006156]" />
                      <span>{checkedCountForOrder} / {req.items.length} listos</span>
                    </div>

                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Por Comprar
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/40 text-xs font-extrabold uppercase flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#006156]" />
                        Comprado
                      </span>
                    )}
                  </div>

                </div>

                {/* Nota de Voz Adjunta */}
                {req.audioUrl && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#006156]">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#006156]" />
                        Instrucción en Nota de Voz de Cocina
                      </span>
                    </div>
                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration}
                      label="Toca para escuchar nota de voz"
                      className="w-full bg-white border-slate-200/80"
                    />
                  </div>
                )}

                {/* Observación de Cocina */}
                {req.reason && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border-l-3 border-[#006156]">
                    <p className="text-[11px] font-extrabold text-[#006156] uppercase tracking-wider">
                      Observación:
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 italic">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>
                )}

                {/* ─── GRUPOS DE INSUMOS (Diseño Plano, Sin Cards Anidadas) ─── */}
                <div className="space-y-4 pt-1">

                  {Object.entries(itemsByGrupo).map(([grupoName, itemsGroup], groupIdx) => {
                    const isMercado = grupoName.includes('Mercado');
                    const groupIcon = isMercado 
                      ? <ShoppingBag className="w-4 h-4 text-[#006156]" /> 
                      : <Store className="w-4 h-4 text-[#39ADA3]" />;
                    
                    const expanded = isGroupExpanded(req.id, grupoName);
                    
                    const groupCheckedCount = itemsGroup.filter(item => {
                      const origIdx = req.items.findIndex(i => i.productName === item.productName);
                      return checkedItems[`${req.id}-${origIdx}`];
                    }).length;

                    return (
                      <div key={groupIdx} className="pt-1">
                        
                        {/* Cabecera PLANA del Grupo (Sin Marco de Card) */}
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(req.id, grupoName)}
                          className="w-full flex items-center justify-between py-2 border-b border-slate-200 text-left transition-colors cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-2">
                            {groupIcon}
                            <span className="text-xs sm:text-sm font-extrabold text-[#006156] uppercase tracking-wider">
                              {grupoName}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              ({groupCheckedCount}/{itemsGroup.length})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 text-xs font-bold">
                            <span>{expanded ? 'Ocultar' : 'Ver'}</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Lista PLANA del Checklist */}
                        {expanded && (
                          <div className="divide-y divide-slate-100">
                            {itemsGroup.map((item, itemIdx) => {
                              const originalItemIndex = req.items.findIndex(i => i.productName === item.productName);
                              const isChecked = checkedItems[`${req.id}-${originalItemIndex}`] || false;
                              const categoryName = getItemCategory(item.productName);

                              return (
                                <div 
                                  key={itemIdx}
                                  onClick={() => toggleItemCheck(req.id, originalItemIndex)}
                                  className={`py-3 px-1 flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${
                                    isChecked ? 'opacity-60' : 'hover:bg-slate-50/60'
                                  }`}
                                >
                                  {/* Checkbox táctil + Nombre */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="shrink-0 text-[#006156] min-h-[40px] min-w-[40px] flex items-center justify-center">
                                      {isChecked ? (
                                        <CheckSquare className="w-5 h-5 text-[#006156]" />
                                      ) : (
                                        <Square className="w-5 h-5 text-slate-300 hover:text-[#006156] transition-colors" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-bold text-sm transition-all ${
                                          isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                                        }`}>
                                          {item.productName}
                                        </span>
                                        
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0">
                                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                                          {categoryName}
                                        </span>
                                      </div>

                                      {item.notes && (
                                        <p className="text-xs text-slate-500 italic mt-0.5">
                                          Obs: {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Cantidad */}
                                  <div className="shrink-0">
                                    <span className={`inline-block px-3 py-1 text-xs font-black rounded-lg transition-all ${
                                      isChecked 
                                        ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                                        : 'bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/30'
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

                {/* Toolbar de Acciones del Pedido */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] border border-slate-200/60 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Imprimir Hoja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req, orderNum)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#e6f0ef] hover:bg-[#d5e7e5] text-[#006156] border border-[#39ADA3]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#006156]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => setConfirmModalOrder(req)}
                      className="w-full sm:w-auto min-h-[40px] px-5 py-2 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#39ADA3]" />
                      <span>Marcar como Comprado</span>
                    </button>
                  )}

                </div>

              </article>
            );
          })
        )}

      </main>

      {/* ─── 4. BARRA DE ACCIÓN FLOTANTE STICKY PARA CELULARES ─── */}
      {filteredRequests.length > 0 && (
        <div className="fixed lg:hidden bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-lg z-40 flex items-center gap-2.5">
          {filteredRequests[0]?.status === 'Pendiente' && (
            <button
              type="button"
              onClick={() => setConfirmModalOrder(filteredRequests[0])}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#006156] active:bg-[#004d44] text-white font-black text-xs flex items-center justify-center gap-2 transition-transform cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#39ADA3]" />
              <span>Marcar Comprado</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleShareWhatsApp(filteredRequests[0], filteredRequests.length)}
            className="py-2.5 px-4 rounded-xl bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            title="Enviar pedido por WhatsApp"
          >
            <Share2 className="w-4 h-4 text-[#006156]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintRequest(filteredRequests[0], filteredRequests.length)}
            className="p-2.5 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer min-h-[44px] w-11"
            title="Imprimir Hoja de Compras"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}

      {/* ─── 5. MODAL DE CONFIRMACIÓN ─── */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">¿Confirmar compra completada?</h3>
              <p className="text-xs text-slate-500">
                El pedido del <strong className="text-slate-800">{confirmModalOrder.date}</strong> solicitado por <strong className="text-slate-800">{confirmModalOrder.user}</strong> cambiará su estado a &quot;Comprado&quot;.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors min-h-[42px] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(confirmModalOrder.id, 'comprado')}
                className="flex-1 py-2.5 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-extrabold text-xs transition-colors min-h-[42px] cursor-pointer"
              >
                Sí, Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

