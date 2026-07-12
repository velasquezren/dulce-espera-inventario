'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../UI';
import { 
  MessageCircle, 
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
  Send
} from 'lucide-react';

export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [searchCoordQuery, setSearchCoordQuery] = useState('');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!(navigator as any).share) {
      setCanShare(true);
    }
  }, []);

  // Find selected request
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId);
  // Find selected coordinator
  const selectedCoord = coordinators.find((c) => String(c.id) === String(selectedCoordId));

  // Filter requests for list selection
  const filteredRequests = requests.filter(req => 
    req.id.toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
    req.user.toLowerCase().includes(searchOrderQuery.toLowerCase())
  );

  // Filter coordinators for list selection
  const filteredCoordinators = coordinators.filter(c => 
    c.nombre.toLowerCase().includes(searchCoordQuery.toLowerCase())
  );

  // Generate WhatsApp message content
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
    msg += `\n*Ver Reporte completo para imprimir:* \n${reportUrl}\n\n`;
    msg += `Por favor, revise y proceda con la aprobación correspondiente en FileMaker.`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    if (!selectedReq || !selectedCoord) return;
    const phone = selectedCoord.telefono;
    const text = generateMessage();
    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (!selectedReq) return;
    const text = generateMessage();
    try {
      await navigator.share({
        title: `Solicitud de Insumos - Lista ${selectedReq.id.toUpperCase()}`,
        text: text,
        url: `https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`
      });
    } catch (err) {
      console.log('Error compartiendo:', err);
    }
  };

  const handlePrintLocalPDF = () => {
    if (!selectedReq) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = selectedReq.items.map((item, idx) => `
      <tr>
        <td style="width: 40px; text-align: center; color: #94a3b8; font-weight: bold;">${idx + 1}</td>
        <td>
          <div class="prod-name">${item.productName}</div>
        </td>
        <td>
          <span class="qty-badge">${item.quantity} ${item.unit}</span>
        </td>
        <td class="notes-text">${item.notes || '-'}</td>
      </tr>
    `).join('');

    const reasonHtml = selectedReq.reason ? `
      <div class="section-title">Comentarios / Justificación</div>
      <div class="reason-box">
        &ldquo;${selectedReq.reason}&rdquo;
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Solicitud Insumos Nº ${selectedReq.id.toUpperCase()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #0f172a;
              background-color: #ffffff;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #006156;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .clinic-info {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .clinic-title {
              font-size: 22px;
              font-weight: 800;
              color: #006156;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .clinic-subtitle {
              font-size: 12px;
              color: #39ADA3;
              font-weight: 700;
              margin-top: 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-meta {
              text-align: right;
              font-size: 11px;
              color: #475569;
            }
            .doc-meta div {
              margin-bottom: 4px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              color: #006156;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 25px;
              margin-bottom: 12px;
              border-left: 3px solid #39ADA3;
              padding-left: 8px;
            }
            .details-grid {
              display: flex;
              justify-content: space-between;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              margin-bottom: 25px;
              font-size: 12px;
            }
            .details-item {
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 30px;
            }
            th {
              background-color: #f8fafc;
              color: #0f172a;
              text-align: left;
              padding: 10px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 10px;
              font-size: 12px;
              border-bottom: 1px solid #e2e8f0;
              color: #334155;
            }
            .prod-name {
              font-weight: 600;
              color: #0f172a;
            }
            .qty-badge {
              font-weight: 750;
              color: #006156;
            }
            .notes-text {
              font-style: italic;
              color: #64748b;
            }
            .reason-box {
              background-color: #ebf7f6;
              border-radius: 8px;
              padding: 12px;
              font-size: 12px;
              font-style: italic;
              color: #006156;
              margin-bottom: 30px;
            }
            .signatures-container {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
              gap: 40px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #cbd5e1;
              margin-bottom: 6px;
              margin-top: 40px;
            }
            .signature-title {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="clinic-info">
              <img src="/logo.svg" alt="Logo" style="width: 44px; height: 44px; object-fit: contain;" />
              <div>
                <h1 class="clinic-title">DULCE ESPERA</h1>
                <div class="clinic-subtitle">Cocina y Nutrición Clínica</div>
              </div>
            </div>
            <div class="doc-meta">
              <div><strong>Nº LISTA:</strong> ${selectedReq.id.toUpperCase()}</div>
              <div><strong>FECHA:</strong> ${selectedReq.date}</div>
              <div><strong>ESTADO:</strong> ${selectedReq.status.toUpperCase()}</div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-item">
              <div><strong>Solicitado por:</strong> ${selectedReq.user}</div>
              <div><strong>Cargo:</strong> Personal de Cocina Clínica</div>
            </div>
            <div class="details-item" style="text-align: right;">
              <div><strong>Destino:</strong> Cocina Central Dulce Espera</div>
              <div><strong>Generado vía:</strong> App Móvil PWA</div>
            </div>
          </div>

          <div class="section-title">Productos Solicitados</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">Item</th>
                <th>Descripción del Insumo</th>
                <th>Cantidad</th>
                <th>Observaciones / Especificaciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          ${reasonHtml}

          <div class="signatures-container">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Firma del Solicitante<br/>(${selectedReq.user})</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-title">Firma Coordinación de Nutrición<br/>(Autorización)</div>
            </div>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} Dulce Espera. Documento oficial para control de insumos y nutrición clínica.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statusConfig: Record<string, { bg: string; text: string }> = {
    Cancelado: { bg: 'bg-rose-50 border border-rose-100', text: 'text-rose-600' },
    Rechazado: { bg: 'bg-rose-50 border border-rose-100', text: 'text-rose-600' },
    Pendiente: { bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600' },
    'En revisión': { bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600' },
    Aceptado: { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-600' },
    Aprobado: { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-600' },
    Comprado: { bg: 'bg-sky-50 border border-sky-100', text: 'text-sky-600' },
    Entregado: { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-600' },
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Title */}
      <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <span className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] inline-flex">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-98.2-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
            </span>
            Despacho y Envío de Reporte
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Envía el reporte del pedido a un coordinador por WhatsApp o descárgalo para firmar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Search and selection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Select Order */}
          <Card className="p-5 border border-slate-200/80 rounded-[20px] shadow-clinical-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wide">
                1. Selecciona el Pedido
              </label>
              {selectedReq && (
                <span className="text-[10px] bg-primary-light text-primary font-bold px-2 py-0.5 rounded-full">
                  Seleccionado
                </span>
              )}
            </div>

            {/* Search Input for Orders */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.8]" />
              <input
                type="text"
                placeholder="Buscar pedido por ID o solicitante..."
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] placeholder-[#94a3b8] transition-all duration-150 focus:border-[#006156] outline-none bg-slate-50/50 hover:bg-slate-50"
              />
            </div>

            {/* Interactive list of orders */}
            <div className="max-h-[360px] overflow-y-auto p-1 space-y-2">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                  No se encontraron pedidos correspondientes.
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedReqId === req.idPublico || selectedReqId === req.id;
                  const statusInfo = statusConfig[req.status] || { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-600' };
                  
                  return (
                    <button
                      key={req.idPublico || req.id}
                      onClick={() => setSelectedReqId(req.idPublico || req.id)}
                      className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between transition-all duration-150 border cursor-pointer mt-2 first:mt-0 ${
                        isSelected 
                          ? 'bg-primary-light/30 border-primary shadow-clinical-sm scale-[1.01]' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm tracking-tight">
                            Nº {req.id.toUpperCase()}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 shrink-0" />
                            {req.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {req.date.split(' ')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 shrink-0" />
                            {req.items ? req.items.length : 0} {req.items?.length === 1 ? 'insumo' : 'insumos'}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-clinical-sm scale-110 duration-200">
                            <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Card: Select Coordinator */}
          <Card className="p-5 border border-slate-200/80 rounded-[20px] shadow-clinical-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wide">
                2. ¿A quién se lo vas a enviar? (Coordinador)
              </label>
              {selectedCoord && (
                <span className="text-[10px] bg-secondary-light text-secondary font-bold px-2 py-0.5 rounded-full">
                  Seleccionado
                </span>
              )}
            </div>

            {/* List of coordinators as responsive choice chips/cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {coordinators.map((c) => {
                const isSelected = String(selectedCoordId) === String(c.id);
                const initials = c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2);
                
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCoordId(String(c.id))}
                    className={`text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-secondary-light/20 border-secondary shadow-clinical-sm scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                      isSelected ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-800 text-xs truncate leading-snug">
                        {c.nombre}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">
                        {c.telefono}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column: Preview and dispatch actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!selectedReq ? (
            <Card className="p-8 border border-dashed border-slate-300 rounded-[20px] text-center flex flex-col items-center justify-center py-20 text-slate-400 bg-white">
              <FileText className="w-12 h-12 stroke-[1] mb-3 text-slate-300" />
              <h3 className="font-bold text-sm text-slate-600">Ningún pedido seleccionado</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Selecciona un pedido de la lista de la izquierda para ver su reporte y opciones de envío.
              </p>
            </Card>
          ) : (
            <div className="space-y-6 animate-view-enter">
              {/* Card: Preview */}
              <Card className="p-5 border border-slate-200/80 rounded-[20px] shadow-clinical-md space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-[#006156] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Vista Previa del Pedido</span>
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    ID: #{selectedReq.id.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {selectedReq.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-semibold bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-700 truncate pr-2">{item.productName}</span>
                      <span className="text-primary font-black shrink-0 whitespace-nowrap bg-primary-light/50 px-2 py-0.5 rounded-md">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedReq.reason && (
                  <div className="p-3 bg-amber-50/40 border border-amber-100/50 rounded-xl">
                    <span className="text-[9px] font-bold uppercase text-amber-700 block mb-0.5">Motivo / Justificación</span>
                    <p className="text-xs text-slate-500 font-semibold italic">
                      "{selectedReq.reason}"
                    </p>
                  </div>
                )}
              </Card>

              {/* Card: Actions */}
              <Card className="p-5 border border-slate-200/80 rounded-[20px] shadow-clinical-lg space-y-4 bg-white">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wide">
                  3. Acciones de Envío
                </label>

                <div className="space-y-3">
                  {/* WhatsApp button */}
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={!selectedCoord}
                    className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-98 tap-bounce cursor-pointer ${
                      selectedCoord
                        ? 'bg-[#25D366] hover:bg-[#20ba5a] shadow-clinical-md hover:shadow-clinical-lg'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <svg className={`w-5 h-5 fill-current shrink-0 ${selectedCoord ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    <span>Enviar por WhatsApp</span>
                  </button>

                  {!selectedCoord && (
                    <p className="text-[10px] text-amber-600 font-bold text-center">
                      * Elige un destinatario para activar el botón de WhatsApp.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Print Button */}
                    <button
                      onClick={handlePrintLocalPDF}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs bg-primary hover:bg-primary-hover text-white transition-all shadow-clinical-sm active:scale-98 tap-bounce cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      <span>Imprimir</span>
                    </button>

                    {/* Download Button */}
                    <a
                      href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-black text-xs text-slate-700 transition-all active:scale-98 tap-bounce cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4 text-primary" />
                      <span>Descargar</span>
                    </a>
                  </div>

                  {/* Native Share */}
                  {canShare && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-700 transition-all active:scale-98 tap-bounce cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                      <span>Compartir Enlace</span>
                    </button>
                  )}
                </div>
              </Card>

              {/* Info limits alert */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 shadow-clinical-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-semibold">
                  <strong className="text-amber-900 block mb-0.5">¿Cómo enviar el reporte en PDF?</strong>
                  Los navegadores bloquean el adjuntar archivos locales. Al presionar <strong className="text-amber-900">"Imprimir"</strong>, selecciona <strong className="text-amber-900">Guardar como PDF</strong> y envíaselo al contacto.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
