import type { MetadataRoute } from 'next';

/** Herramienta interna de la clinica: no debe aparecer en buscadores. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
