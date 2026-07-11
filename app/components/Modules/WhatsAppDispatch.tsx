'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../UI';
import { MessageCircle, Printer, Download, Share2, FileText, AlertCircle, Check } from 'lucide-react';

export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!(navigator as any).share) {
      setCanShare(true);
    }
  }, []);

  // Find selected request
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId);
  // Find selected coordinator
  const selectedCoord = coordinators.find((c) => String(c.id) === String(selectedCoordId));

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

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-xl mx-auto pb-24 md:pb-8">
      {/* Title */}
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-3 animate-pulse-subtle">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          Enviar y Compartir Reporte
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Despacha o descarga el reporte oficial del pedido a tu coordinador.
        </p>
      </div>

      <Card className="p-6 border border-slate-200/80 rounded-[24px] shadow-clinical-md space-y-6">
        {/* Select Order */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wide">
            1. ¿Qué pedido deseas enviar?
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer font-bold"
          >
            <option value="">-- Seleccionar Pedido --</option>
            {requests.map((req) => (
              <option key={req.idPublico || req.id} value={req.idPublico || req.id}>
                Lista Nº {req.id.toUpperCase()} ({req.date.split(' ')[0]}) - {req.user}
              </option>
            ))}
          </select>
        </div>

        {/* Select Coordinator */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wide">
            2. ¿A quién se lo vas a enviar? (Para WhatsApp)
          </label>
          <select
            value={selectedCoordId}
            onChange={(e) => setSelectedCoordId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer font-bold"
          >
            <option value="">-- Seleccionar Destinatario --</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.telefono})
              </option>
            ))}
          </select>
        </div>

        {/* Preview of the Request */}
        {selectedReq && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 animate-view-enter">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-xs font-bold text-[#006156] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Vista Previa de la Lista</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                Nº {selectedReq.id.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {selectedReq.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs font-semibold">
                  <span className="text-slate-700">• {item.productName}</span>
                  <span className="text-primary font-bold shrink-0">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>

            {selectedReq.reason && (
              <p className="text-[11px] text-slate-400 font-bold italic pt-1.5 border-t border-slate-200/50">
                Motivo: "{selectedReq.reason}"
              </p>
            )}
          </div>
        )}

        {/* Action Triggers */}
        {selectedReq && (
          <div className="pt-2 space-y-3">
            {/* WhatsApp send button */}
            <button
              onClick={handleSendWhatsApp}
              disabled={!selectedCoord}
              className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-98 tap-bounce cursor-pointer ${
                selectedCoord
                  ? 'bg-[#25D366] hover:bg-[#20ba5a] shadow-clinical-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <svg className={`w-5.5 h-5.5 fill-current ${selectedCoord ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
              <span>Enviar por WhatsApp</span>
            </button>
            {!selectedCoord && (
              <p className="text-[10px] text-amber-600 font-bold text-center -mt-1">
                *Selecciona un destinatario arriba para activar el botón de WhatsApp.
              </p>
            )}

            {/* Print Local PDF */}
            <button
              onClick={handlePrintLocalPDF}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm bg-primary hover:bg-primary-hover text-white transition-all shadow-clinical-sm active:scale-98 tap-bounce cursor-pointer"
            >
              <Printer className="w-5 h-5 text-white" />
              <span>Imprimir</span>
            </button>

            {/* Server link report - Descargar */}
            <a
              href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 transition-all active:scale-98 tap-bounce cursor-pointer text-center"
            >
              <Download className="w-5 h-5 text-primary" />
              <span>Descargar Reporte</span>
            </a>

            {/* Native Share API */}
            {canShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 transition-all active:scale-98 tap-bounce cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-primary" />
                <span>Compartir Enlace</span>
              </button>
            )}
          </div>
        )}

        {/* Explain info box about WhatsApp limits */}
        {selectedReq && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
            <AlertCircle className="w-5.5 h-5.5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-[11px] leading-relaxed font-semibold">
              <strong className="text-amber-900 block mb-0.5">¿Cómo enviar el archivo PDF por WhatsApp?</strong>
              Los navegadores web no permiten adjuntar archivos automáticamente en enlaces de WhatsApp. Te recomendamos:
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>Toca <strong className="text-amber-900">"Imprimir"</strong> arriba.</li>
                <li>En la pantalla de impresión, selecciona <strong className="text-amber-900">Guardar como PDF</strong> o usa el botón de <strong className="text-amber-900">Compartir</strong> de tu teléfono para enviarlo directamente como archivo a tu contacto.</li>
              </ol>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
