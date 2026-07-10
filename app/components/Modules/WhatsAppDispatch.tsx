'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../UI';
import { MessageCircle, Printer, Calendar, Clock, User, AlertCircle } from 'lucide-react';

export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');

  // Find selected request
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId);
  // Find selected coordinator
  const selectedCoord = coordinators.find((c) => String(c.id) === String(selectedCoordId));

  // Generate WhatsApp message preview
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

  const messageText = generateMessage();

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span>Despachar por WhatsApp</span>
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Envía el reporte y detalles del pedido a la persona encargada para su aprobación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form Controls */}
        <div className="md:col-span-6 space-y-6">
          <Card className="p-6 border border-slate-200/80 rounded-[20px] shadow-clinical-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              1. Configuración de Envío
            </h3>

            {/* Select Order */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">
                Seleccionar Pedido
              </label>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] hover:border-slate-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer font-semibold"
              >
                <option value="">-- Seleccionar Pedido Reciente --</option>
                {requests.map((req) => (
                  <option key={req.idPublico || req.id} value={req.idPublico || req.id}>
                    Nº {req.id.toUpperCase()} - {req.date} ({req.user})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Coordinator */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">
                Seleccionar Aprobador (Contacto)
              </label>
              <select
                value={selectedCoordId}
                onChange={(e) => setSelectedCoordId(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] hover:border-slate-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer font-semibold"
              >
                <option value="">-- Seleccionar Coordinador --</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.telefono})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleSendWhatsApp}
                disabled={!selectedReq || !selectedCoord}
                className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-clinical-md active:scale-98 tap-bounce cursor-pointer ${
                  selectedReq && selectedCoord
                    ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-clinical-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
                <span>Enviar por WhatsApp</span>
              </button>

              {selectedReq && (
                <a
                  href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-700 transition-all shadow-clinical-sm active:scale-98 tap-bounce cursor-pointer text-center"
                >
                  <Printer className="w-5 h-5 text-primary" />
                  <span>Ver Reporte Imprimible</span>
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Message Preview (WhatsApp simulation) */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#efeae2] border border-slate-300/80 rounded-[20px] shadow-clinical-sm overflow-hidden flex flex-col min-h-[400px]">
            {/* Header of mock chat */}
            <div className="bg-[#005e54] text-white px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[#005e54] font-black shadow-inner">
                {selectedCoord ? selectedCoord.nombre.slice(0, 2).toUpperCase() : 'DE'}
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">
                  {selectedCoord ? selectedCoord.nombre : 'Selecciona un Coordinador'}
                </h4>
                <p className="text-[10px] text-emerald-200/90 font-semibold mt-0.5">
                  {selectedCoord ? `WhatsApp: ${selectedCoord.telefono}` : 'En línea'}
                </p>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-end bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain">
              {!selectedReq ? (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 p-5 rounded-2xl text-center space-y-3.5 my-auto max-w-sm mx-auto shadow-clinical-sm">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 text-sm">Vista Previa Desactivada</h5>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Elige un pedido y un destinatario a la izquierda para estructurar el mensaje.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#d9fdd3] text-[#111b21] p-3.5 rounded-xl rounded-tr-none shadow-md max-w-[85%] self-end text-xs leading-normal font-mono whitespace-pre-wrap border border-[#e1f5fe]/10 relative">
                  {messageText}
                  <div className="text-[9px] text-slate-400 text-right mt-1.5 font-sans font-bold">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✔✔
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
