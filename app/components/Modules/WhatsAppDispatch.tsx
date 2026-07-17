'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Portal } from '../UI';
import { 
  Printer, 
  Download, 
  Share2, 
  FileText, 
  Check, 
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  Clock,
  ArrowUpDown,
  X,
  Copy
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

/* ────────────────────── helpers: text wrapping for canvas ────────────────────── */
const getWrappedLinesCount = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number => {
  const words = text.split(' ');
  let line = '';
  let count = 1;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      line = words[n] + ' ';
      count++;
    } else {
      line = testLine;
    }
  }
  return count;
};

const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
};

/* ────────────────────── helper: canvas image generation ────────────────────── */
const generateRequestImage = (req: RequestItem): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const logoImg = new Image();
    logoImg.src = '/logo.svg';
    
    logoImg.onload = () => {
      drawCanvas(logoImg);
    };
    logoImg.onerror = () => {
      drawCanvas(null);
    };

    function drawCanvas(logo: HTMLImageElement | null) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const width = 600;
      
      // Calculate heights dynamically
      const headerHeight = 110;
      const infoHeight = 45; // reduced since we removed Cargo/Destino space
      const sectionTitleHeight = 35;
      const tableHeaderHeight = 30;
      const rowHeight = 26;
      const tableFooterHeight = 35;

      // Calculate reason text wrapping height
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.font = 'italic 11px Inter, system-ui, -apple-system, sans-serif';
      const reasonText = req.reason ? `"${req.reason}"` : '';
      const reasonLinesCount = req.reason ? getWrappedLinesCount(tempCtx, reasonText, 500) : 0;
      const reasonHeight = req.reason ? 30 + (reasonLinesCount * 16) : 0;

      const spaceBeforeFooter = 25;
      const footerHeight = 55;

      const height = headerHeight + infoHeight + sectionTitleHeight + tableHeaderHeight + 
                     (req.items.length * rowHeight) + tableFooterHeight + reasonHeight + 
                     spaceBeforeFooter + footerHeight;

      const scale = 4;
      canvas.width = width * scale;
      canvas.height = height * scale;

      // Scale drawing context for retina sharpness
      ctx.scale(scale, scale);

      // Reset styles
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header Logo Icon
      if (logo) {
        ctx.drawImage(logo, 30, 30, 40, 40);
      } else {
        // Fallback vector icon
        ctx.fillStyle = '#006156';
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(47, 38, 6, 24);
        ctx.fillRect(38, 47, 24, 6);
      }

      // Brand Name Text (centered vertically relative to the 40px logo)
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 22px Inter, system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('DULCE ESPERA', 84, 50);
      ctx.textBaseline = 'alphabetic'; // restore baseline

      // Top Right Metadata
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`N° LISTA: ${req.id.toUpperCase()}`, 570, 38);
      ctx.fillText(`FECHA: ${req.date}`, 570, 54);
      
      ctx.fillStyle = '#006156';
      ctx.fillText(`ESTADO: ${req.status.toUpperCase()}`, 570, 70);
      ctx.textAlign = 'left'; // reset

      // Thick teal header divider line
      ctx.strokeStyle = '#006156';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(30, 92);
      ctx.lineTo(570, 92);
      ctx.stroke();

      // Info section (Solicitado por)
      let currentY = 118;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText('Solicitado por:', 30, currentY);

      ctx.fillStyle = '#475569';
      ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(req.user, 115, currentY);

      // Section title
      currentY = 155;
      ctx.fillStyle = '#39ADA3';
      ctx.fillRect(30, currentY - 11, 3, 14);

      ctx.fillStyle = '#006156';
      ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText('PRODUCTOS SOLICITADOS', 40, currentY);

      // Table Header
      currentY = 186;
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
      
      ctx.textAlign = 'center';
      ctx.fillText('N°', 42, currentY);
      
      ctx.textAlign = 'left';
      ctx.fillText('Descripción del Insumo', 70, currentY);
      
      ctx.textAlign = 'center';
      ctx.fillText('Unidad', 440, currentY);
      
      ctx.textAlign = 'right';
      ctx.fillText('Cant.', 570, currentY);
      ctx.textAlign = 'left'; // reset

      // Table Header divider line
      ctx.strokeStyle = '#006156';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 194);
      ctx.lineTo(570, 194);
      ctx.stroke();

      currentY = 214;

      // Items
      req.items.forEach((item: any, idx: number) => {
        // Continuous Alternating background rows (no gaps!)
        if (idx % 2 === 1) {
          ctx.fillStyle = '#f8fafb';
          ctx.fillRect(30, currentY - 18, 540, 26);
        }
        
        // Index
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(idx + 1), 42, currentY);
        
        // Product Name
        ctx.fillStyle = '#0f172a';
        ctx.font = '600 11px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        let pName = item.productName || 'Producto';
        if (pName.length > 44) pName = pName.slice(0, 41) + '...';
        ctx.fillText(pName, 70, currentY);

        // Unit
        ctx.fillStyle = '#64748b';
        ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.unit || 'uds', 440, currentY);

        // Quantity
        ctx.fillStyle = '#006156';
        ctx.font = 'bold 12px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(item.quantity), 570, currentY);

        ctx.textAlign = 'left'; // reset
        currentY += rowHeight;
      });

      // Divider line before total
      ctx.strokeStyle = '#006156';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, currentY - 12);
      ctx.lineTo(570, currentY - 12);
      ctx.stroke();

      // Summary Box
      ctx.beginPath();
      ctx.roundRect(30, currentY - 8, 540, 28, 6);
      ctx.fillStyle = '#f0faf9';
      ctx.fill();
      
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`TOTAL: ${req.items.length} producto${req.items.length !== 1 ? 's' : ''}`, 40, currentY + 10);

      const totalUnits = req.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      ctx.textAlign = 'right';
      ctx.fillText(String(totalUnits), 570, currentY + 10);
      ctx.textAlign = 'left'; // reset

      currentY += tableFooterHeight;

      // Reason Box (wrapped correctly with rounded corners)
      if (req.reason) {
        currentY += 15;
        
        ctx.beginPath();
        ctx.roundRect(30, currentY - 15, 540, reasonHeight - 15, 6);
        ctx.fillStyle = '#f0faf9';
        ctx.fill();

        ctx.fillStyle = '#39ADA3';
        ctx.fillRect(30, currentY - 15, 3, reasonHeight - 15);

        ctx.fillStyle = '#006156';
        ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillText('Motivo / Justificación', 46, currentY);

        ctx.fillStyle = '#334155';
        ctx.font = 'italic 11px Inter, system-ui, -apple-system, sans-serif';
        
        // Draw the wrapped text inside the box
        drawWrappedText(ctx, reasonText, 46, currentY + 18, 500, 16);

        currentY += reasonHeight;
      }

      // Space before footer
      currentY += spaceBeforeFooter;

      // Footer copyright
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, currentY);
      ctx.lineTo(570, currentY);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 8px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`© ${new Date().getFullYear()} Dulce Espera — Lista de control de insumos.`, width / 2, currentY + 18);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas generated null blob'));
        }
      }, 'image/png');
    }
  });
};

