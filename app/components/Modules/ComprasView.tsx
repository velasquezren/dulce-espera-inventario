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
  Sparkles,
  ClipboardList,
  User,
  Clock,
  ArrowRight,
  Filter,
  CheckCheck
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

  // Overall Global Counts & Stats
  const pendingCount = requests.filter(r => r.status === 'Pendiente' || r.status === 'En revisión').length;
  const purchasedCount = requests.filter(r => r.status === 'Comprado' || r.status === 'Entregado').length;

  const totalItemsCount = useMemo(() => {
    return filteredRequests.reduce((sum, req) => sum + req.items.length, 0);
  }, [filteredRequests]);

  const totalCheckedItemsCount = useMemo(() => {
    return filteredRequests.reduce((sum, req) => {
      const orderChecked = req.items.filter((_, idx) => checkedItems[`${req.id}-${idx}`]).length;
      return sum + orderChecked;
    }, 0);
  }, [filteredRequests, checkedItems]);

  const overallProgressPercentage = totalItemsCount > 0 
    ? Math.round((totalCheckedItemsCount / totalItemsCount) * 100) 
    : 0;

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
      
      {/* ─── 1. ENCABEZADO HOSPITALARIO MINIMALISTA (Blanco, Limpio, Profesional) ─── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo + Identidad Clínica Montalvo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shadow-2xs shrink-0">
              <img src="/logo.svg" alt="Clínica Montalvo Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#006156] tracking-tight leading-none">
                  CLÍNICA MONTALVO
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#e6f0ef] text-[#006156] text-[10px] font-extrabold uppercase tracking-wider border border-[#39ADA3]/30">
                  PWA Hospitalaria
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39ADA3] animate-pulse inline-block" />
                Módulo de Compras & Checklist de Insumos
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            {/* Botón Actualizar Sincronización */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-3 sm:px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200/60"
              title="Actualizar pedidos"
            >
              <RotateCw className={`w-4 h-4 text-[#006156] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            {/* Botón Salir */}
            <button
              type="button"
              onClick={logout}
              className="h-10 px-3 sm:px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Salir de Compras"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* ─── 2. BARRA DE RESUMEN Y BÚSQUEDA / FILTROS ESTILO LINEAR/APPLE HEALTH ─── */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Card de Progreso & Resumen Ejecutivo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Widget 1: Indicador de Progreso en Tienda */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCheck className="w-4 h-4 text-[#006156]" />
                  Progreso Checklist
                </span>
                <span className="text-[#006156] font-extrabold text-sm">{overallProgressPercentage}%</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#006156] to-[#39ADA3] transition-all duration-500 rounded-full"
                  style={{ width: `${overallProgressPercentage}%` }}
                />
              </div>

              <p className="text-[11px] font-semibold text-slate-500">
                {totalCheckedItemsCount} de {totalItemsCount} productos listos en la tienda
              </p>
            </div>

            {/* Widget 2: Pedidos Por Comprar */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Por Comprar</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</p>
                <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Requiérense atencion en tienda</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>

            {/* Widget 3: Pedidos Comprados */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comprados</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{purchasedCount}</p>
                <p className="text-[11px] font-semibold text-[#006156] mt-0.5">Listos o despachados</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#e6f0ef] border border-[#39ADA3]/30 flex items-center justify-center text-[#006156] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filtros Segmentados + Buscador Rápido */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            
            {/* Tabs de Filtro de Estado */}
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center min-h-[38px] flex items-center justify-center gap-1.5 ${
                  statusFilter === 'All' 
                    ? 'bg-white text-[#006156] shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Todos</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 text-slate-700 font-black">
                  {requests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('Pendiente')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center min-h-[38px] flex items-center justify-center gap-1.5 ${
                  statusFilter === 'Pendiente' 
                    ? 'bg-[#006156] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>Por Comprar</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white font-black">
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('Comprado')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center min-h-[38px] flex items-center justify-center gap-1.5 ${
                  statusFilter === 'Comprado' 
                    ? 'bg-[#39ADA3] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Comprados</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white font-black">
                  {purchasedCount}
                </span>
              </button>
            </div>

            {/* Input de Búsqueda Rápida */}
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar insumo, solicitante o fecha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-[#006156] rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all min-h-[40px] shadow-2xs"
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

        </div>
      </section>

      {/* ─── 3. LISTADO DE PEDIDOS DE COMPRAS ─── */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-view-enter">
        
        {filteredRequests.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200/80 rounded-2xl p-8 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No se encontraron pedidos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay solicitudes de compras que coincidan con la búsqueda o el filtro seleccionado.
            </p>
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const orderNum = filteredRequests.length - idx;
            const isPending = req.status === 'Pendiente' || req.status === 'En revisión';
            const totalQty = req.items.reduce((acc, i) => acc + i.quantity, 0);

            // Checked items count for this order
            const checkedCountForOrder = req.items.filter((_, itemIdx) => checkedItems[`${req.id}-${itemIdx}`]).length;
            const orderIsComplete = checkedCountForOrder === req.items.length && req.items.length > 0;

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
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 hover:border-slate-300 transition-all"
              >
                
                {/* Cabecera del Pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  {/* Fecha y Solicitante */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-lg sm:text-xl tracking-tight">
                        <Calendar className="w-5 h-5 text-[#006156] shrink-0" />
                        <span>FECHA: {req.date}</span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-lg bg-[#e6f0ef] text-[#006156] text-xs font-black border border-[#39ADA3]/30">
                        Pedido N° {orderNum}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Solicitado por: <strong className="text-slate-900 font-extrabold">{req.user}</strong>
                      </span>
                      <span>•</span>
                      <span>{req.items.length} insumos requeridos</span>
                    </div>
                  </div>

                  {/* Badges de Estado y Checklist Progress */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    
                    {/* Progress pill */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#006156]" />
                      <span>{checkedCountForOrder} de {req.items.length} listos</span>
                    </div>

                    {/* Status badge */}
                    {isPending ? (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Por Comprar
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/40 text-xs font-extrabold uppercase flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#006156]" />
                        Comprado
                      </span>
                    )}

                  </div>

                </div>

                {/* Nota de Voz Adjunta */}
                {req.audioUrl && (
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#006156]">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#006156]" />
                        Instrucción en Nota de Voz de Cocina
                      </span>
                      <span className="text-[10px] bg-[#e6f0ef] text-[#006156] px-2.5 py-0.5 rounded-full font-bold border border-[#39ADA3]/30">
                        Audio Adjunto
                      </span>
                    </div>
                    <AudioPlayer 
                      audioUrl={req.audioUrl} 
                      duration={req.audioDuration}
                      label="Toca para escuchar instrucción del pedido"
                      className="w-full bg-white border-slate-200/80"
                    />
                  </div>
                )}

                {/* Motivo u Observación de Cocina */}
                {req.reason && (
                  <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-[#006156] space-y-1">
                    <p className="text-xs font-extrabold text-[#006156] uppercase tracking-wider">
                      Observación de Cocina:
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 italic">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>
                )}

                {/* Grupos de Compra Desplegables */}
                <div className="space-y-4 pt-1">
                  
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    <span>Grupos de Insumos</span>
                    <span className="text-[#006156] font-extrabold">Total: {totalQty} unidades</span>
                  </div>

                  {Object.entries(itemsByGrupo).map(([grupoName, itemsGroup], groupIdx) => {
                    const isMercado = grupoName.includes('Mercado');
                    const groupIcon = isMercado 
                      ? <ShoppingBag className="w-4 h-4 text-[#006156]" /> 
                      : <Store className="w-4 h-4 text-[#39ADA3]" />;
                    
                    const expanded = isGroupExpanded(req.id, grupoName);
                    
                    // Group checked count
                    const groupCheckedCount = itemsGroup.filter(item => {
                      const origIdx = req.items.findIndex(i => i.productName === item.productName);
                      return checkedItems[`${req.id}-${origIdx}`];
                    }).length;

                    return (
                      <div 
                        key={groupIdx} 
                        className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                      >
                        
                        {/* Cabecera Interactiva del Grupo */}
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(req.id, grupoName)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-extrabold text-xs tracking-wide transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                              {groupIcon}
                            </div>
                            <span className="text-slate-900 font-extrabold">{grupoName}</span>
                            
                            <span className="px-2 py-0.5 rounded-md bg-[#e6f0ef] text-[#006156] text-[11px] font-extrabold border border-[#39ADA3]/30">
                              {groupCheckedCount} / {itemsGroup.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                            <span>{expanded ? 'Ocultar' : 'Desplegar'}</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Lista del Checklist del Grupo */}
                        {expanded && (
                          <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {itemsGroup.map((item, itemIdx) => {
                              const originalItemIndex = req.items.findIndex(i => i.productName === item.productName);
                              const isChecked = checkedItems[`${req.id}-${originalItemIndex}`] || false;
                              const categoryName = getItemCategory(item.productName);

                              return (
                                <div 
                                  key={itemIdx}
                                  onClick={() => toggleItemCheck(req.id, originalItemIndex)}
                                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
                                    isChecked 
                                      ? 'bg-slate-50/70' 
                                      : 'hover:bg-slate-50/50'
                                  }`}
                                >
                                  {/* Checkbox + Nombre del Producto */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    
                                    {/* Touch Target 44px */}
                                    <div className="shrink-0 text-[#006156] min-h-[44px] min-w-[44px] flex items-center justify-center">
                                      {isChecked ? (
                                        <CheckSquare className="w-6 h-6 text-[#006156]" />
                                      ) : (
                                        <Square className="w-6 h-6 text-slate-300 hover:text-[#006156] transition-colors" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-extrabold text-sm sm:text-base transition-all ${
                                          isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                                        }`}>
                                          {item.productName}
                                        </span>
                                        
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border border-slate-200/60">
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

                                  {/* Pill de Cantidad */}
                                  <div className="shrink-0">
                                    <span className={`inline-block px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-xl border transition-all ${
                                      isChecked 
                                        ? 'bg-slate-100 text-slate-500 border-slate-200' 
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

                {/* Toolbar de Acciones del Pedido (Escritorio / Tablet) */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintRequest(req, orderNum)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px] border border-slate-200/60 active:scale-95"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Imprimir Hoja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(req, orderNum)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#e6f0ef] hover:bg-[#d5e7e5] text-[#006156] border border-[#39ADA3]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px] active:scale-95"
                    >
                      <Share2 className="w-4 h-4 text-[#006156]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => setConfirmModalOrder(req)}
                      className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
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

      {/* ─── 4. BARRA DE ACCIÓN FLOTANTE STICKY PARA CELULARES (Bottom Nav Táctil) ─── */}
      {filteredRequests.length > 0 && (
        <div className="fixed lg:hidden bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-lg z-40 flex items-center gap-2.5">
          {filteredRequests[0]?.status === 'Pendiente' && (
            <button
              type="button"
              onClick={() => setConfirmModalOrder(filteredRequests[0])}
              className="flex-1 py-3 px-4 rounded-xl bg-[#006156] active:bg-[#004d44] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-transform cursor-pointer min-h-[46px]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#39ADA3]" />
              <span>Marcar Comprado</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleShareWhatsApp(filteredRequests[0], filteredRequests.length)}
            className="py-3 px-4 rounded-xl bg-[#e6f0ef] text-[#006156] border border-[#39ADA3]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[46px]"
            title="Enviar pedido por WhatsApp"
          >
            <Share2 className="w-4 h-4 text-[#006156]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintRequest(filteredRequests[0], filteredRequests.length)}
            className="p-3 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer min-h-[46px] w-12"
            title="Imprimir Hoja de Compras"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}

      {/* ─── 5. MODAL DE CONFIRMACIÓN ELEGANTE HOSPITALARIO ─── */}
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
                className="flex-1 py-2.5 rounded-xl bg-[#006156] hover:bg-[#004d44] text-white font-extrabold text-xs shadow-xs transition-colors min-h-[42px] cursor-pointer"
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
