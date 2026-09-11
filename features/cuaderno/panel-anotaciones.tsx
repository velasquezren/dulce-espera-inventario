'use client';

import { useState } from 'react';
import { NotebookPen, Send, Trash2, Zap } from 'lucide-react';
import { Boton, BotonIcono } from '@/components/ui/boton';
import { Area } from '@/components/ui/campo';
import { Contador } from '@/components/ui/contador';
import { Confirmacion } from '@/components/ui/dialogo';
import { Vacio } from '@/components/ui/estados';
import { Tarjeta } from '@/components/ui/superficie';
import { pluralizar } from '@/lib/texto';
import type { Anotacion } from '@/lib/hooks/use-cuaderno';

interface Props {
  anotaciones: Anotacion[];
  motivo: string;
  alCambiarMotivo: (valor: string) => void;
  alCambiarCantidad: (insumoId: string, cantidad: number) => void;
  alQuitar: (insumoId: string) => void;
  alEnviarTodo: () => Promise<void>;
  alEnviarUno: (anotacion: Anotacion) => Promise<void>;
  alVerCatalogo: () => void;
  enviando: boolean;
}

export function PanelAnotaciones({
  anotaciones,
  motivo,
  alCambiarMotivo,
  alCambiarCantidad,
  alQuitar,
  alEnviarTodo,
  alEnviarUno,
  alVerCatalogo,
  enviando,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [urgente, setUrgente] = useState<Anotacion | null>(null);

  if (anotaciones.length === 0) {
    return (
      <Vacio
        titulo="El cuaderno esta vacio"
        descripcion="Busca los insumos en el catalogo y anota las cantidades que hacen falta en cocina."
        icono={<NotebookPen className="size-8" aria-hidden />}
        accion={<Boton onClick={alVerCatalogo}>Ir al catalogo</Boton>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Tarjeta relleno="ninguno">
        <ul className="divide-y divide-line">
          {anotaciones.map((anotacion) => (
            <li key={anotacion.insumoId} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-ink">{anotacion.nombre}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{anotacion.presentacion}</p>
              </div>

              <Contador
                valor={anotacion.cantidad}
                minimo={1}
                alCambiar={(valor) => alCambiarCantidad(anotacion.insumoId, valor)}
                etiqueta={anotacion.nombre}
                tamano="sm"
              />

              <div className="flex items-center gap-1">
                <BotonIcono
                  etiqueta={`Enviar solo ${anotacion.nombre} como pedido urgente`}
                  tamano="sm"
                  onClick={() => setUrgente(anotacion)}
                  disabled={enviando}
                >
                  <Zap className="size-4" aria-hidden />
                </BotonIcono>
                <BotonIcono
                  etiqueta={`Quitar ${anotacion.nombre} del cuaderno`}
                  tamano="sm"
                  onClick={() => alQuitar(anotacion.insumoId)}
                  disabled={enviando}
                  className="text-critico hover:bg-critico-soft"
                >
                  <Trash2 className="size-4" aria-hidden />
                </BotonIcono>
              </div>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta>
        <Area
          etiqueta="Motivo del pedido"
          ayuda="Opcional. Se incluye en el reporte que recibe gobernanta."
          placeholder="Ej. Reabastecimiento semanal de cocina y dietas blandas."
          value={motivo}
          onChange={(e) => alCambiarMotivo(e.target.value)}
          maxLength={500}
          disabled={enviando}
        />
      </Tarjeta>

      <div className="flex flex-col items-center gap-2 pt-1">
        <Boton tamano="lg" onClick={() => setConfirmando(true)} cargando={enviando} className="w-full sm:w-auto sm:min-w-72">
          <Send className="size-4" aria-hidden />
          Enviar lista completa
        </Boton>
        <p className="text-center text-xs text-ink-muted">
          Se registra un solo pedido con {anotaciones.length}{' '}
          {pluralizar(anotaciones.length, 'insumo anotado', 'insumos anotados')}.
        </p>
      </div>

      <Confirmacion
        abierto={confirmando}
        alCerrar={() => setConfirmando(false)}
        alConfirmar={async () => {
          setConfirmando(false);
          await alEnviarTodo();
        }}
        titulo="Enviar el cuaderno"
        mensaje={`Se enviara a gobernanta un pedido con ${anotaciones.length} ${pluralizar(anotaciones.length, 'insumo', 'insumos')}. Despues de enviarlo no podras editarlo desde la aplicacion.`}
        textoConfirmar="Enviar pedido"
        procesando={enviando}
      />

      <Confirmacion
        abierto={urgente !== null}
        alCerrar={() => setUrgente(null)}
        alConfirmar={async () => {
          const seleccion = urgente;
          setUrgente(null);
          if (seleccion) await alEnviarUno(seleccion);
        }}
        titulo="Pedido urgente individual"
        mensaje={
          urgente
            ? `Se enviara un pedido aparte con ${urgente.cantidad} ${urgente.presentacion} de ${urgente.nombre}.`
            : ''
        }
        textoConfirmar="Enviar ahora"
        procesando={enviando}
      />
    </div>
  );
}
