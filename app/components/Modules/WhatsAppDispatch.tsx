'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Portal, useToast } from '../UI';
import { RequestItem, Product } from '../../lib/mockData';
import AudioPlayer from '../AudioPlayer';
import {
  Printer,
  Download,
  Share2,
  FileText,
  Search,
  ChevronDown,
  Package,
  Clock,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  List,
  CheckCircle2,
  User,
  Filter
} from 'lucide-react';

/* ────────────────────── types & configs ────────────────────── */
type SortKey = 'date' | 'user' | 'items' | 'status';
type SortDir = 'asc' | 'desc';
type TableViewMode = 'channels' | 'flat';

export interface ChannelGroup {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const CHANNELS_CONFIG: ChannelGroup[] = [
  {
    id: 'Mercado',
    name: 'Plaza de Mercado',
    subtitle: 'Perecederos, Carnes, Frutas y Verduras frescas',
    color: '#b45309',
    badgeBg: 'bg-amber-50 border-amber-200/80',
    badgeText: 'text-amber-800'
  },
  {
    id: 'Super Mercado',
    name: 'Supermercado y Abarrotes',
    subtitle: 'Secos, Lácteos industriales, Granos y Limpieza',
    color: '#006156',
    badgeBg: 'bg-[#e6f0ef] border-[#39ADA3]/40',
    badgeText: 'text-[#006156]'
  },
  {
    id: 'Proveedor',
    name: 'Proveedores Directos',
    subtitle: 'Distribuidoras, Panadería, Kéfir y Especiales',
    color: '#4338ca',
    badgeBg: 'bg-indigo-50 border-indigo-200/80',
    badgeText: 'text-indigo-800'
  },
  {
    id: 'Otros',
    name: 'Otros Insumos y Servicios',
    subtitle: 'Descartables, envases y consumos varios',
    color: '#475569',
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-700'
  }
];

export function resolveItemChannel(item: { productName: string; group?: string }, products: Product[]): string {
  if (item.group && item.group.trim()) {
    const g = item.group.trim();
    if (g.toLowerCase() === 'mercado') return 'Mercado';
    if (g.toLowerCase() === 'super mercado' || g.toLowerCase() === 'supermercado' || g.toLowerCase() === 'super') return 'Super Mercado';
    if (g.toLowerCase() === 'proveedor') return 'Proveedor';
    return g;
  }
  const found = products.find(p => p.name.toLowerCase() === (item.productName || '').toLowerCase());
  if (found && found.group) {
    return found.group;
  }
  const name = (item.productName || '').toLowerCase();
  if (name.includes('pollo') || name.includes('carne') || name.includes('tomate') || name.includes('cebolla') || name.includes('papa') || name.includes('lechuga') || name.includes('repollo') || name.includes('verdura') || name.includes('fruta') || name.includes('pescado') || name.includes('cerdo') || name.includes('res') || name.includes('huevo') || name.includes('limon')) {
    return 'Mercado';
  }
  if (name.includes('distribuidora') || name.includes('panaderia') || name.includes('panadería') || name.includes('kefir') || name.includes('kéfir')) {
    return 'Proveedor';
  }
  if (name.includes('descartable') || name.includes('limpieza') || name.includes('bolsa') || name.includes('servilleta')) {
    return 'Otros';
  }
  return 'Super Mercado';
}

export function resolveItemCategory(item: { productName: string }, products: Product[]): string {
  const found = products.find(p => p.name.toLowerCase() === (item.productName || '').toLowerCase());
  if (found && found.category) {
    return found.category;
  }
  const name = (item.productName || '').toLowerCase();
  if (name.includes('pollo') || name.includes('carne') || name.includes('pescado') || name.includes('cerdo') || name.includes('res') || name.includes('huevo') || name.includes('jamon') || name.includes('salchicha')) {
    return 'Carnes y Proteínas';
  }
  if (name.includes('tomate') || name.includes('cebolla') || name.includes('papa') || name.includes('lechuga') || name.includes('repollo') || name.includes('zanahoria') || name.includes('verdura')) {
    return 'Verduras y Hortalizas';
  }
  if (name.includes('fruta') || name.includes('manzana') || name.includes('naranja') || name.includes('platano')) {
    return 'Frutas';
  }
  if (name.includes('leche') || name.includes('queso') || name.includes('mantequilla') || name.includes('yogur')) {
    return 'Lácteos';
  }
  if (name.includes('arroz') || name.includes('fideo') || name.includes('harina') || name.includes('quinua') || name.includes('avena')) {
    return 'Granos y Cereales';
  }
  return 'Abarrotes y Varios';
}

/* ────────────────────── canvas helpers ────────────────────── */
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

/* ────────────────────── canvas image generation ────────────────────── */
const generateRequestImage = (req: RequestItem, products: Product[]): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const logoImg = new Image();
    logoImg.src = '/logo.svg';

