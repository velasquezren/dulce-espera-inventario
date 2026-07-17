'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmModal, EmptyState, Portal } from '../UI';
import {
  Check,
  HelpCircle,
  Package,
  Calendar,
  User,
  Search,
  RotateCw,
  Truck,
  ShoppingCart,
  ClipboardCheck,
  Clock,
  Hash,
  BoxIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useToast } from '../UI';

type OriginalStatus = 'Aceptado' | 'Comprado' | 'En revisión';

export default function Reception() {
  const { receptions, confirmReception, requests, refreshRequests } = useApp();
  const { showToast } = useToast();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OriginalStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [selectedId]);

  const pendingReceptions = receptions.filter((r) => r.status === 'Pendiente');

  // Enrich receptions with original request status
  const enrichedReceptions = useMemo(() => {
    return pendingReceptions.map((rec) => {
      const originalReq = requests.find(
        (r) => (r.idPublico || r.id) === rec.id
      );
      return {
        ...rec,
        originalStatus: (originalReq?.status || 'Aceptado') as OriginalStatus,
        reason: originalReq?.reason || '',
      };
    });
  }, [pendingReceptions, requests]);

  // Filter
  const filteredReceptions = useMemo(() => {
    return enrichedReceptions.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.items.some((p) =>
          p.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        statusFilter === 'all' || item.originalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedReceptions, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalPedidos = pendingReceptions.length;
    const totalInsumos = pendingReceptions.reduce(
      (acc, r) => acc + r.items.length,
      0
    );
    const totalUnidades = pendingReceptions.reduce(
      (acc, r) =>
        acc + r.items.reduce((s, item) => s + item.quantity, 0),
      0
    );
    return { totalPedidos, totalInsumos, totalUnidades };
  }, [pendingReceptions]);

  // Status tab counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enrichedReceptions.length };
    enrichedReceptions.forEach((r) => {
      counts[r.originalStatus] = (counts[r.originalStatus] || 0) + 1;
    });
    return counts;
  }, [enrichedReceptions]);

  const handleOpenConfirm = (id: string) => {
    setConfirmId(id);
  };

  const handleCloseConfirm = () => {
    setConfirmId(null);
  };

  const handleConfirm = async () => {
    if (!confirmId) return;

    setIsConfirming(true);
    try {
      await confirmReception(confirmId);
      showToast('Pedido recibido en cocina con éxito', 'success');
      if (selectedId === confirmId) setSelectedId(null);
    } catch {
      showToast('Error al confirmar recepción', 'error');
    } finally {
      setIsConfirming(false);
      setConfirmId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRequests();
      showToast('Recepciones actualizadas', 'success');
    } catch {
      showToast('Error al actualizar', 'error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const getStatusConfig = (status: OriginalStatus) => {
    switch (status) {
      case 'Comprado':
        return {
          bg: 'bg-sky-50 border-sky-200',
          text: 'text-sky-700',
          dot: 'bg-sky-400',
          icon: <ShoppingCart className="w-3 h-3" />,
          label: 'Comprado',
        };
      case 'Aceptado':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Aceptado',
        };
      case 'En revisión':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-700',
          dot: 'bg-amber-400',
          icon: <Clock className="w-3 h-3" />,
          label: 'En revisión',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-600',
          dot: 'bg-slate-400',
          icon: <AlertCircle className="w-3 h-3" />,
          label: status,
        };
    }
  };

  const statusTabs: Array<{ key: 'all' | OriginalStatus; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'Comprado', label: 'Comprado' },
    { key: 'Aceptado', label: 'Aceptado' },
    { key: 'En revisión', label: 'En revisión' },
  ];

  // Currently viewed reception details
  const activeDetail = useMemo(() => {
    return enrichedReceptions.find((r) => r.id === selectedId);
  }, [enrichedReceptions, selectedId]);

  // Selected reception for confirm modal
  const selectedReception = useMemo(() => {
    return receptions.find((r) => r.id === confirmId);
  }, [receptions, confirmId]);

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-[1200px] mx-auto pb-24 md:pb-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#006156] flex items-center gap-2">
            <span>Recepciones de Pedido</span>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`p-0.5 rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center justify-center tap-bounce shrink-0 ${
                showHelp
                  ? 'text-primary bg-primary-light'
                  : 'text-slate-400 hover:text-primary hover:bg-slate-100'
              }`}
              aria-label="Ayuda"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            Confirma el ingreso de pedidos completos a la cocina
          </p>

          {showHelp && (
            <div className="p-4 bg-primary-light border border-primary/10 rounded-xl animate-view-enter text-xs text-primary leading-relaxed shadow-clinical-sm mt-2">
              <p className="font-semibold text-primary">Sobre esta página</p>
              <p className="mt-1 text-primary-hover font-semibold">
                Aquí puedes confirmar la llegada de pedidos a cocina. Solo aparecen los pedidos con estado
                <strong> Aceptado</strong>, <strong>Comprado</strong> o <strong>En revisión</strong>.
                Toca cualquier tarjeta de pedido para abrir su detalle y confirmar la entrega.
              </p>
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 shrink-0 self-start"
        >
          <RotateCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>

      {/* ─── Stats Cards (HIDDEN ON MOBILE) ─── */}
      {pendingReceptions.length > 0 && (
        <div className="hidden sm:grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-clinical-sm flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              {stats.totalPedidos}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Pedidos
            </span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-clinical-sm flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              {stats.totalInsumos}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Insumos
            </span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-clinical-sm flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <BoxIcon className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              {stats.totalUnidades}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Unidades
            </span>
          </div>
        </div>
      )}

      {/* ─── Search + Filter Bar ─── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-clinical-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Buscar por solicitante, producto o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 transition-all duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none font-medium"
          />
        </div>

        {/* Status Filter Tabs (Horizontal Scroll on Mobile) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-hide">
          {statusTabs.map((tab) => {
            const count = statusCounts[tab.key] || 0;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`shrink-0 h-8 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ─── */}
      {filteredReceptions.length === 0 ? (
        <EmptyState
          title={
            pendingReceptions.length === 0
              ? 'Sin recepciones pendientes'
              : 'Sin resultados'
          }
          description={
            pendingReceptions.length === 0
              ? 'Todos los pedidos e insumos programados han sido confirmados y recibidos.'
              : 'No se encontraron pedidos que coincidan con tu búsqueda o filtro.'
          }
          icon={
            pendingReceptions.length === 0 ? (
              <Check className="w-12 h-12 text-[#39ADA3] stroke-[3]" />
            ) : (
              <Search className="w-12 h-12 text-[#39ADA3] stroke-[1.5]" />
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReceptions.map((item) => {
            const statusCfg = getStatusConfig(item.originalStatus);
            const totalUnits = item.items.reduce(
              (acc, p) => acc + p.quantity,
              0
            );

            return (
              <Card
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className="border border-slate-200/80 hover:border-slate-300 shadow-clinical-sm transition-all duration-200 bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:shadow-clinical-md hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="space-y-3">
                  {/* Top row: Status + Date */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date.split('-').reverse().join('/')}
                    </span>
                  </div>

                  {/* Solicitante */}
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 tracking-tight">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{item.solicitante}</span>
                  </h3>

                  {/* ID + Counts */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      <Hash className="w-2.5 h-2.5" />
                      {item.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-extrabold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/10 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {item.items.length} insumo
                      {item.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {totalUnits} uds
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] font-extrabold text-primary">
                  <span>Ver insumos y recibir</span>
                  <Truck className="w-4 h-4 text-primary animate-pulse" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: DETALLES DE RECEPCIÓN ─── */}
      {selectedId && activeDetail && (
        <Portal>
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-clinical-lg w-full max-w-md overflow-hidden flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[85dvh] animate-view-enter">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="text-sm font-black text-[#006156] uppercase tracking-wide flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Recepción de Pedido
              </h3>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Summary */}
            <div className="p-4 bg-white border-b border-slate-100 space-y-2 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-md tracking-wide">
                  ID: #{activeDetail.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {activeDetail.date.split('-').reverse().join('/')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {activeDetail.solicitante.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-tight">
                    {activeDetail.solicitante}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Solicitante</span>
                </div>
              </div>
            </div>

            {/* Insumos List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Lista de Insumos ({activeDetail.items.length})
              </span>
              <div className="space-y-1.5">
                {activeDetail.items.map((prod, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 text-xs ${
                      idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-extrabold text-slate-700 truncate">
                        {prod.productName}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        Insumo #{idx + 1} • Unidad: {prod.unit}
                      </span>
                    </div>
                    <span className="font-black text-primary bg-primary-light/60 px-2.5 py-1 rounded-lg text-[11px] shrink-0">
                      {prod.quantity} {prod.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reason */}
              {activeDetail.reason && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Motivo / Justificación
                  </p>
                  <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                    &ldquo;{activeDetail.reason}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Confirm Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                <span>Total insumos: {activeDetail.items.length}</span>
                <span>Unidades: {activeDetail.items.reduce((acc, p) => acc + p.quantity, 0)} uds</span>
              </div>
              <Button
                variant="primary"
                onClick={() => handleOpenConfirm(activeDetail.id)}
                className="w-full font-bold h-11 text-xs tracking-wide bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <ClipboardCheck className="w-4.5 h-4.5 stroke-[2]" />
                Confirmar Recepción Completa
              </Button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* ─── Confirmation Modal ─── */}
      <ConfirmModal
        isOpen={confirmId !== null}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        title="Confirmar Recepción de Mercancía"
        message={`¿Confirmas que has recibido todos los insumos del pedido de ${selectedReception?.solicitante}? Se registrará el ingreso de inmediato en cocina.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isConfirming={isConfirming}
      />
    </div>
  );
}
