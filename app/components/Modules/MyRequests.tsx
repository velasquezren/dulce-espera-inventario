'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, EmptyState } from '../UI';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  RotateCw,
  Printer
} from 'lucide-react';
import { RequestItem } from '../../lib/mockData';

export default function MyRequests() {
  const { requests, refreshRequests, coordinators } = useApp();
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Record<string, string>>({});

  const handleSendWhatsApp = (req: RequestItem) => {
    const coordId = selectedCoordinator[req.id];
    if (!coordId) return;
    
    const coord = coordinators.find((c) => String(c.id) === String(coordId));
    if (!coord) return;
    
    const phone = coord.telefono;
    
    let message = `*DULCE ESPERA - SOLICITUD DE INSUMOS* 🏥🥣\n`;
    message += `----------------------------------------\n`;
    message += `Se ha registrado una nueva solicitud de insumos.\n\n`;
    message += `• *ID Solicitud:* ${req.id.toUpperCase()}\n`;
    message += `• *Fecha:* ${req.date}\n`;
    message += `• *Solicitado por:* ${req.user}\n\n`;
    
    message += `*Productos Solicitados:*\n`;
    req.items.forEach((item) => {
      message += `- ${item.productName}: *${item.quantity} ${item.unit}*\n`;
    });
    
    if (req.reason) {
      message += `\n*Motivo:* _"${req.reason}"_\n`;
    }
    
    const reportUrl = `https://107.172.193.34.nip.io/pedidos/${req.idPublico || req.id}/reporte`;
    message += `\n*Ver Reporte completo para imprimir:* \n${reportUrl}\n\n`;
    message += `Por favor, revise y proceda con la aprobación correspondiente en FileMaker.`;
    
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Calendar state
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView, selectedDate]);

  const toggleExpand = (id: string) => {
    setExpandedRequestId((prev) => (prev === id ? null : id));
  };

  // Filter requests for list view
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.items && req.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase())));
      
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar calculations
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const prefixDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Start on Monday

  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonthIdx + 1, 0).getDate();

  const cells: Array<{
    day: number;
    month: 'prev' | 'current' | 'next';
    dateString: string;
    isToday: boolean;
  }> = [];

  // Trailing days from previous month
  for (let i = prefixDays - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = prevMonthIdx + 1;
    const y = prevMonthYear;
    cells.push({
      day: d,
      month: 'prev',
      dateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isToday: false
    });
  }

  // Today marker
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      month: 'current',
      dateString,
      isToday: dateString === todayString
    });
  }

  // Leading days from next month
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextDaysCount = 42 - cells.length;
  for (let d = 1; d <= nextDaysCount; d++) {
    cells.push({
      day: d,
      month: 'next',
      dateString: `${nextMonthYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isToday: false
    });
  }

  // Monthly stats
  const monthlyRequests = requests.filter((req) => {
    const parts = req.date.split(' ')[0].split('-');
    if (parts.length < 2) return false;
    return parseInt(parts[0]) === currentYear && (parseInt(parts[1]) - 1) === currentMonth;
  });

  const totalMonthly = monthlyRequests.length;
  const pendingMonthly = monthlyRequests.filter((r) => r.status === 'Pendiente' || r.status === 'En revisión').length;
  const approvedMonthly = monthlyRequests.filter((r) => r.status === 'Aprobado' || r.status === 'Comprado' || r.status === 'Entregado').length;

  const selectedRequests = requests.filter((r) => r.date.split(' ')[0] === selectedDate);

  // Render a mini request card optimized for the compact sidebar details panel
  const renderMiniRequestCard = (req: RequestItem) => {
    const isExpanded = expandedRequestId === req.id;
    const totalProducts = req.items ? req.items.length : 0;
    
    // Status colors for left accent bar
    const statusConfig = {
      Cancelado: { bar: 'bg-rose-500', text: 'text-rose-600 bg-rose-50' },
      Pendiente: { bar: 'bg-amber-500', text: 'text-amber-600 bg-amber-50' },
      'En revisión': { bar: 'bg-amber-500', text: 'text-amber-600 bg-amber-50' },
      Aprobado: { bar: 'bg-emerald-500', text: 'text-emerald-600 bg-emerald-50' },
      Comprado: { bar: 'bg-emerald-500', text: 'text-emerald-600 bg-emerald-50' },
      Entregado: { bar: 'bg-emerald-500', text: 'text-emerald-600 bg-emerald-50' },
    };
    
    const config = statusConfig[req.status as keyof typeof statusConfig] || { bar: 'bg-slate-400', text: 'text-slate-600 bg-slate-50' };
    
    // Extract only the time if available
    const timeStr = req.date.includes(' ') ? req.date.split(' ')[1] : req.date;

    return (
      <div
        key={req.id}
        onClick={() => toggleExpand(req.id)}
        className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-clinical-sm hover:border-slate-300 transition-all cursor-pointer flex relative"
      >
        {/* Left Status Vertical Accent Bar */}
        <div className={`w-1.5 ${config.bar} shrink-0`} />

        {/* Content Area */}
        <div className="flex-1 p-3.5 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
              Nº {req.id}
            </span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${config.text} uppercase tracking-wider`}>
              {req.status}
            </span>
          </div>

          {/* User and Time info */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 gap-2 flex-wrap">
            <span className="truncate">Por: {req.user}</span>
            <span className="shrink-0 text-slate-400 font-bold">{timeStr}</span>
          </div>

          {/* Product count and collapse toggle */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#f8fafc]">
            <span className="text-xs font-bold text-slate-700">
              {totalProducts} {totalProducts === 1 ? 'producto solicitado' : 'productos solicitados'}
            </span>
            <div className="text-slate-400">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-primary" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && req.items && (
            <div className="pt-2.5 mt-2.5 border-t border-[#f1f5f9] space-y-2 animate-view-enter text-xs text-slate-600">
              {req.reason && (
                <div className="p-2 bg-primary-light/50 border border-slate-100 rounded text-[11px] text-primary italic leading-normal mb-2">
                  &ldquo;{req.reason}&rdquo;
                </div>
              )}
              <div className="space-y-1.5 pl-1">
                {req.items.map((item, idx: number) => (
                  <div key={`${item.productId}-${idx}`} className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-slate-700 break-words">
                      • {item.productName}
                    </span>
                    <span className="shrink-0 font-extrabold text-slate-500 text-[11px]">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#f1f5f9] flex justify-end" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`https://107.172.193.34.nip.io/pedidos/${req.idPublico || req.id}/reporte`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-primary transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Ver Reporte Imprimible
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a reusable request card
  const renderRequestCard = (req: RequestItem) => {
    const isExpanded = expandedRequestId === req.id;
    const totalProducts = req.items ? req.items.length : 0;

    return (
      <Card
        key={req.id}
        className="p-0 border overflow-hidden hover:border-slate-300 transition-all cursor-pointer shadow-clinical-sm"
        onClick={() => toggleExpand(req.id)}
      >
        {/* Header (Summary) */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Lista Nº: {req.id}
              </span>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {req.date.split(' ').reverse().join(' ')}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug">
              Solicitud de Cocina
            </h3>

            <div className="text-xs font-bold text-slate-500">
              Productos solicitados:{' '}
              <span className="text-primary font-extrabold">{totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}</span>
            </div>
          </div>

          <div className="flex items-center sm:justify-end gap-3.5 border-t border-[#f1f5f9] sm:border-t-0 pt-3 sm:pt-0">
            <div className="flex flex-col items-start sm:items-end gap-1">
              <Badge type="request" value={req.status} />
              <span className="text-[10px] text-slate-400 font-bold tracking-wide">
                Por: {req.user}
              </span>
            </div>
            <div className="text-slate-400">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Details */}
        {isExpanded && req.items && (
          <div className="border-t border-[#f1f5f9] bg-slate-50/50 p-4 space-y-3.5 animate-view-enter">
            <h4 className="text-xs font-bold text-primary tracking-wider uppercase">
              Detalle de Productos Solicitados:
            </h4>
            
            {req.reason && (
              <div className="p-3.5 bg-primary-light border border-slate-200 rounded-lg text-xs text-primary leading-relaxed">
                <span className="font-black block text-primary mb-1 uppercase tracking-wide text-[10px]">Motivo / Comentario:</span>
                &ldquo;{req.reason}&rdquo;
              </div>
            )}
            
            <div className="divide-y divide-[#f1f5f9] bg-white border border-[#e2e8f0]/60 rounded-lg overflow-hidden">
              {req.items.map((item, idx: number) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="p-3.5 flex flex-col gap-2 text-sm"
                >
                  {/* Row 1: Product Name & Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="font-extrabold text-slate-800 leading-snug break-words">
                      {item.productName}
                    </span>
                    <div className="shrink-0 pt-0.5">
                      <Badge type="request" value={req.status} />
                    </div>
                  </div>

                  {/* Row 2: Quantity & Notes */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-[#f8fafc] text-xs">
                    <div className="font-semibold text-slate-500">
                      Cantidad:{' '}
                      <span className="text-slate-800 font-extrabold">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-slate-400 italic max-w-xs break-words">
                        <span className="font-bold text-slate-500 not-italic mr-1">Obs:</span>
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp & Print Actions Panel */}
            <div className="mt-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-3.5" onClick={(e) => e.stopPropagation()}>
              <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                Enviar Reporte a Coordinador (WhatsApp)
              </h5>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={selectedCoordinator[req.id] || ''}
                  onChange={(e) => setSelectedCoordinator({ ...selectedCoordinator, [req.id]: e.target.value })}
                  className="bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-w-[200px]"
                >
                  <option value="">-- Seleccionar Coordinador --</option>
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.telefono})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSendWhatsApp(req)}
                  disabled={!selectedCoordinator[req.id]}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all shadow-clinical-sm active:scale-98 tap-bounce cursor-pointer shrink-0 ${
                    selectedCoordinator[req.id] 
                      ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-clinical-md' 
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  Enviar WhatsApp
                </button>
                <a
                  href={`https://107.172.193.34.nip.io/pedidos/${req.idPublico || req.id}/reporte`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-lg font-bold text-sm text-slate-700 transition-all active:scale-98 tap-bounce cursor-pointer shadow-clinical-sm shrink-0"
                >
                  <Printer className="w-4.5 h-4.5 text-primary" />
                  Imprimir / Reporte
                </a>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2.5 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <span>Mis Solicitudes</span>
            <button 
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`p-0.5 rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center justify-center tap-bounce shrink-0 ${
                showHelp ? 'text-primary bg-primary-light' : 'text-slate-400 hover:text-primary hover:bg-slate-100'
              }`}
              aria-label="Ayuda"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={refreshRequests}
              className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors focus:outline-none cursor-pointer inline-flex items-center justify-center tap-bounce"
              title="Actualizar pedidos"
              aria-label="Actualizar"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </h1>
          {showHelp && (
            <div className="p-4 bg-primary-light border border-primary/10 rounded-xl animate-view-enter text-xs text-primary leading-relaxed shadow-clinical-sm">
              <p className="font-semibold text-primary">Sobre esta página</p>
              <p className="mt-1 text-primary-hover font-semibold">
                Historial cronológico de tus listas de insumos enviadas a Gobernación.
              </p>
            </div>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeView === 'calendar'
                ? 'bg-white text-primary shadow-clinical-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendario
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeView === 'list'
                ? 'bg-white text-primary shadow-clinical-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* VIEW 1: CHRONOLOGICAL LIST */}
      {activeView === 'list' && (
        <div className="space-y-6">
          {/* Filters Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-4 flex flex-col sm:flex-row gap-3 shadow-clinical-sm">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
              <input
                type="text"
                placeholder="Buscar por Nº de lista o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] placeholder-[#94a3b8] transition-all focus:border-primary outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="sm:w-48 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] font-semibold bg-white outline-none focus:border-primary cursor-pointer appearance-none animate-none"
              >
                <option value="All">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En revisión">En revisión</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Comprado">Comprado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No hay solicitudes"
              description="No se encontraron listas con los filtros aplicados en este momento."
              icon={<ClipboardList className="w-12 h-12 text-secondary stroke-1" />}
            />
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map(renderRequestCard)}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CALENDAR */}
      {activeView === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar Controller (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Monthly Analytics Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white border border-[#e2e8f0] p-2 sm:p-4 rounded-2xl shadow-clinical-sm flex flex-col justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Solicitudes del Mes</span>
                  <span className="sm:hidden">Total Mes</span>
                </span>
                <span className="text-lg sm:text-xl font-black text-primary mt-1">{totalMonthly}</span>
              </div>
              <div className="bg-white border border-[#e2e8f0] p-2 sm:p-4 rounded-2xl shadow-clinical-sm flex flex-col justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Aprobadas / Entregadas</span>
                  <span className="sm:hidden">Aprobadas</span>
                </span>
                <span className="text-lg sm:text-xl font-black text-secondary mt-1">{approvedMonthly}</span>
              </div>
              <div className="bg-white border border-[#e2e8f0] p-2 sm:p-4 rounded-2xl shadow-clinical-sm flex flex-col justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendientes</span>
                <span className="text-lg sm:text-xl font-black text-amber-500 mt-1">{pendingMonthly}</span>
              </div>
            </div>

            {/* Main Calendar Body */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-clinical-sm overflow-hidden p-2.5 sm:p-6 space-y-4">
              
              {/* Calendar Navigator Header */}
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary stroke-[1.8]" />
                  <span>{monthNames[currentMonth]} {currentYear}</span>
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors active:scale-95"
                    title="Mes Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors active:scale-95"
                    title="Mes Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-1">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 text-center border-b border-slate-100 pb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                    <span key={idx} className="text-[10px] sm:text-[11px] font-black text-slate-400 tracking-wider">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
                  {cells.map((cell, idx) => {
                    const dayRequests = requests.filter((r) => r.date.split(' ')[0] === cell.dateString);
                    const hasRequests = dayRequests.length > 0;
                    const isSelected = selectedDate === cell.dateString;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(cell.dateString)}
                        className={`
                          w-full h-[46px] sm:h-auto sm:aspect-square rounded-lg sm:rounded-xl flex flex-col justify-between p-1 sm:p-1.5 border transition-all text-left relative focus:outline-none cursor-pointer
                          ${isSelected
                            ? 'bg-[#e6f0ef] border-primary border-2 text-slate-800 shadow-sm'
                            : cell.isToday
                              ? 'bg-slate-50 border-[#39ADA3] text-slate-800 font-bold'
                              : cell.month !== 'current'
                                ? 'bg-slate-100/40 border-slate-100/50 text-slate-400 hover:bg-slate-100/80' 
                                : 'bg-slate-50/50 border-slate-100/70 hover:bg-slate-50 text-slate-700'
                          }
                        `}
                      >
                        {/* Day Number */}
                        <span className={`text-[10px] sm:text-xs font-extrabold ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                          {cell.day}
                        </span>

                        {/* Request indicators / dot accumulation */}
                        {hasRequests && (
                          <div className="flex flex-wrap gap-0.5 sm:gap-1 max-w-full">
                            {dayRequests.slice(0, 3).map((req, reqIdx) => {
                              const dotColor = 
                                req.status === 'Cancelado' 
                                  ? 'bg-rose-500' 
                                  : (req.status === 'Pendiente' || req.status === 'En revisión')
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500';
                              return (
                                <div 
                                  key={reqIdx} 
                                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${dotColor}`}
                                  title={`${req.id}: ${req.status}`}
                                />
                              );
                            })}
                            {dayRequests.length > 3 && (
                              <span className="text-[6px] sm:text-[7px] font-black text-slate-400 leading-none">
                                +{dayRequests.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Selected Date Details Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {!selectedDate ? (
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl text-center py-16 text-slate-400 shadow-clinical-sm flex flex-col items-center justify-center gap-3">
                <CalendarIcon className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">Ver Detalles del Día</h4>
                  <p className="text-xs text-slate-400 font-semibold max-w-[200px] mx-auto">
                    Selecciona un día activo del calendario para ver la lista de solicitudes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Panel Title */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Seleccionada</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {selectedDate.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full shrink-0">
                    {selectedRequests.length} {selectedRequests.length === 1 ? 'Lista' : 'Listas'}
                  </span>
                </div>

                {/* Day's requests results */}
                {selectedRequests.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center py-12 text-slate-400 text-xs font-bold shadow-clinical-sm">
                    No hay solicitudes registradas en esta fecha.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {selectedRequests.map(renderMiniRequestCard)}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
