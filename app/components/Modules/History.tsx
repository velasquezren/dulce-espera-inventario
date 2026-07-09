'use client';

import React, { useState } from 'react';
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

  // Filter logs
  const filteredLogs = history.filter((log) => {
    const matchesSearch = log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    
    const matchesDate = !dateFilter || log.date.startsWith(dateFilter);

    return matchesSearch && matchesType && matchesDate;
  });

  const handleExportPDF = () => {
    exportToPDF(filteredLogs, 'Bitacora de Movimientos - Cocina');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredLogs, 'Bitacora de Movimientos - Cocina');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Recepción':
        return <ArrowDownCircle className="w-5 h-5 text-emerald-600" />;
      case 'Entrada':
        return <ArrowDownCircle className="w-5 h-5 text-emerald-600" />;
      case 'Salida':
        return <ArrowUpCircle className="w-5 h-5 text-rose-500" />;
      case 'Solicitud':
        return <ClipboardList className="w-5 h-5 text-[#39ADA3]" />;
      default:
        return <HistoryIcon className="w-5 h-5 text-slate-500" />;
    }
  };

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
            {filteredLogs.map((log, idx) => (
              <div 
                key={`${log.id}-${idx}`} 
                className="p-4 md:px-6 md:py-4 hover:bg-slate-50/50 flex flex-col md:grid md:grid-cols-5 gap-2 md:gap-4 md:items-center text-sm"
              >
                {/* Date */}
                <div className="text-xs text-slate-400 font-semibold md:text-slate-500">
                  {log.date.split(' ').reverse().join(' ')}
                </div>

                {/* Product */}
                <div className="font-extrabold text-slate-800 tracking-tight">
                  {log.productName}
                </div>

                {/* Type */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  {getTypeIcon(log.type)}
                  <span>{log.type}</span>
                </div>

                {/* Quantity */}
                <div className="font-bold text-slate-700">
                  {log.quantity} {log.unit}
                </div>

                {/* User / Remarks */}
                <div className="text-xs font-semibold text-slate-400 md:text-slate-500">
                  Por: {log.user}
                  <span className="block text-[10px] text-slate-400 italic font-medium">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