    logoImg.onload = () => drawCanvas(logoImg);
    logoImg.onerror = () => drawCanvas(null);

    function drawCanvas(logo: HTMLImageElement | null) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const width = 640;

      // Group items by channel
      const groupedChannels = CHANNELS_CONFIG.map(cfg => {
        const items = req.items.filter(it => resolveItemChannel(it, products) === cfg.id);
        return {
          ...cfg,
          items,
          totalUnits: items.reduce((acc, it) => acc + it.quantity, 0)
        };
      }).filter(c => c.items.length > 0);

      const headerHeight = 115;
      const infoHeight = 45;
      const channelHeaderHeight = 32;
      const tableThHeight = 24;
      const rowHeight = 24;
      const subtotalHeight = 26;

      let tablesHeight = 0;
      groupedChannels.forEach(c => {
        tablesHeight += channelHeaderHeight + tableThHeight + (c.items.length * rowHeight) + subtotalHeight + 14;
      });

      // Reason height
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.font = 'italic 11px Inter, system-ui, -apple-system, sans-serif';
      const reasonText = req.reason ? `"${req.reason}"` : '';
      const reasonLinesCount = req.reason ? getWrappedLinesCount(tempCtx, reasonText, 540) : 0;
      const reasonHeight = req.reason ? 34 + (reasonLinesCount * 16) : 0;

      const grandTotalHeight = 38;
      const signaturesHeight = 70;
      const footerHeight = 40;

      const height = headerHeight + infoHeight + tablesHeight + grandTotalHeight + reasonHeight + signaturesHeight + footerHeight;

      const scale = 4;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header Logo
      if (logo) {
        ctx.drawImage(logo, 30, 26, 42, 42);
      } else {
        ctx.fillStyle = '#006156';
        ctx.beginPath();
        ctx.arc(51, 47, 21, 0, Math.PI * 2);
        ctx.fill();
      }

      // Header Titles
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 20px Inter, system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('CLÍNICA MONTALVO — DULCE ESPERA', 84, 42);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText('ORDEN OFICIAL DE COMPRAS Y DESPACHO DE INSUMOS', 84, 58);

