'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../UI';
import { MessageCircle, Printer } from 'lucide-react';

export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-lg mx-auto pb-24 md:pb-8">
      {/* Title */}
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-3">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          Enviar por WhatsApp
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Despacha el reporte del pedido de insumos de forma rápida.
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
            2. ¿A quién se lo vas a enviar?
          </label>
          <select
            value={selectedCoordId}
            onChange={(e) => setSelectedCoordId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer font-bold"
          >
            <option value="">-- Seleccionar Destinatario --</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleSendWhatsApp}
            disabled={!selectedReq || !selectedCoord}
            className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-black text-sm text-white transition-all shadow-clinical-md active:scale-98 tap-bounce cursor-pointer ${
              selectedReq && selectedCoord
                ? 'bg-[#25D366] hover:bg-[#20ba5a] hover:shadow-clinical-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
            <span>Enviar por WhatsApp</span>
          </button>

          {selectedReq && (
            <a
              href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 transition-all shadow-clinical-sm active:scale-98 tap-bounce cursor-pointer text-center"
            >
              <Printer className="w-5 h-5 text-primary" />
              <span>Ver Reporte Imprimible</span>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
