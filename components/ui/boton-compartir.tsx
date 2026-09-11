'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Boton } from './boton';
import { useAvisos } from './avisos';
import { useCompartir, type Archivo } from '@/lib/hooks/use-compartir';

interface Props {
  /** Obtiene el archivo: lo baja del servidor o lo genera en el dispositivo. */
  obtener: () => Promise<Archivo>;
  titulo: string;
  etiqueta?: string;
  variante?: 'principal' | 'secundario';
  /** Direccion directa que se abre si no se pudo preparar el archivo. */
  respaldo?: string;
}

export function BotonCompartir({ obtener, titulo, etiqueta = 'Compartir', variante = 'principal', respaldo }: Props) {
  const { avisar } = useAvisos();
  const { compartir } = useCompartir();
  const [ocupado, setOcupado] = useState(false);

  const accion = async () => {
    setOcupado(true);
    try {
      const resultado = await compartir(obtener, titulo);
      if (resultado === 'descargado') avisar('Archivo guardado en tus descargas.', 'info');
    } catch {
      if (respaldo) {
        window.open(respaldo, '_blank', 'noopener');
        avisar('Se abrió el archivo para que lo guardes.', 'info');
      } else {
        avisar('No se pudo preparar el archivo. Intenta otra vez.', 'error');
      }
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Boton variante={variante} tamano="lg" ancho onClick={accion} cargando={ocupado}>
      <Share2 className="size-5" aria-hidden />
      {etiqueta}
    </Boton>
  );
}

interface DescargaProps {
  obtener: () => Promise<Archivo>;
  etiqueta?: string;
  variante?: 'principal' | 'secundario';
}

/** Descarga sin pasar por el diálogo del sistema. */
export function BotonDescargar({ obtener, etiqueta = 'Descargar', variante = 'secundario' }: DescargaProps) {
  const { avisar } = useAvisos();
  const { descargar } = useCompartir();
  const [ocupado, setOcupado] = useState(false);

  const accion = async () => {
    setOcupado(true);
    try {
      descargar(await obtener());
    } catch {
      avisar('No se pudo preparar el archivo. Intenta otra vez.', 'error');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Boton variante={variante} tamano="lg" ancho onClick={accion} cargando={ocupado}>
      {etiqueta}
    </Boton>
  );
}
