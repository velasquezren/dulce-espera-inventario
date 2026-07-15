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
  ShoppingCart,
  ArrowLeft,
  Copy,
  Image as ImageIcon,
  Users
} from 'lucide-react';

/* ────────────────────── types ────────────────────── */
type SortKey = 'date' | 'user' | 'items' | 'status';
type SortDir = 'asc' | 'desc';

interface RequestItem {
  id: string;
  idPublico?: string;
  date: string;
  status: 'Pendiente' | 'En revisión' | 'Aprobado' | 'Aceptado' | 'Rechazado' | 'Comprado' | 'Entregado' | 'Cancelado';
  user: string;
  reason?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

/* ────────────────────── helper: canvas image generation ────────────────────── */
const generateRequestImage = (req: RequestItem): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const width = 500;
    
    // Calculate heights dynamically
    const headerHeight = 84;
    const metadataHeight = 60;
    const paddingMiddle = 30;
    const tableHeaderHeight = 25;
    const itemHeight = 22;
    const summaryHeight = 44;
    const reasonHeight = req.reason ? 54 : 0;
    const footerHeight = 50;

    const height = headerHeight + metadataHeight + paddingMiddle + tableHeaderHeight + 
                   (req.items.length * itemHeight) + summaryHeight + reasonHeight + footerHeight;

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Header (Dulce Espera clinical primary teal color)
    ctx.fillStyle = '#006156';
    ctx.fillRect(4, 4, width - 8, 80);

    // Logo icon (Circle + white cross)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(48, 44, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#006156';
    // vertical
    ctx.fillRect(45, 32, 6, 24);
    // horizontal
    ctx.fillRect(36, 41, 24, 6);

    // Brand texts
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('DULCE ESPERA', 80, 40);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText('COCINA Y NUTRICIÓN CLÍNICA', 80, 56);

    // Order ID (top right)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`#${req.id.toUpperCase()}`, width - 24, 46);
    ctx.textAlign = 'left';

    // Metadata section (Gray card)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 84, width - 8, 60);

    // Solicitado por
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText('SOLICITADO POR', 24, 107);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    const userName = req.user || 'Personal de Cocina';
    ctx.fillText(userName.toUpperCase(), 24, 127);

    // Fecha
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText('FECHA REGISTRO', 330, 107);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(req.date.split(' ')[0], 330, 127);

    // Table Header
    let currentY = 175;
    ctx.fillStyle = '#006156';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('DESCRIPCIÓN DEL INSUMO', 24, currentY);

