import { urlApi } from './cliente';

/** Documentos oficiales generados por el backend (openpyxl / xhtml2pdf). */
export const reportes = {
  excelPedido: (id: string) => urlApi(`/pedidos/${id}/reporte/excel`),
  pdfPedido: (id: string) => urlApi(`/pedidos/${id}/reporte/pdf`),
  excelPendientes: () => urlApi('/api/pedidos/pendientes/excel'),
  /** Una sola lista con todo lo que falta comprar, sumando los insumos repetidos. */
  pdfListaCompras: () => urlApi('/api/compras/pendientes/pdf'),
};
