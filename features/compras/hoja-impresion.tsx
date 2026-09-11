import { agruparPorCanal, resumenLineas } from '@/lib/domain/derivados';
import type { Pedido } from '@/lib/domain/tipos';
import { formatoCantidad, formatoFechaHora, hoyISO, formatoFecha } from '@/lib/formato';

/** Hoja de compras optimizada para papel: solo se muestra al imprimir. */
export function HojaImpresion({ pedido }: { pedido: Pedido }) {
  const grupos = agruparPorCanal(pedido.lineas).filter((g) => g.lineas.length > 0);

  return (
    <div className="hidden print:block">
      <header style={{ borderBottom: '2px solid #006156', paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 600, color: '#006156', margin: 0 }}>CLÍNICA MONTALVO</h1>
        <p style={{ fontSize: '9pt', color: '#475569', margin: '2pt 0 0' }}>
          Dulce Espera · Hoja de compras de cocina
        </p>
        <p style={{ fontSize: '11pt', fontWeight: 600, margin: '10pt 0 0' }}>Pedido {pedido.folio}</p>
        <p style={{ fontSize: '9pt', color: '#475569', margin: '2pt 0 0' }}>
          {formatoFechaHora(pedido.fecha)} · Solicita: {pedido.solicitante} · Impreso el {formatoFecha(hoyISO())}
        </p>
      </header>

      {pedido.motivo && (
        <p style={{ fontSize: '9pt', borderLeft: '3px solid #006156', padding: '6pt 10pt', background: '#f8fafc' }}>
          <strong>Motivo:</strong> {pedido.motivo}
        </p>
      )}

      {grupos.map((grupo) => (
        <section key={grupo.canal.id} style={{ marginTop: 14 }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#006156', margin: '0 0 4pt' }}>
            {grupo.canal.nombre.toUpperCase()} ({grupo.lineas.length})
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: '8%', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>#</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Insumo</th>
                <th style={{ width: '22%', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Categoría</th>
                <th style={{ width: '18%', textAlign: 'right', borderBottom: '1px solid #cbd5e1' }}>Cantidad</th>
                <th style={{ width: '12%', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>Comprado</th>
              </tr>
            </thead>
            <tbody>
              {grupo.lineas.map((linea, indice) => (
                <tr key={linea.id}>
                  <td style={{ borderBottom: '1px solid #e2e8f0', padding: '3pt 0' }}>{indice + 1}</td>
                  <td style={{ borderBottom: '1px solid #e2e8f0', padding: '3pt 0' }}>{linea.nombre}</td>
                  <td style={{ borderBottom: '1px solid #e2e8f0', padding: '3pt 0', color: '#475569' }}>
                    {linea.categoria}
                  </td>
                  <td style={{ borderBottom: '1px solid #e2e8f0', padding: '3pt 0', textAlign: 'right' }}>
                    {formatoCantidad(linea.cantidad)} {linea.presentacion}
                  </td>
                  <td style={{ borderBottom: '1px solid #e2e8f0', padding: '3pt 0', textAlign: 'center' }}>[ ]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <p style={{ marginTop: 16, fontSize: '9pt', fontWeight: 600 }}>Total: {resumenLineas(pedido.lineas)}</p>

      <div style={{ display: 'flex', gap: 40, marginTop: 42 }}>
        <span style={{ flex: 1, borderTop: '1px solid #cbd5e1', paddingTop: 4, fontSize: '8pt', color: '#475569' }}>
          Gobernanta / Compras
        </span>
        <span style={{ flex: 1, borderTop: '1px solid #cbd5e1', paddingTop: 4, fontSize: '8pt', color: '#475569' }}>
          Recepción en cocina
        </span>
      </div>
    </div>
  );
}