      // Top Right Info
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`PEDIDO: #${req.id.toUpperCase()}`, 610, 38);
      ctx.font = '500 10px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`Fecha: ${req.date}`, 610, 52);
      ctx.fillStyle = '#006156';
      ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`ESTADO: ${req.status.toUpperCase()}`, 610, 66);
      ctx.textAlign = 'left';

      // Header Divider
      ctx.strokeStyle = '#006156';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(30, 84);
      ctx.lineTo(610, 84);
      ctx.stroke();

      // Info Meta Row
      let currentY = 106;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText('Solicitado por:', 30, currentY);
      ctx.fillStyle = '#475569';
      ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(req.user, 120, currentY);

      currentY = 135;

      // Draw Channel Tables
      let itemGlobalIdx = 1;
      groupedChannels.forEach(c => {
        // Channel Banner Bar
        ctx.fillStyle = c.color;
        ctx.fillRect(30, currentY, 580, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillText(c.name.toUpperCase(), 40, currentY + 16);

        ctx.textAlign = 'right';
        ctx.font = '500 9px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillText(`${c.items.length} insumos | ${c.totalUnits} uds`, 600, currentY + 16);
        ctx.textAlign = 'left';

        currentY += 28;

        // Table Header
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(30, currentY, 580, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N°', 45, currentY + 14);
        ctx.textAlign = 'left';
        ctx.fillText('Descripción del Insumo', 70, currentY + 14);
        ctx.fillText('Categoría', 360, currentY + 14);
        ctx.textAlign = 'center';
        ctx.fillText('Unidad', 490, currentY + 14);
        ctx.textAlign = 'right';
        ctx.fillText('Cant.', 595, currentY + 14);
        ctx.textAlign = 'left';

        currentY += 20;

        // Item rows
        c.items.forEach((item, idx) => {
          if (idx % 2 === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(30, currentY, 580, rowHeight);
          }

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(itemGlobalIdx++), 45, currentY + 16);

          ctx.fillStyle = '#0f172a';
          ctx.font = '600 10px Inter, system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          let pName = item.productName || 'Producto';
          if (pName.length > 40) pName = pName.slice(0, 38) + '...';
          ctx.fillText(pName, 70, currentY + 16);

          const catName = resolveItemCategory(item, products);
          ctx.fillStyle = '#64748b';
          ctx.font = '500 9px Inter, system-ui, -apple-system, sans-serif';
          ctx.fillText(catName, 360, currentY + 16);

          ctx.textAlign = 'center';
          ctx.fillText(item.unit || 'uds', 490, currentY + 16);

          ctx.fillStyle = c.color;
          ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(String(item.quantity), 595, currentY + 16);

          ctx.textAlign = 'left';

          // Bottom cell line
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(30, currentY + rowHeight);
          ctx.lineTo(610, currentY + rowHeight);
          ctx.stroke();

          currentY += rowHeight;
        });

        // Subtotal row
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(30, currentY, 580, subtotalHeight);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`SUBTOTAL ${c.name.toUpperCase()}:`, 490, currentY + 17);

        ctx.fillStyle = c.color;
        ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillText(String(c.totalUnits), 595, currentY + 17);
        ctx.textAlign = 'left';

        currentY += subtotalHeight + 14;
      });

      // Grand Total Box
      ctx.beginPath();
      ctx.roundRect(30, currentY, 580, 30, 6);
      ctx.fillStyle = '#e6f0ef';
      ctx.fill();
      ctx.strokeStyle = '#006156';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#006156';
      ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`TOTAL PEDIDO: ${req.items.length} productos solicitados`, 45, currentY + 19);

      const grandTotalUnits = req.items.reduce((acc, it) => acc + it.quantity, 0);
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`${grandTotalUnits} unidades`, 595, currentY + 20);
      ctx.textAlign = 'left';

      currentY += 40;

      // Justification Box
      if (req.reason) {
        ctx.beginPath();
        ctx.roundRect(30, currentY, 580, reasonHeight - 10, 6);
        ctx.fillStyle = '#fefce8';
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillText('MOTIVO / JUSTIFICACIÓN:', 45, currentY + 16);

        ctx.fillStyle = '#451a03';
        ctx.font = 'italic 10px Inter, system-ui, -apple-system, sans-serif';
        drawWrappedText(ctx, reasonText, 45, currentY + 30, 540, 15);

        currentY += reasonHeight + 6;
      }

      // Signatures
      currentY += 24;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(60, currentY);
      ctx.lineTo(260, currentY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(380, currentY);
      ctx.lineTo(580, currentY);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Firma Solicitante Cocina', 160, currentY + 14);
      ctx.fillText('Firma Gobernanta / Compras', 480, currentY + 14);

      // Footer
      currentY += 34;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 8px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`© ${new Date().getFullYear()} Dulce Espera — Documento oficial de despacho y adquisiciones.`, width / 2, currentY + 10);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas generated null blob'));
      }, 'image/png');
    }
  });
};