    ctx.textAlign = 'right';
    ctx.fillText('CANTIDAD', width - 24, currentY);
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, currentY + 8);
    ctx.lineTo(width - 24, currentY + 8);
    ctx.stroke();

    currentY += 24;

    // Items
    req.items.forEach((item: any, idx: number) => {
      if (idx % 2 === 1) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(20, currentY - 14, width - 40, 22);
      }
      
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      let pName = item.productName || 'Producto';
      if (pName.length > 42) pName = pName.slice(0, 39) + '...';
      ctx.fillText(pName, 24, currentY + 1);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${item.quantity} ${item.unit || 'uds'}`, width - 24, currentY + 1);
      ctx.textAlign = 'left';

      currentY += 22;
    });

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, currentY - 6);
    ctx.lineTo(width - 24, currentY - 6);
    ctx.stroke();

    currentY += 12;

    // Summary box
    ctx.fillStyle = '#f0faf9';
    ctx.fillRect(20, currentY - 10, width - 40, 32);
    ctx.strokeStyle = '#39ada3';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, currentY - 10, width - 40, 32);

    ctx.fillStyle = '#006156';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(`PRODUCTOS: ${req.items.length}`, 32, currentY + 10);

    const totalUnits = req.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    ctx.textAlign = 'right';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`UNIDADES TOTALES: ${totalUnits}`, width - 32, currentY + 10);
    ctx.textAlign = 'left';

    currentY += 34;

    // Reason
    if (req.reason) {
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(20, currentY - 6, width - 40, 44);
      
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, currentY - 6, width - 40, 44);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText('MOTIVO / JUSTIFICACIÓN:', 30, currentY + 6);

      ctx.fillStyle = '#78350f';
      ctx.font = 'italic 10px system-ui, -apple-system, sans-serif';
      let rsn = req.reason;
      if (rsn.length > 60) rsn = rsn.slice(0, 57) + '...';
      ctx.fillText(`"${rsn}"`, 30, currentY + 22);

      currentY += 54;
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 8px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generado desde el sistema de inventario Dulce Espera', width / 2, currentY);
    ctx.fillText('Válido para fines de control de insumos y despacho cocina', width / 2, currentY + 12);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas generated null blob'));
      }
    }, 'image/png');
  });
};

/* ────────────────────── component ────────────────────── */
export default function WhatsAppDispatch() {
  const { requests, coordinators } = useApp();

  /* selection ids */
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('');

  /* modals states */
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);

  /* search / filter / sort (inside Request selection modal) */
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ui states */
  const [canShare, setCanShare] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Check share capabilities
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!(navigator as any).share) {
      setCanShare(true);
    }
  }, []);

  // Pre-select latest request on load
  const latestRequest = useMemo(() => {
    if (!requests || requests.length === 0) return null;
    return [...requests].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [requests]);

  useEffect(() => {
    if (latestRequest && !selectedReqId) {
      setSelectedReqId(latestRequest.idPublico || latestRequest.id);
    }
  }, [latestRequest, selectedReqId]);

  // Pre-select first coordinator on load
  useEffect(() => {
    if (coordinators && coordinators.length > 0 && !selectedCoordId) {
      setSelectedCoordId(String(coordinators[0].id));
    }
  }, [coordinators, selectedCoordId]);

  /* derived data */
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId) as RequestItem | undefined;
  const selectedCoord = coordinators.find((c) => String(c.id) === String(selectedCoordId));

  // Generate Image Preview Url
  useEffect(() => {
    if (selectedReq) {
      setIsGenerating(true);
      generateRequestImage(selectedReq)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImagePreviewUrl(url);
          setIsGenerating(false);
          return () => {
            URL.revokeObjectURL(url);
          };
        })
        .catch((err) => {
          console.error('Error rendering image preview:', err);
          setIsGenerating(false);
        });
    } else {
      setImagePreviewUrl('');
    }
  }, [selectedReq]);

  /* unique statuses for filter */
  const uniqueStatuses = useMemo(() => {
    const set = new Set(requests.map(r => r.status));
    return Array.from(set);
  }, [requests]);

  /* filtered + sorted requests (in selection modal) */
  const processedRequests = useMemo(() => {
    let list = [...requests];

    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter);
    }

    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      list = list.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        (r.reason || '').toLowerCase().includes(q) ||
        r.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }

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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  /* ─── WhatsApp message ─── */
  const generateMessage = () => {
    if (!selectedReq) return '';
    let msg = `*DULCE ESPERA - SOLICITUD DE INSUMOS* 🏥🥣\n`;
    msg += `----------------------------------------\n`;
    msg += `Se ha registrado una nueva solicitud de insumos.\n\n`;
    msg += `• *Solicitado por:* ${selectedReq.user}\n`;
    msg += `• *ID Pedido:* ${selectedReq.id.toUpperCase()}\n`;
    msg += `• *Fecha:* ${selectedReq.date}\n\n`;
    msg += `*Productos Solicitados:*\n`;
    selectedReq.items.forEach((item) => {
      msg += `- ${item.productName}: *${item.quantity} ${item.unit}*\n`;
    });
    if (selectedReq.reason) {
      msg += `\n*Motivo:* _"${selectedReq.reason}"_\n`;
    }
    const reportUrl = `https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`;
    msg += `\n*Ver Reporte Cocina:* \n${reportUrl}\n\n`;
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

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateMessage());
      showToast('¡Texto copiado al portapapeles!');
    } catch {
      showToast('Error al copiar el texto');
    }
  };

  const handleCopyImage = async () => {
    if (!selectedReq) return;
    try {
      const blob = await generateRequestImage(selectedReq);
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      showToast('¡Imagen copiada! Pégala en WhatsApp.');
    } catch (err) {
      console.error(err);
      showToast('Error al copiar imagen. Prueba a descargar.');
    }
  };

  const handleShareImage = async () => {
    if (!selectedReq) return;
    try {
      const blob = await generateRequestImage(selectedReq);
      const file = new File([blob], `Pedido_${selectedReq.id}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Pedido ${selectedReq.id}`,
          text: `Solicitud de insumos de ${selectedReq.user}`
        });
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo compartir la imagen');
    }
  };

  const handleDownloadImage = async () => {
    if (!selectedReq) return;
    try {
      const blob = await generateRequestImage(selectedReq);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pedido_${selectedReq.id.toUpperCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('¡Imagen descargada!');
    } catch (err) {
      console.error(err);
      showToast('Error al descargar la imagen');
    }
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
          <div style="font-size:10px;color:#64748b;font-weight:700">Firma de Solicitante</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #94a3b8;margin-top:40px;margin-bottom:6px"></div>
          <div style="font-size:10px;color:#64748b;font-weight:700">Firma de Autorización</div>
        </div>
      </div>

      <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;font-size:9px;color:#94a3b8">
        &copy; ${new Date().getFullYear()} Dulce Espera &mdash; Documento oficial para control de insumos.
      </div>

      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  /* Status badge config */
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

  return (
    <div className="animate-fade-in w-full max-w-[1280px] mx-auto pb-24 md:pb-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-clinical-lg flex items-center gap-2 animate-fade-in border border-slate-800">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] inline-flex shadow-clinical-sm border border-[#25D366]/15">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Despacho de Pedidos
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Comparte reportes de insumos y comprobantes directamente por WhatsApp
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light text-primary text-xs font-bold border border-primary/10">
            <Package className="w-3.5 h-3.5" />
            {requests.length} Solicitudes
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50">
            <Clock className="w-3.5 h-3.5" />
            {requests.filter(r => r.status === 'Pendiente').length} Pendientes
          </div>
        </div>
      </div>

      {!selectedReq ? (
        /* Empty State */
        <Card className="p-12 border border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center justify-center min-h-[400px] bg-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-base text-slate-600">No hay solicitudes cargadas</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Crea una solicitud de insumos en el formulario para poder despacharla.
          </p>
        </Card>
      ) : (
        /* ═══════ MAIN 2-COLUMN LAYOUT ═══════ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═══════ COL 1: SELECTED ORDER DETAIL & RECIPIENT ═══════ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Request Detail Card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-md overflow-hidden bg-white">
              {/* Header with requester and select button */}
              <div className="px-6 py-5 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedReq.user.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                      Solicitud de {selectedReq.user}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-semibold">
                      <span>ID: #{selectedReq.id.toUpperCase()}</span>
                      <span>•</span>
                      <span>{selectedReq.date}</span>
                    </div>
                  </div>
                </div>

                {/* Change Request Button */}
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-primary/30 hover:border-primary bg-white hover:bg-primary/5 rounded-xl font-bold text-xs text-primary transition-all active:scale-98 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Cambiar Pedido</span>
                </button>
              </div>

              {/* Status ribbon */}
              <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado de Aprobación</span>
                {(() => {
                  const si = getStatusInfo(selectedReq.status);
                  return (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${si.bg} ${si.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                      {selectedReq.status}
                    </span>
                  );
                })()}
              </div>

              {/* Items table */}
              <div ref={previewRef} className={`transition-all duration-300 ${expandedPreview ? 'max-h-[600px]' : 'max-h-[280px]'} overflow-y-auto`}>
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                    <tr>
                      <th className="py-3 pl-6 pr-2 text-[10px] font-black text-slate-400 uppercase tracking-wider w-8">#</th>
                      <th className="py-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                      <th className="py-3 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider w-20">Unidad</th>
                      <th className="py-3 pl-2 pr-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Cant.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReq.items.map((item, idx) => (
                      <tr key={idx} className={`group transition-colors ${idx % 2 === 1 ? 'bg-slate-50/20' : 'bg-white'} hover:bg-slate-50`}>
                        <td className="py-2.5 pl-6 pr-2 text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-2 font-semibold text-slate-700">{item.productName}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400 font-medium text-[11px]">{item.unit}</td>
                        <td className="py-2.5 pl-2 pr-6 text-right">
                          <span className="font-extrabold text-primary text-sm">
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expand/Collapse Items Toggle */}
              {selectedReq.items.length > 5 && (
                <button
                  onClick={() => setExpandedPreview(!expandedPreview)}
                  className="w-full px-6 py-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer border-b"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedPreview ? 'rotate-180' : ''}`} />
                  {expandedPreview ? 'Ver menos filas' : `Ver todas las ${selectedReq.items.length} filas`}
                </button>
              )}

              {/* Justification / Reason */}
              {selectedReq.reason && (
                <div className="m-6 p-4 bg-amber-50/60 border border-amber-200/40 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block mb-1">Motivo / Justificación</span>
                  <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">
                    &ldquo;{selectedReq.reason}&rdquo;
                  </p>
                </div>
              )}

              {/* Table Footer totals */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Productos: {selectedReq.items.length}</span>
                <span className="text-slate-700">
                  Total unidades: <strong className="text-primary font-black text-sm">{selectedReq.items.reduce((acc, i) => acc + i.quantity, 0)}</strong>
                </span>
              </div>
            </Card>

            {/* Coordinator/Recipient Selection Card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-sm bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Destinatario WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => setIsCoordModalOpen(true)}
                  className="text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Cambiar destinatario</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedCoord ? (
                /* Contact Card Layout */
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {selectedCoord.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{selectedCoord.nombre}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{selectedCoord.telefono}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wide">
                    WhatsApp Listo
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-bold">
                  Ningún coordinador seleccionado. Haz clic en Cambiar para seleccionar uno.
                </div>
              )}
            </Card>

          </div>

          {/* ═══════ COL 2: ACTION BUTTONS & VOUCHER PREVIEW ═══════ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Actions Card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-md overflow-hidden bg-white p-5 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-3">
                Acciones de Envío
              </span>

              <div className="space-y-3">
                
                {/* 1. Main Action: Send Text WhatsApp */}
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!selectedCoord || !selectedReq}
                  className={`w-full flex items-center justify-center gap-2.5 h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] cursor-pointer ${
                    selectedCoord && selectedReq
                      ? 'bg-[#25D366] hover:bg-[#20ba5a] shadow-md shadow-[#25D366]/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  <span>Enviar por WhatsApp</span>
                </button>

                {/* 2. Share Image (Native API) */}
                <button
                  onClick={handleShareImage}
                  disabled={!selectedReq}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs bg-primary/10 hover:bg-primary/15 text-primary transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Comprobante (Imagen)</span>
                </button>

                {/* Grid of helpers: Copy / Download / Copy Text */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Copy Voucher Image */}
                  <button
                    onClick={handleCopyImage}
                    disabled={!selectedReq}
                    className="flex items-center justify-center gap-1.5 h-10 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                    title="Copia el voucher de imagen para pegarlo directamente en WhatsApp (Cmd+V / Ctrl+V)"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span>Copiar Imagen</span>
                  </button>

                  {/* Download Image */}
                  <button
                    onClick={handleDownloadImage}
                    disabled={!selectedReq}
                    className="flex items-center justify-center gap-1.5 h-10 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Bajar Imagen</span>
                  </button>
                  
                  {/* Copy WhatsApp Text */}
                  <button
                    onClick={handleCopyText}
                    disabled={!selectedReq}
                    className="flex items-center justify-center gap-1.5 h-10 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer col-span-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span>Copiar Texto Formateado</span>
                  </button>
                </div>

                {/* Section divider */}
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Documentos PDF</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Print PDF */}
                  <button
                    onClick={handlePrintLocalPDF}
                    disabled={!selectedReq}
                    className="flex items-center justify-center gap-1.5 h-10 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir PDF</span>
                  </button>

                  {/* Download PDF */}
                  <a
                    href={`https://107.172.193.34.nip.io/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 h-10 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-[0.98] text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Bajar Reporte</span>
                  </a>
                </div>

              </div>
            </Card>

            {/* Live Voucher Preview Card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-sm overflow-hidden bg-white p-5 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">
                Vista Previa del Comprobante
              </span>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl gap-2 border border-slate-100">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-400 font-bold">Generando voucher...</span>
                </div>
              ) : imagePreviewUrl ? (
                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 max-h-[360px] overflow-y-auto flex justify-center shadow-inner">
                  <img
                    src={imagePreviewUrl}
                    alt="Voucher Preview"
                    className="max-w-full rounded-lg border border-slate-200 shadow-sm object-contain"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-100">
                  No hay comprobante disponible
                </div>
              )}

              {/* Informative Tip Box */}
              <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-xl flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div className="text-[10px] leading-relaxed font-semibold text-amber-800">
                  <strong className="text-amber-900 block mb-0.5">Tip: Enviar por WhatsApp Web / PC</strong>
                  Presiona el botón <strong className="font-bold">Copiar Imagen</strong>, ve a WhatsApp Web, y pégala directamente presionando <kbd className="bg-amber-100 px-1 py-0.5 rounded border border-amber-200">Ctrl + V</kbd> o <kbd className="bg-amber-100 px-1 py-0.5 rounded border border-amber-200">Cmd + V</kbd> en el chat.
                </div>
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* ═══════ MODAL: SELECT REQUEST (PEDIDO) ═══════ */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-clinical-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-view-enter">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-[#006156] uppercase tracking-wide flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Seleccionar Solicitud
              </h3>
              <button
                onClick={() => setIsReqModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search, Filter & Sort */}
            <div className="p-5 border-b border-slate-100 space-y-4 bg-white">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por solicitante, ID, producto..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-slate-50/50"
                />
                {searchOrderQuery && (
                  <button
                    onClick={() => setSearchOrderQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
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
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
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

              {/* Sorting toolbar */}
              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[10px]">
                <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Ordenar por:
                </span>
                {([['date', 'Fecha'], ['user', 'Solicitante'], ['items', 'Items'], ['status', 'Estado']] as [SortKey, string][]).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
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

            {/* Request list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 bg-slate-50/20">
              {processedRequests.length === 0 ? (
                <div className="text-center py-12 px-5">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No se encontraron solicitudes</p>
                </div>
              ) : (
                processedRequests.map((req) => {
                  const isSelected = selectedReqId === req.idPublico || selectedReqId === req.id;
                  const si = getStatusInfo(req.status);
                  return (
                    <button
                      key={req.idPublico || req.id}
                      onClick={() => {
                        setSelectedReqId(req.idPublico || req.id);
                        setIsReqModalOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-colors cursor-pointer border-l-4 ${
                        isSelected 
                          ? 'bg-primary-light/30 border-l-primary' 
                          : 'bg-white hover:bg-slate-50 border-l-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                            {req.user}
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${si.bg} ${si.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                          <span>Pedido N° #{req.id.toUpperCase()}</span>
                          <span>•</span>
                          <span>{req.date.split(' ')[0]}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-bold">{req.items.length} productos</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Footer summary */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-semibold">
              Mostrando {processedRequests.length} de {requests.length} solicitudes de insumos
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODAL: SELECT COORDINATOR (DESTINATARIO) ═══════ */}
      {isCoordModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-clinical-lg w-full max-w-md overflow-hidden flex flex-col max-h-[75vh] animate-view-enter">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-secondary uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" /> Seleccionar Coordinador
              </h3>
              <button
                onClick={() => setIsCoordModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coordinators List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1.5 bg-slate-50/30">
              {coordinators.map((c) => {
                const isSelected = String(selectedCoordId) === String(c.id);
                const initials = c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCoordId(String(c.id));
                      setIsCoordModalOpen(false);
                    }}
                    className={`w-full text-left p-3.5 flex items-center gap-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-secondary/5 border-secondary/30 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {/* Circle Avatar */}
                    <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs shrink-0 shadow-sm transition-colors ${
                      isSelected ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-slate-800 text-sm block leading-tight">{c.nombre}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">{c.telefono}</span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-semibold">
              {coordinators.length} destinatarios disponibles
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
