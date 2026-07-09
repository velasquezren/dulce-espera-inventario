'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, EmptyState } from '../UI';
import { ClipboardList, Search, Clock, CheckCircle } from 'lucide-react';

export default function MyRequests() {
  const { requests } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#006156]">Mis Solicitudes</h1>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Historial y estado de tus pedidos y requisiciones de cocina.
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-4 flex flex-col sm:flex-row gap-3 shadow-[0_2px_8px_rgba(0,97,86,0.01)]">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Buscar por producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] placeholder-[#94a3b8] transition-all duration-150 focus:border-[#006156] outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div className="sm:w-48 relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] font-semibold bg-white outline-none focus:border-[#006156] cursor-pointer appearance-none"
          >
            <option value="All">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Comprado">Comprado</option>
            <option value="En camino">En camino</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Requests list */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No hay solicitudes"
          description="No se encontraron solicitudes con los filtros aplicados en este momento."
          icon={<ClipboardList className="w-12 h-12 text-[#39ADA3] stroke-1" />}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="p-4 hover:border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left Side: Product details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      ID: #{req.id}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {req.date.split(' ').reverse().join(' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
                    {req.productName}
                  </h3>

                  <div className="text-xs text-slate-500 font-semibold">
                    Cantidad solicitada: <span className="font-bold text-slate-700">{req.quantity} {req.unit}</span>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 p-2 rounded-md mt-1 select-none">
                      <span className="font-bold text-slate-500">Nota:</span> &ldquo;{req.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right Side: Status Badge & Requester info */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t border-[#f1f5f9] sm:border-t-0 pt-3 sm:pt-0">
                  <Badge type="request" value={req.status} />
                  
                  <span className="text-[10px] text-slate-400 font-bold block mt-1 tracking-wide">
                    Por: {req.user}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
