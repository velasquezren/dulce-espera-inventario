'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../UI';
import { 
  Printer, 
  Download, 
  Share2, 
  FileText, 
  AlertCircle, 
  Check, 
  Search,
  User,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Package,
  Clock,
  ArrowUpDown,
  X,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';

/* ────────────────────── types ────────────────────── */
type SortKey = 'date' | 'user' | 'items' | 'status';
type SortDir = 'asc' | 'desc';

/* ────────────────────── component ────────────────────── */
export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();

  /* selection */
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');

  /* search / filter / sort */
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ui */
  const [canShare, setCanShare] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!(navigator as any).share) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setCanShare(true);
    }
  }, []);

  /* derived data */
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId);
  const selectedCoord = coordinators.find((c) => String(c.id) === String(selectedCoordId));

  /* unique statuses for filter */
  const uniqueStatuses = useMemo(() => {
    const set = new Set(requests.map(r => r.status));
    return Array.from(set);
  }, [requests]);

  /* filtered + sorted requests */
  const processedRequests = useMemo(() => {
    let list = [...requests];

    // status filter
    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter);
    }

    // search filter
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      list = list.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        (r.reason || '').toLowerCase().includes(q) ||
        r.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }

    // sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'user': cmp = a.user.localeCompare(b.user); break;
        case 'items': cmp = a.items.length - b.items.length; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [requests, statusFilter, searchOrderQuery, sortKey, sortDir]);

  /* toggle sort */
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  /* ─── WhatsApp message ─── */
  const generateMessage = () => {
    if (!selectedReq) return '';
    let msg = `*DULCE ESPERA - SOLICITUD DE INSUMOS* 🏥🥣\n`;
    msg += `----------------------------------------\n`;
    msg += `Se ha registrado una nueva solicitud de insumos.\n\n`;
    msg += `• *ID Solicitud:* ${selectedReq.id.toUpperCase()}\n`;
    msg += `• *Fecha:* ${selectedReq.date}\n`;
    msg += `• *Solicitado por:* ${selectedReq.user}\n\n`;
    msg += `*Productos Solicitados:*\n`;
    selectedReq.items.forEach((item) => {
      msg += `- ${item.productName}: *${item.quantity} ${item.unit}*\n`;
    });
    if (selectedReq.reason) {
      msg += `\n*Motivo:* _"${selectedReq.reason}"_\n`;
    }
    const reportUrl = `https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`;
    const adminReportUrl = `https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte-admin`;
    msg += `\n*Ver Reporte Cocina:* \n${reportUrl}\n`;
    msg += `*Ver Reporte Compras (Organizado por Grupo):* \n${adminReportUrl}\n\n`;
    msg += `Por favor, revise y proceda con la aprobación correspondiente en FileMaker.`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    if (!selectedReq || !selectedCoord) return;
    const phone = selectedCoord.telefono;
    const text = generateMessage();
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (!selectedReq) return;
    try {
      await navigator.share({
        title: `Solicitud de Insumos - Lista ${selectedReq.id.toUpperCase()}`,
        text: generateMessage(),
        url: `https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`
      });
    } catch { /* user cancelled */ }
  };

  /* ─── Print PDF ─── */
  const handlePrintLocalPDF = () => {
    if (!selectedReq) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalUnits = selectedReq.items.reduce((sum, i) => sum + i.quantity, 0);

    const rowsHtml = selectedReq.items.map((item, idx) => `
      <tr style="${idx % 2 === 0 ? '' : 'background:#f8fafb;'}">
        <td style="width:36px;text-align:center;color:#94a3b8;font-weight:700;font-size:11px;padding:9px 6px">${idx + 1}</td>
        <td style="padding:9px 10px;font-weight:600;color:#0f172a;font-size:12px">${item.productName}</td>
        <td style="padding:9px 10px;text-align:center;font-size:12px;color:#64748b">${item.unit}</td>
        <td style="padding:9px 10px;text-align:right;font-weight:800;color:#006156;font-size:13px">${item.quantity}</td>
      </tr>
    `).join('');

    const reasonHtml = selectedReq.reason ? `
      <div style="margin-top:24px;padding:14px 16px;border-left:3px solid #39ADA3;background:#f0faf9">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#006156;margin-bottom:4px">Motivo / Justificación</div>
        <div style="font-size:12px;color:#334155;font-style:italic;line-height:1.6">&ldquo;${selectedReq.reason}&rdquo;</div>
      </div>
    ` : '';

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <title>Solicitud Insumos N° ${selectedReq.id.toUpperCase()}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:36px 40px;color:#0f172a;background:#fff;line-height:1.5;font-size:12px}
        table{width:100%;border-collapse:collapse}
        @media print{body{padding:20px 24px}}
      </style></head><body>

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:3px solid #006156;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="/logo.svg" alt="Logo" style="width:40px;height:40px;object-fit:contain"/>
          <div>
            <div style="font-size:20px;font-weight:800;color:#006156;letter-spacing:-.5px">DULCE ESPERA</div>
            <div style="font-size:10px;color:#39ADA3;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-top:2px">Cocina y Nutrición Clínica</div>
          </div>
        </div>
        <div style="text-align:right;font-size:11px;color:#475569;line-height:1.8">
          <div><strong>N° LISTA:</strong> ${selectedReq.id.toUpperCase()}</div>
          <div><strong>FECHA:</strong> ${selectedReq.date}</div>
          <div><strong>ESTADO:</strong> <span style="color:#006156;font-weight:700">${selectedReq.status.toUpperCase()}</span></div>
        </div>
      </div>

      <!-- Info row -->
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#475569;margin-bottom:22px;line-height:1.7">
        <div>
          <div><strong style="color:#0f172a">Solicitado por:</strong> ${selectedReq.user}</div>
          <div><strong style="color:#0f172a">Cargo:</strong> Personal de Cocina Clínica</div>
        </div>
        <div style="text-align:right">
          <div><strong style="color:#0f172a">Destino:</strong> Cocina Central Dulce Espera</div>
          <div><strong style="color:#0f172a">Generado vía:</strong> App Móvil PWA</div>
        </div>
      </div>

      <!-- Section title -->
      <div style="font-size:11px;font-weight:800;color:#006156;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;border-left:3px solid #39ADA3;padding-left:8px">Productos Solicitados</div>

      <!-- Table -->
      <table>
        <thead>
          <tr style="border-bottom:2px solid #006156">
            <th style="width:36px;text-align:center;padding:8px 6px;font-size:10px;font-weight:700;color:#006156;text-transform:uppercase">N°</th>
            <th style="text-align:left;padding:8px 10px;font-size:10px;font-weight:700;color:#006156;text-transform:uppercase">Descripción del Insumo</th>
            <th style="text-align:center;padding:8px 10px;font-size:10px;font-weight:700;color:#006156;text-transform:uppercase">Unidad</th>
            <th style="text-align:right;padding:8px 10px;font-size:10px;font-weight:700;color:#006156;text-transform:uppercase">Cant.</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="border-top:2px solid #006156;background:#f0faf9">
            <td colspan="3" style="padding:10px;font-weight:800;color:#006156;font-size:12px;text-align:right">TOTAL: ${selectedReq.items.length} producto${selectedReq.items.length !== 1 ? 's' : ''}</td>
            <td style="padding:10px;text-align:right;font-weight:800;color:#006156;font-size:14px">${totalUnits}</td>
          </tr>
        </tbody>
      </table>

      ${reasonHtml}

      <!-- Signatures -->
      <div style="display:flex;justify-content:space-between;margin-top:50px;gap:40px">
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #94a3b8;margin-top:40px;margin-bottom:6px"></div>
          <div style="font-size:10px;color:#64748b;font-weight:600">Firma del Solicitante<br/>(${selectedReq.user})</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #94a3b8;margin-top:40px;margin-bottom:6px"></div>
          <div style="font-size:10px;color:#64748b;font-weight:600">Firma Coordinación de Nutrición<br/>(Autorización)</div>
        </div>
      </div>

      <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;font-size:9px;color:#94a3b8">
        &copy; ${new Date().getFullYear()} Dulce Espera &mdash; Documento oficial para control de insumos y nutrición clínica.
      </div>

      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  /* ─── Status badge config ─── */
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Cancelado: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600', dot: 'bg-rose-400' },
    Rechazado: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600', dot: 'bg-rose-400' },
    Pendiente: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    'En revisión': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    Aceptado: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    Aprobado: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    Comprado: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-400' },
    Entregado: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  };

  const getStatusInfo = (s: string) => statusConfig[s] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="animate-fade-in w-full max-w-[1440px] mx-auto pb-24 md:pb-8">

      {/* ═══════ HEADER ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] inline-flex">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              Despacho y Envío
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Envía reportes por WhatsApp o descárgalos como PDF
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-primary text-[11px] font-bold">
            <Package className="w-3.5 h-3.5" />
            {requests.length} pedidos
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {requests.filter(r => r.status === 'Pendiente').length} pendientes
          </div>
        </div>
      </div>

      {/* ═══════ MAIN 3-COLUMN LAYOUT ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ═══════ COL 1: ORDER LIST (compact, scalable) ═══════ */}
        <div className="lg:col-span-4 xl:col-span-4">
          <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-sm overflow-hidden">

            {/* Search + filter bar */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  1. Seleccionar Pedido
                </span>
                {selectedReq && (
                  <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                    ✓ Seleccionado
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID, nombre o producto..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-slate-50/50"
                />
                {searchOrderQuery && (
                  <button
                    onClick={() => setSearchOrderQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                    statusFilter === 'all'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Todos ({requests.length})
                </button>
                {uniqueStatuses.map(s => {
                  const si = getStatusInfo(s);
                  const count = requests.filter(r => r.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                        statusFilter === s
                          ? `${si.bg} ${si.text} border-current`
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {s} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Sort controls (compact) */}
              <div className="flex items-center gap-1 text-[10px]">
                <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                {([['date', 'Fecha'], ['user', 'Nombre'], ['items', 'Items'], ['status', 'Estado']] as [SortKey, string][]).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                      sortKey === k
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {label} {sortKey === k && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>

            {/* Order list (virtualized-feeling with compact rows) */}
            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100/80">
              {processedRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">No se encontraron pedidos</p>
                </div>
              ) : (
                processedRequests.map((req) => {
                  const isSelected = selectedReqId === req.idPublico || selectedReqId === req.id;
                  const si = getStatusInfo(req.status);

                  return (
                    <button
                      key={req.idPublico || req.id}
                      onClick={() => setSelectedReqId(req.idPublico || req.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-100 cursor-pointer group ${
                        isSelected
                          ? 'bg-primary-light/40 border-l-[3px] border-l-primary'
                          : 'bg-white hover:bg-slate-50/60 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      {/* Compact row layout */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                            #{req.id.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-[1px] rounded-full border ${si.bg} ${si.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="truncate max-w-[100px]">{req.user}</span>
                          <span>·</span>
                          <span>{req.date.split(' ')[0]}</span>
                          <span>·</span>
                          <span className="font-semibold text-slate-500">{req.items.length} items</span>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Results footer */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] text-slate-400 font-semibold text-center">
                Mostrando {processedRequests.length} de {requests.length} pedidos
              </p>
            </div>
          </Card>
        </div>

        {/* ═══════ COL 2: PREVIEW + COORDINATOR (unified) ═══════ */}
        <div className="lg:col-span-4 xl:col-span-5 space-y-5">

          {!selectedReq ? (
            /* Empty state */
            <Card className="p-10 border border-dashed border-slate-300 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] bg-white">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-slate-300 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-sm text-slate-600">Selecciona un pedido</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                Elige un pedido de la lista para ver su detalle, productos e información de envío.
              </p>
            </Card>
          ) : (
            <>
              {/* ─── Order preview card ─── */}
              <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-md overflow-hidden bg-white">
                {/* Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary uppercase tracking-wide">
                      Detalle del Pedido
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    #{selectedReq.id.toUpperCase()}
                  </span>
                </div>

                {/* Order info row */}
                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Solicitante</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-primary shrink-0" />
                      {selectedReq.user}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Fecha</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-primary shrink-0" />
                      {selectedReq.date.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Estado</span>
                    {(() => {
                      const si = getStatusInfo(selectedReq.status);
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full border ${si.bg} ${si.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                          {selectedReq.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Items table */}
                <div ref={previewRef} className={`transition-all duration-300 ${expandedPreview ? 'max-h-[600px]' : 'max-h-[260px]'} overflow-y-auto`}>
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-primary/[0.04]">
                        <th className="py-2 pl-5 pr-2 text-left text-[9px] font-black text-primary uppercase tracking-widest w-8">#</th>
                        <th className="py-2 px-2 text-left text-[9px] font-black text-primary uppercase tracking-widest">Producto</th>
                        <th className="py-2 px-2 text-center text-[9px] font-black text-primary uppercase tracking-widest w-16">Unidad</th>
                        <th className="py-2 pl-2 pr-5 text-right text-[9px] font-black text-primary uppercase tracking-widest w-14">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReq.items.map((item, idx) => (
                        <tr key={idx} className={`group transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} hover:bg-primary-light/30`}>
                          <td className="py-2 pl-5 pr-2 text-slate-400 font-bold text-[10px]">{idx + 1}</td>
                          <td className="py-2 px-2 font-semibold text-slate-700">{item.productName}</td>
                          <td className="py-2 px-2 text-center text-slate-400 font-medium text-[10px]">{item.unit}</td>
                          <td className="py-2 pl-2 pr-5 text-right">
                            <span className="font-black text-primary text-sm">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Show more / less toggle */}
                {selectedReq.items.length > 5 && (
                  <button
                    onClick={() => setExpandedPreview(!expandedPreview)}
                    className="w-full px-5 py-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] font-bold text-primary hover:bg-primary-light/30 transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedPreview ? 'rotate-180' : ''}`} />
                    {expandedPreview ? 'Ver menos' : `Ver todos (${selectedReq.items.length} productos)`}
                  </button>
                )}

                {/* Reason/motivo bar */}
                {selectedReq.reason && (
                  <div className="mx-5 mb-4 mt-2 p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl">
                    <span className="text-[9px] font-bold uppercase text-amber-600 block mb-0.5">Motivo / Justificación</span>
                    <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">
                      &ldquo;{selectedReq.reason}&rdquo;
                    </p>
                  </div>
                )}

                {/* Item count footer */}
                <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Total: {selectedReq.items.length} producto{selectedReq.items.length !== 1 && 's'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {selectedReq.items.reduce((acc, i) => acc + i.quantity, 0)} unidades en total
                  </span>
                </div>
              </Card>

              {/* ─── Coordinator selector ─── */}
              <Card className="p-4 border border-slate-200/80 rounded-2xl shadow-clinical-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    2. Destinatario
                  </span>
                  {selectedCoord && (
                    <span className="text-[9px] font-bold bg-secondary text-white px-2 py-0.5 rounded-full">
                      ✓ {selectedCoord.nombre.split(' ')[0]}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {coordinators.map((c) => {
                    const isSelected = String(selectedCoordId) === String(c.id);
                    const initials = c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCoordId(String(c.id))}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all duration-100 cursor-pointer ${
                          isSelected
                            ? 'bg-secondary-light/30 border-secondary shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 transition-colors ${
                          isSelected ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {initials}
                        </div>
                        <span className="font-bold text-slate-700 text-[11px] truncate leading-none">{c.nombre.split(' ')[0]}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-secondary shrink-0 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* ═══════ COL 3: ACTIONS (sticky sidebar) ═══════ */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-6 space-y-4">

            {/* Actions card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  3. Acciones
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {/* WhatsApp CTA */}
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!selectedCoord || !selectedReq}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] cursor-pointer ${
                    selectedCoord && selectedReq
                      ? 'bg-[#25D366] hover:bg-[#20ba5a] shadow-md shadow-[#25D366]/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <svg className={`w-5 h-5 fill-current shrink-0 ${selectedCoord && selectedReq ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  Enviar por WhatsApp
                </button>

                {!selectedReq && (
                  <p className="text-[10px] text-slate-400 font-semibold text-center py-1">
                    Selecciona un pedido y un destinatario
                  </p>
                )}
                {selectedReq && !selectedCoord && (
                  <p className="text-[10px] text-amber-600 font-bold text-center py-1">
                    * Elige un destinatario para enviar
                  </p>
                )}

                {/* Divider */}
                {selectedReq && (
                  <>
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Reportes</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Print */}
                    <button
                      onClick={handlePrintLocalPDF}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir PDF
                    </button>

                    {/* Download */}
                    <a
                      href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all active:scale-[0.98] cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4 text-primary" />
                      Descargar Reporte
                    </a>

                    {/* Admin report */}
                    <a
                      href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte-admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary-light hover:bg-[#d0e5e3] text-primary transition-all active:scale-[0.98] cursor-pointer text-center"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Reporte Compras
                    </a>

                    {/* Share */}
                    {canShare && (
                      <button
                        onClick={handleNativeShare}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-primary" />
                        Compartir
                      </button>
                    )}

                    {/* Quick links */}
                    <div className="pt-1 space-y-1.5">
                      <a
                        href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver reporte cocina en navegador
                      </a>
                      <a
                        href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte-admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver reporte compras en navegador
                      </a>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Help tip */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/50 rounded-2xl flex gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div className="text-[10px] leading-relaxed font-semibold text-amber-800">
                <strong className="text-amber-900 block mb-0.5">Tip: Enviar PDF por WhatsApp</strong>
                Presiona &quot;Imprimir PDF&quot;, selecciona &quot;Guardar como PDF&quot; y adjúntalo manualmente al chat.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