/* ────────────────────── component ────────────────────── */
export default function WhatsAppDispatch() {
  const { requests, products } = useApp();
  const { showToast } = useToast();

  const [selectedReqId, setSelectedReqId] = useState('');
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [canShare, setCanShare] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>('channels');
  const [itemSearchFilter, setItemSearchFilter] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://107.172.193.34.nip.io';

  // Lock body scroll when modal is open
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
  const selectedReq = requests.find((r) => r.idPublico === selectedReqId || r.id === selectedReqId);

  /* Breakdown by channels for selected request */
  const channelBreakdown = useMemo(() => {
    if (!selectedReq) return [];
    return CHANNELS_CONFIG.map(cfg => {
      const items = selectedReq.items.filter(it => resolveItemChannel(it, products) === cfg.id);
      return {
        ...cfg,
        items,
        totalUnits: items.reduce((acc, it) => acc + it.quantity, 0)
      };
    });
  }, [selectedReq, products]);

  /* Filtered items within selected order */
  const filteredOrderItems = useMemo(() => {
    if (!selectedReq) return [];
    if (!itemSearchFilter.trim()) return selectedReq.items;
    const q = itemSearchFilter.toLowerCase();
    return selectedReq.items.filter(it =>
      it.productName.toLowerCase().includes(q) ||
      resolveItemCategory(it, products).toLowerCase().includes(q) ||
      resolveItemChannel(it, products).toLowerCase().includes(q)
    );
  }, [selectedReq, itemSearchFilter, products]);

  /* Modal request filtering */
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

  const handleShareImage = async () => {
    if (!selectedReq) return;
    try {
      const blob = await generateRequestImage(selectedReq, products);
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
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      showToast('No se pudo compartir la imagen', 'error');
    }
  };

  const handleDownloadImage = async () => {
    if (!selectedReq) return;
    try {
      const blob = await generateRequestImage(selectedReq, products);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pedido_${selectedReq.id.toUpperCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Imagen descargada correctamente', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al descargar la imagen', 'error');
    }
  };

  /* ─── Print PDF Window ─── */
  const handlePrintLocalPDF = () => {
    if (!selectedReq) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const grandTotalUnits = selectedReq.items.reduce((sum, i) => sum + i.quantity, 0);

    const grouped = CHANNELS_CONFIG.map(cfg => {
      const items = selectedReq.items.filter(it => resolveItemChannel(it, products) === cfg.id);
      return {
        ...cfg,
        items,
        totalUnits: items.reduce((acc, it) => acc + it.quantity, 0)
      };
    }).filter(c => c.items.length > 0);

    let channelTablesHtml = '';
    let itemIdx = 1;

    grouped.forEach(c => {
      const rows = c.items.map(it => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 32px; text-align: center; color: #64748b; font-weight: bold; font-size: 10px; padding: 7px 4px;">${itemIdx++}</td>
          <td style="padding: 7px 8px; font-weight: bold; color: #0f172a; font-size: 11px;">${it.productName}</td>
          <td style="padding: 7px 8px; color: #475569; font-size: 10px;">${resolveItemCategory(it, products)}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 800; color: ${c.color}; font-size: 11px;">${it.quantity}</td>
          <td style="padding: 7px 8px; text-align: center; color: #475569; font-size: 10px;">${it.unit}</td>
          <td style="width: 50px; text-align: center; font-size: 11px; color: #cbd5e1; padding: 7px 4px;">[ &nbsp; ]</td>
        </tr>
      `).join('');

      channelTablesHtml += `
        <div style="margin-top: 18px; margin-bottom: 14px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; background-color: ${c.color}; color: white; padding: 6px 10px; border-radius: 4px; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.04em;">${c.name.toUpperCase()}</span>
            <span style="font-size: 10px; font-weight: 600;">${c.items.length} ítems &bull; ${c.totalUnits} unidades</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 6px 4px; text-align: center; font-size: 9px; color: #475569; text-transform: uppercase;">N°</th>
                <th style="padding: 6px 8px; text-align: left; font-size: 9px; color: #475569; text-transform: uppercase;">Descripción Insumo</th>
                <th style="padding: 6px 8px; text-align: left; font-size: 9px; color: #475569; text-transform: uppercase;">Categoría</th>
                <th style="padding: 6px 8px; text-align: right; font-size: 9px; color: #475569; text-transform: uppercase;">Cant.</th>
                <th style="padding: 6px 8px; text-align: center; font-size: 9px; color: #475569; text-transform: uppercase;">Unidad</th>
                <th style="padding: 6px 4px; text-align: center; font-size: 9px; color: #475569; text-transform: uppercase;">Check</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr style="background-color: #f8fafc; border-top: 1px solid #cbd5e1;">
                <td colspan="3" style="padding: 6px 8px; text-align: right; font-weight: bold; font-size: 10px; color: #0f172a;">SUBTOTAL ${c.name.toUpperCase()}:</td>
                <td style="padding: 6px 8px; text-align: right; font-weight: 800; font-size: 11px; color: ${c.color};">${c.totalUnits}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    });

    const reasonHtml = selectedReq.reason ? `
      <div style="margin-top: 20px; padding: 10px 14px; border-left: 3px solid #d97706; background-color: #fefce8; border-radius: 4px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 2px;">Motivo / Justificación</div>
        <div style="font-size: 11px; color: #451a03; font-style: italic;">&ldquo;${selectedReq.reason}&rdquo;</div>
      </div>
    ` : '';

    printWindow.document.write(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Orden de Compra N° ${selectedReq.id.toUpperCase()} - Dulce Espera</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 28px 36px; color: #0f172a; background: #fff; line-height: 1.4; font-size: 11px; }
        @media print {
          body { padding: 15px 20px; }
          @page { margin: 12mm; size: letter; }
        }
      </style>
    </head>
    <body>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 3px solid #006156; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="/logo.svg" alt="Logo" style="width: 42px; height: 42px; object-fit: contain;" />
          <div>
            <div style="font-size: 19px; font-weight: 900; color: #006156; letter-spacing: -0.5px;">CLÍNICA MONTALVO &mdash; DULCE ESPERA</div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Orden Oficial de Compras y Control de Insumos</div>
          </div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #475569; line-height: 1.6;">
          <div><strong>PEDIDO N°:</strong> #${selectedReq.id.toUpperCase()}</div>
          <div><strong>FECHA:</strong> ${selectedReq.date}</div>
          <div><strong>ESTADO:</strong> <span style="color: #006156; font-weight: 800;">${selectedReq.status.toUpperCase()}</span></div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 12px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div><strong>Solicitado por:</strong> <span style="color: #0f172a; font-weight: bold;">${selectedReq.user}</span></div>
        <div><strong>Total Ítems:</strong> ${selectedReq.items.length} &bull; <strong>Total Unidades:</strong> ${grandTotalUnits}</div>
      </div>

      ${channelTablesHtml}

      ${reasonHtml}

      <div style="display: flex; justify-content: space-between; margin-top: 45px; gap: 40px; page-break-inside: avoid;">
        <div style="flex: 1; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; margin-top: 35px; margin-bottom: 4px;"></div>
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">Firma Solicitante Cocina</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; margin-top: 35px; margin-bottom: 4px;"></div>
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">Firma Gobernanta / Compras</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; margin-top: 35px; margin-bottom: 4px;"></div>
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">Recibido en Cocina (Control Físico)</div>
        </div>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; font-size: 8px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Dulce Espera &mdash; Documento oficial de abastecimiento estructurado por canales de adquisición.
      </div>

      <script>window.onload = function() { window.print(); setTimeout(function() { window.close() }, 500); }<\/script>
    </body>
    </html>`);

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
    <div className="animate-fade-in w-full max-w-[1240px] mx-auto space-y-6 pb-20">

      {/* ═══════ HEADER INSTITUCIONAL ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006156] bg-[#e6f0ef] px-2.5 py-0.5 rounded-md border border-[#39ADA3]/30">
              Módulo de Despacho y Adquisiciones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
            Despacho y Control de Pedidos
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generación de reportes ejecutivos en Excel (.xlsx), PDF de alta resolución e imagen por canal de compra.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>{requests.length} Solicitudes</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{requests.filter(r => r.status === 'Pendiente').length} Pendientes</span>
          </div>
        </div>
      </div>

      {!selectedReq ? (
        /* Empty State */
        <Card className="p-12 border border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center justify-center min-h-[400px] bg-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-base text-slate-700">No hay solicitudes disponibles</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Crea una solicitud de insumos en el formulario para poder emitir los reportes ejecutivos.
          </p>
        </Card>
      ) : (
        /* ═══════ MAIN 2-COLUMN ENTERPRISE LAYOUT ═══════ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═══════ COL 1: SELECTED ORDER DETAIL ═══════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* Request Detail Card */}
            <Card className="border border-slate-200/90 rounded-2xl shadow-clinical-md overflow-hidden bg-white">
              {/* Header with requester and select button */}
              <div className="px-6 py-4 bg-gradient-to-b from-slate-50/90 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#006156]/10 text-[#006156] flex items-center justify-center font-black text-sm shrink-0 border border-[#006156]/20">
                    {selectedReq.user.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                        Solicitud de {selectedReq.user}
                      </h2>
                      {(() => {
                        const si = getStatusInfo(selectedReq.status);
                        return (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${si.bg} ${si.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                            {selectedReq.status}
                          </span>
                        );
                      })()}
                    </div>
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
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-[#006156] bg-white hover:bg-[#e6f0ef]/50 rounded-xl font-bold text-xs text-slate-700 hover:text-[#006156] transition-all cursor-pointer shadow-xs active:scale-98 shrink-0"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cambiar Pedido</span>
                </button>
              </div>

              {/* Channel Summary Badges & View Switcher */}
              <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Canales:</span>
                  {channelBreakdown.map(c => {
                    if (c.items.length === 0) return null;
                    return (
                      <span
                        key={c.id}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${c.badgeBg} ${c.badgeText} flex items-center gap-1.5`}
                      >
                        <span>{c.name}:</span>
                        <strong>{c.items.length}</strong>
                        <span className="text-[10px] opacity-75">({c.totalUnits} uds)</span>
                      </span>
                    );
                  })}
                </div>

                {/* View Mode Toggle: Por Canales vs Lista Plana */}
                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTableViewMode('channels')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      tableViewMode === 'channels'
                        ? 'bg-white text-[#006156] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Por Canales</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableViewMode('flat')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      tableViewMode === 'flat'
                        ? 'bg-white text-[#006156] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista Plana</span>
                  </button>
                </div>
              </div>

              {/* Search Inside Order */}
              {selectedReq.items.length > 6 && (
                <div className="px-6 py-2 border-b border-slate-100 bg-white">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filtrar insumo dentro de este pedido..."
                      value={itemSearchFilter}
                      onChange={(e) => setItemSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-7 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#006156] focus:bg-white text-slate-800"
                    />
                    {itemSearchFilter && (
                      <button
                        onClick={() => setItemSearchFilter('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Items Display: Mode 1: Grouped By Channels */}
              {tableViewMode === 'channels' && (
                <div ref={previewRef} className={`transition-all duration-300 ${expandedPreview ? 'max-h-[800px]' : 'max-h-[380px]'} overflow-y-auto divide-y divide-slate-100`}>
                  {channelBreakdown.map(channel => {
                    const activeItems = channel.items.filter(it =>
                      !itemSearchFilter.trim() ||
                      it.productName.toLowerCase().includes(itemSearchFilter.toLowerCase()) ||
                      resolveItemCategory(it, products).toLowerCase().includes(itemSearchFilter.toLowerCase())
                    );

                    if (activeItems.length === 0) return null;

                    return (
                      <div key={channel.id} className="p-4 sm:p-5 space-y-2.5">
                        {/* Channel Subheader */}
                        <div className="flex items-center justify-between border-l-4 pl-3" style={{ borderColor: channel.color }}>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                              {channel.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {channel.subtitle}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {activeItems.length} ítems &bull; {activeItems.reduce((s, i) => s + i.quantity, 0)} uds
                          </span>
                        </div>

                        {/* Table */}
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 pl-4 pr-2 text-[10px] font-black text-slate-500 uppercase tracking-wider w-8">#</th>
                                <th className="py-2.5 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Insumo</th>
                                <th className="py-2.5 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider w-36">Categoría</th>
                                <th className="py-2.5 px-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider w-20">Unidad</th>
                                <th className="py-2.5 pl-2 pr-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider w-16">Cant.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {activeItems.map((item, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                                  <td className="py-2 pl-4 pr-2 text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                                  <td className="py-2 px-2 font-bold text-slate-800">{item.productName}</td>
                                  <td className="py-2 px-2 text-slate-500 text-[11px]">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                                      {resolveItemCategory(item, products)}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-center text-slate-500 text-[11px]">{item.unit}</td>
                                  <td className="py-2 pl-2 pr-4 text-right">
                                    <span className="font-black text-sm" style={{ color: channel.color }}>
                                      {item.quantity}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items Display: Mode 2: Flat List */}
              {tableViewMode === 'flat' && (
                <div ref={previewRef} className={`transition-all duration-300 ${expandedPreview ? 'max-h-[800px]' : 'max-h-[380px]'} overflow-y-auto`}>
                  <table className="w-full text-xs text-left">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 pl-6 pr-2 text-[10px] font-black text-slate-500 uppercase tracking-wider w-8">#</th>
                        <th className="py-2.5 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Insumo</th>
                        <th className="py-2.5 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider w-32">Canal</th>
                        <th className="py-2.5 px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider w-32">Categoría</th>
                        <th className="py-2.5 px-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider w-20">Unidad</th>
                        <th className="py-2.5 pl-2 pr-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider w-16">Cant.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredOrderItems.map((item, idx) => {
                        const channelId = resolveItemChannel(item, products);
                        const channelCfg = CHANNELS_CONFIG.find(c => c.id === channelId) || CHANNELS_CONFIG[3];
                        return (
                          <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                            <td className="py-2.5 pl-6 pr-2 text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                            <td className="py-2.5 px-2 font-bold text-slate-800">{item.productName}</td>
                            <td className="py-2.5 px-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${channelCfg.badgeBg} ${channelCfg.badgeText}`}>
                                {channelCfg.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-slate-500 text-[11px]">
                              {resolveItemCategory(item, products)}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">{item.unit}</td>
                            <td className="py-2.5 pl-2 pr-6 text-right">
                              <span className="font-extrabold text-[#006156] text-sm">
                                {item.quantity}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Expand/Collapse Items Toggle */}
              {selectedReq.items.length > 6 && (
                <button
                  type="button"
                  onClick={() => setExpandedPreview(!expandedPreview)}
                  className="w-full px-6 py-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-[#006156] hover:bg-[#e6f0ef]/50 transition-colors cursor-pointer border-b"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedPreview ? 'rotate-180' : ''}`} />
                  {expandedPreview ? 'Ver menos filas' : `Ver todas las ${selectedReq.items.length} filas`}
                </button>
              )}

              {/* Justification / Reason */}
              {selectedReq.reason && (
                <div className="m-6 p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block mb-1">Motivo / Justificación</span>
                  <p className="text-xs text-slate-700 font-semibold italic leading-relaxed">
                    &ldquo;{selectedReq.reason}&rdquo;
                  </p>
                </div>
              )}

              {selectedReq.audioUrl && (
                <div className="mx-6 mb-4">
                  <AudioPlayer audioUrl={selectedReq.audioUrl} duration={selectedReq.audioDuration} />
                </div>
              )}

              {/* Table Footer totals */}
              <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Total insumos en solicitud: <strong className="text-slate-800">{selectedReq.items.length}</strong></span>
                <span>
                  Total unidades: <strong className="text-[#006156] font-black text-sm">{selectedReq.items.reduce((acc, i) => acc + i.quantity, 0)}</strong>
                </span>
              </div>
            </Card>

          </div>

          {/* ═══════ COL 2: ACTION BUTTONS (SOFTWARE DE PRIMER NIVEL) ═══════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* Main Action Card */}
            <Card className="border border-slate-200/90 rounded-2xl shadow-clinical-md overflow-hidden bg-white p-5 space-y-5">
              
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2.5">
                  Documentos Oficiales
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Formatos listos para compras, revisión física y auditoría.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. EXCEL OFICIAL (.XLSX) */}
                <a
                  href={selectedReq ? `${API_URL}/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte/excel` : '#'}
                  download={`Orden_Compra_${selectedReq?.id?.toUpperCase()}.xlsx`}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#107C41] hover:bg-[#0e6b37] text-white shadow-md shadow-[#107C41]/20 transition-all active:scale-[0.98] cursor-pointer group ${
                    !selectedReq ? 'pointer-events-none opacity-50 bg-slate-200 text-slate-400' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white/15 text-white shrink-0">
                    <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-white truncate">
                      Descargar Excel Oficial (.xlsx)
                    </div>
                    <div className="text-[10px] text-emerald-100 font-semibold truncate">
                      Celdas formateadas y clasificado por canales
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-white/80 group-hover:translate-y-0.5 transition-transform shrink-0" />
                </a>

                {/* 2. PDF Y LOCAL PRINT EN 2 COLUMNAS */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Download PDF Oficial */}
                  <a
                    href={selectedReq ? `${API_URL}/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte/pdf` : '#'}
                    download={`Pedido_${selectedReq?.id?.toUpperCase()}.pdf`}
                    className={`flex items-center justify-center gap-1.5 h-11 border-2 border-[#006156] text-[#006156] hover:bg-[#e6f0ef] font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer text-center ${
                      !selectedReq ? 'pointer-events-none opacity-50 border-slate-200 text-slate-400 bg-slate-50' : ''
                    }`}
                  >
                    <Download className="w-4 h-4 text-[#006156] shrink-0" />
                    <span>Descargar PDF</span>
                  </a>

                  {/* Print PDF Local */}
                  <button
                    type="button"
                    onClick={handlePrintLocalPDF}
                    disabled={!selectedReq}
                    className="flex items-center justify-center gap-1.5 h-11 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4 text-white shrink-0" />
                    <span>Imprimir PDF</span>
                  </button>
                </div>

                {/* 3. VER INFORME EJECUTIVO WEB */}
                <a
                  href={selectedReq ? `${API_URL}/pedidos/${selectedReq.idPublico || selectedReq.id}/reporte-admin` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#006156] bg-slate-50 hover:bg-white text-slate-700 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer group ${
                    !selectedReq ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#006156] shrink-0" />
                    <span>Ver Reporte Ejecutivo (Web)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006156] transition-colors shrink-0" />
                </a>

                {/* 4. CONSOLIDADO PENDIENTES (.XLSX) */}
                <a
                  href={`${API_URL}/api/pedidos/pendientes/excel`}
                  download={`Consolidado_Pendientes_${new Date().toISOString().slice(0, 10)}.xlsx`}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="text-left">
                      <div>Consolidado Maestro Pendientes (.xlsx)</div>
                      <div className="text-[10px] text-amber-800/80 font-normal">Suma de todos los pedidos por comprar</div>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-amber-700 group-hover:translate-y-0.5 transition-transform shrink-0" />
                </a>
              </div>

              {/* Section divider */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Captura y WhatsApp
                </span>

                <div className="space-y-2">
                  {/* Share Image */}
                  <button
                    type="button"
                    onClick={handleShareImage}
                    disabled={!selectedReq}
                    className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98] cursor-pointer bg-[#006156] hover:bg-[#004d44] shadow-md shadow-[#006156]/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Compartir Imagen por WhatsApp</span>
                  </button>

                  {/* Download Image */}
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={!selectedReq}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all active:scale-[0.98] cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Descargar Imagen (PNG 4K)</span>
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsReqModalOpen(false)}
          />

          {/* Modal Panel */}
          <div
            className="
              fixed z-[10000] inset-0 flex flex-col
              bg-white
              sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
              sm:w-full sm:max-w-md sm:max-h-[85dvh] sm:rounded-2xl sm:shadow-clinical-lg sm:border sm:border-slate-200/80
              animate-sheet-up sm:animate-view-enter
            "
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-10"
              style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
            >
              <h3 className="text-sm font-black text-[#006156] uppercase tracking-wide flex items-center gap-2 truncate">
                <Package className="w-4 h-4 text-[#006156] shrink-0" />
                <span>Seleccionar Solicitud</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReqModalOpen(false)}
                className="w-9 h-9 min-w-[36px] rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Search, Filter & Sort */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/80 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por usuario, ID o insumo..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#006156] text-slate-800"
                />
                {searchOrderQuery && (
                  <button
                    onClick={() => setSearchOrderQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {['all', 'Pendiente', 'Aprobado', 'Comprado', 'Rechazado'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#006156] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Todos' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Request list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100">
              {processedRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No se encontraron solicitudes con los filtros aplicados.
                </div>
              ) : (
                processedRequests.map((req) => {
                  const isSelected = (req.idPublico || req.id) === (selectedReq?.idPublico || selectedReq?.id);
                  const si = getStatusInfo(req.status);
                  return (
                    <button
                      key={req.idPublico || req.id}
                      type="button"
                      onClick={() => {
                        setSelectedReqId(req.idPublico || req.id);
                        setIsReqModalOpen(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#006156] bg-[#e6f0ef]/40 shadow-xs ring-1 ring-[#006156]'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-800 truncate">
                            {req.user}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${si.bg} ${si.text}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          #{req.id.toUpperCase()} &bull; {req.date}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold truncate">
                          {req.items.length} productos &bull; {req.items.reduce((s, i) => s + i.quantity, 0)} unidades
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#006156] text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setIsReqModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </Portal>
      )}

    </div>
  );
}