/* ────────────────────── component ────────────────────── */
export default function WhatsAppDispatch() {
  const { requests } = useApp();

  /* selection ids */
  const [selectedReqId, setSelectedReqId] = useState('');

  /* modal state */
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);

  /* search / filter / sort (inside Request selection modal) */
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ui states */
  const [canShare, setCanShare] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when request selection modal is open
  useEffect(() => {
    if (!isReqModalOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isReqModalOpen]);

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

  /* derived data */
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId) as RequestItem | undefined;

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
          text: `Reporte de insumos de ${selectedReq.user}`
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



  /* ─── Print PDF / Save as PDF ─── */
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
            <div style="font-size:20px;font-weight:800;color:#006156;letter-spacing:-.5px;line-height:1">DULCE ESPERA</div>
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
    <div className="animate-fade-in w-full max-w-[1200px] mx-auto pb-24 md:pb-8 space-y-6">
      
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
              Genera y comparte reportes oficiales de insumos en formato de PDF e Imagen
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
          
          {/* ═══════ COL 1: SELECTED ORDER DETAIL ═══════ */}
          <div className="lg:col-span-8 space-y-6">
            
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

          </div>

          {/* ═══════ COL 2: ACTION BUTTONS ═══════ */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Actions Card */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-clinical-md overflow-hidden bg-white p-5 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-3">
                Compartir y Descargar
              </span>

              <div className="space-y-3">
                
                {/* 1. Main Action: Share Image (Native API) */}
                <button
                  onClick={handleShareImage}
                  disabled={!selectedReq}
                  className={`w-full flex items-center justify-center gap-2.5 h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] cursor-pointer bg-primary hover:bg-primary-hover shadow-md shadow-primary/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  <Share2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Compartir Imagen</span>
                </button>

                {/* 2. Secondary Action: Download Image */}
                <button
                  onClick={handleDownloadImage}
                  disabled={!selectedReq}
                  className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary-hover text-white transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-secondary/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Download className="w-5 h-5 text-white" />
                  <span>Descargar Imagen</span>
                </button>

                {/* Section divider */}
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Documentos Oficiales</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Download PDF (Backend Link) */}
                  <a
                    href={selectedReq ? `${process.env.NEXT_PUBLIC_API_URL || 'https://107.172.193.34.nip.io'}/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte/pdf` : '#'}
                    download={`Pedido_${selectedReq?.id?.toUpperCase()}.pdf`}
                    className={`w-full flex items-center justify-center gap-2 h-12 border-2 border-primary text-primary hover:bg-primary-light font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center ${!selectedReq ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200' : ''}`}
                  >
                    <Download className="w-4 h-4 text-primary shrink-0" />
                    <span className="ml-1">Descargar PDF</span>
                  </a>

                  {/* Print PDF (Local print window) */}
                  <button
                    onClick={handlePrintLocalPDF}
                    disabled={!selectedReq}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-secondary hover:bg-secondary-hover text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-secondary/15 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4 text-white shrink-0" />
                    <span className="ml-1">Imprimir PDF</span>
                  </button>
                </div>

              </div>
            </Card>

          </div>

        </div>
      )}

      {/* ═══════ MODAL: SELECT REQUEST (PEDIDO) ═══════ */}
      {isReqModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-clinical-lg w-full max-w-md overflow-hidden flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[85dvh] animate-view-enter">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
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
            <div className="p-3 sm:p-4 border-b border-slate-100 space-y-3 bg-white shrink-0">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por solicitante, ID, producto..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-slate-50/50"
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

              {/* Status Filters (Horizontal Scroll on Mobile) */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-primary text-white border-primary shadow-sm'
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
                      type="button"
                      key={s}
                      onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
                        statusFilter === s
                          ? `${si.bg} ${si.text} border-current shadow-sm`
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {s} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Sorting toolbar */}
              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[10px] overflow-x-auto scrollbar-hide py-0.5">
                <span className="text-slate-400 font-bold mr-1 flex items-center gap-1 shrink-0">
                  <ArrowUpDown className="w-3 h-3" /> Orden:
                </span>
                {([['date', 'Fecha'], ['user', 'Solicitante'], ['items', 'Items'], ['status', 'Estado']] as [SortKey, string][]).map(([k, label]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => toggleSort(k)}
                    className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
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
                      className={`w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 transition-colors cursor-pointer border-l-4 ${
                        isSelected 
                          ? 'bg-primary-light/30 border-l-primary' 
                          : 'bg-white hover:bg-slate-50 border-l-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-800">
                            {req.user}
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${si.bg} ${si.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                          <span>N° #{req.id.slice(0, 8).toUpperCase()}</span>
                          <span>•</span>
                          <span>{req.date.split(' ')[0]}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-bold">{req.items.length} prod.</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Footer summary */}
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-semibold shrink-0">
              Mostrando {processedRequests.length} de {requests.length} solicitudes de insumos
            </div>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}
