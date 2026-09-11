'use client';

import { useState } from 'react';
import { NotebookPen, Send, Trash2 } from 'lucide-react';
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
  alEnviar: () => Promise<void>;
  alVerCatalogo: () => void;
  enviando: boolean;
}

export function PanelAnotaciones({
  anotaciones,
  motivo,
  alCambiarMotivo,
  alCambiarCantidad,
  alQuitar,
  alEnviar,
  alVerCatalogo,
  enviando,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);

  if (anotaciones.length === 0) {
    return (
      <Vacio
        titulo="El cuaderno está vacío"
        descripcion="Busca lo que falta en la cocina y anota cuánto necesitas."
        icono={<NotebookPen className="size-10" aria-hidden />}
        accion={
          <Boton tamano="lg" onClick={alVerCatalogo}>
            Buscar productos
          </Boton>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Tarjeta relleno="ninguno">
        <ul className="divide-y divide-line">
          {anotaciones.map((anotacion) => (
            <li key={anotacion.insumoId} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug text-ink">{anotacion.nombre}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{anotacion.presentacion}</p>
              </div>

              <Contador
                valor={anotacion.cantidad}
                minimo={1}
                alCambiar={(valor) => alCambiarCantidad(anotacion.insumoId, valor)}
                etiqueta={anotacion.nombre}
                tamano="sm"
              />

              <BotonIcono
                etiqueta={`Quitar ${anotacion.nombre}`}
                tamano="sm"
                onClick={() => alQuitar(anotacion.insumoId)}
                disabled={enviando}
                className="text-critico hover:bg-critico-soft"
              >
                <Trash2 className="size-5" aria-hidden />
              </BotonIcono>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta>
        <Area
          etiqueta="¿Quieres decir algo más?"
          ayuda="Opcional. Por ejemplo: que sea maduro, o para qué es."
          placeholder="Escribe aquí si hace falta alguna aclaración"
          value={motivo}
          onChange={(e) => alCambiarMotivo(e.target.value)}
          maxLength={500}
          disabled={enviando}
          rows={3}
        />
      </Tarjeta>

      <Boton tamano="lg" ancho onClick={() => setConfirmando(true)} cargando={enviando}>
        <Send className="size-5" aria-hidden />
        Mandar el pedido
      </Boton>

      <Confirmacion
        abierto={confirmando}
        alCerrar={() => setConfirmando(false)}
        alConfirmar={async () => {
          setConfirmando(false);
          await alEnviar();
        }}
        titulo="Mandar el pedido"
        mensaje={`Se va a mandar la lista con ${anotaciones.length} ${pluralizar(anotaciones.length, 'cosa', 'cosas')}. Despues ya no la puedes cambiar.`}
        textoConfirmar="Sí, mandar"
        textoCancelar="Todavía no"
        procesando={enviando}
      />
    </div>
  );
}
