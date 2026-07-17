'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, EmptyState } from '../UI';
import { 
  History as HistoryIcon, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ClipboardList, 
  FileText,
  Download,
  HelpCircle
} from 'lucide-react';

export default function History() {
  const { history, exportToPDF, exportToExcel } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showHelp, setShowHelp] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Reset pagination to page 1 when any filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, dateFilter, itemsPerPage]);

  // Filter logs using useMemo for optimization
  const filteredLogs = useMemo(() => {
    return history.filter((log) => {
      const matchesSearch = log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || log.type === typeFilter;
      
      const matchesDate = !dateFilter || log.date.startsWith(dateFilter);

      return matchesSearch && matchesType && matchesDate;
    });
  }, [history, searchQuery, typeFilter, dateFilter]);

  // Pagination variables
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, startIndex, endIndex]);

  const handleExportPDF = () => {
    exportToPDF(filteredLogs, 'Bitacora de Movimientos - Cocina');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredLogs, 'Bitacora de Movimientos - Cocina');
  };

  // Helper to get formatted date
  const formatDate = (dateStr: string) => {
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart) return dateStr;
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      const formattedTime = timePart ? timePart.slice(0, 5) : ''; // HH:MM
      return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
    }
    return dateStr;
  };

  // Helper to render type badge (with color and icon)
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Recepción':
      case 'Entrada':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100/80">
            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{type}</span>
          </span>
        );
      case 'Salida':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-100/80">
            <ArrowUpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{type}</span>
          </span>
        );
      case 'Solicitud':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-100/80">
            <ClipboardList className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>{type}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
            <HistoryIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{type}</span>
          </span>
        );
    }
  };

  // Page navigation logic
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = startPage + 4;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - 4;
      }
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2.5 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#006156] flex items-center gap-2">
            <span>Historial de Movimientos</span>
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
          </h1>
          {showHelp && (
            <div className="p-4 bg-primary-light border border-primary/10 rounded-xl animate-view-enter text-xs text-primary leading-relaxed shadow-clinical-sm">
              <p className="font-semibold text-primary">Sobre esta página</p>
              <p className="mt-1 text-primary-hover font-semibold">
                Bitácora de entradas, salidas, solicitudes y recepciones de almacén.
              </p>
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none h-11 px-4 text-xs font-bold"
            disabled={filteredLogs.length === 0}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none h-11 px-4 text-xs font-bold"
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-[0_2px_8px_rgba(0,97,86,0.01)]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Buscar por insumo o usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] placeholder-[#94a3b8] transition-all duration-150 focus:border-[#006156] outline-none"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] font-semibold bg-white outline-none focus:border-[#006156] cursor-pointer appearance-none"
          >
            <option value="All">Todos los Movimientos</option>
            <option value="Recepción">Recepciones de Compra</option>
            <option value="Salida">Egresos / Consumos</option>
            <option value="Solicitud">Solicitudes Creadas</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-[#cbd5e1] text-sm text-slate-700 font-semibold bg-white outline-none focus:border-[#006156]"
          />
        </div>
      </div>

      {/* History log timeline */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="Sin registros en bitácora"
          description="No se registran movimientos que coincidan con la búsqueda actual."
          icon={<HistoryIcon className="w-12 h-12 text-[#39ADA3] stroke-1" />}
        />
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,97,86,0.01)]">
          {/* Table Header for larger screens, cards on mobile */}
          <div className="hidden md:grid grid-cols-5 bg-[#f8fafc] border-b border-[#cbd5e1]/40 px-6 py-3.5 text-xs font-bold text-[#006156] uppercase tracking-wide">
            <div>Fecha</div>
            <div>Producto</div>
            <div>Tipo Movimiento</div>
            <div>Cantidad / Medida</div>
            <div>Responsable / Detalle</div>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {paginatedLogs.map((log, idx) => (
              <div 
                key={`${log.id}-${idx}`} 
                className="p-4 md:px-6 md:py-4 hover:bg-slate-50/50 flex flex-col md:grid md:grid-cols-5 gap-2 md:gap-4 md:items-center text-sm"
              >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-start justify-between gap-2 w-full">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="font-extrabold text-slate-800 text-sm leading-snug break-words pr-2">
                      {log.productName}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(log.type)}
                      <span className="text-[11px] text-slate-400 font-bold">{formatDate(log.date)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      Por: <span className="text-slate-700 font-bold">{log.user}</span>
                      <span className="block text-[10px] text-slate-400 italic font-medium mt-0.5">{log.status}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xs text-primary bg-primary-light px-2.5 py-1.5 rounded-xl border border-primary/5 shadow-sm">
                      {log.quantity} {log.unit}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block text-xs text-slate-500 font-semibold">
                  {formatDate(log.date)}
                </div>

                <div className="hidden md:block font-extrabold text-slate-800 tracking-tight truncate pr-2" title={log.productName}>
                  {log.productName}
                </div>

                <div className="hidden md:block">
                  {getTypeBadge(log.type)}
                </div>

                <div className="hidden md:block font-extrabold text-slate-700">
                  {log.quantity} {log.unit}
                </div>

                <div className="hidden md:block text-xs font-semibold text-slate-500">
                  <span className="font-bold text-slate-700 block truncate" title={log.user}>{log.user}</span>
                  <span className="text-[10px] text-slate-400 italic font-medium block truncate" title={log.status}>{log.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#f8fafc] border-t border-[#cbd5e1]/40 text-xs text-slate-500 font-semibold">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
                <div>
                  Mostrando <span className="font-bold text-slate-700">{startIndex + 1}</span> a{' '}
                  <span className="font-bold text-slate-700">{Math.min(endIndex, filteredLogs.length)}</span> de{' '}
                  <span className="font-bold text-slate-700">{filteredLogs.length}</span> registros
                </div>
                
                <div className="flex items-center gap-1.5 justify-center">
                  <span>Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="h-7 px-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold focus:border-[#006156] outline-none cursor-pointer text-[11px] hover:border-slate-300 transition-colors"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors font-bold disabled:cursor-not-allowed text-[11px]"
                >
                  Anterior
                </button>
                {pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors font-bold disabled:cursor-not-allowed text-[11px]"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
