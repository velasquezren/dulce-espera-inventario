# Dulce Espera · Inventario de cocina

Aplicacion web progresiva (PWA) para la gestion de insumos de cocina de la **Clinica Montalvo**.
El personal anota lo que falta, envia el pedido a gobernanta, compras lo gestiona y cocina
confirma la recepcion. Funciona en telefono, tablet y escritorio, y sigue operando durante
microcortes de red.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript en modo estricto
- TailwindCSS 4 con sistema de diseno propio en `app/globals.css`
- `lucide-react` como unica dependencia de interfaz
- Backend FastAPI + MySQL (repositorio aparte)

## Puesta en marcha

```bash
npm install
npm run dev            # http://localhost:3000
```

Por defecto la aplicacion apunta al backend de produccion. Para usar otro, crea `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://107.172.193.34.nip.io
```

## Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Verificacion de tipos |
| `npm run lint` | Reglas de ESLint y React |
| `npm run build` | Compilacion de produccion |
| `npm start` | Sirve la compilacion |

Los tres primeros deben pasar sin errores antes de cualquier despliegue.

## Organizacion del codigo

```
app/          Rutas del App Router (enrutado y metadata)
components/   Biblioteca de interfaz, estructura de la aplicacion y PWA
features/     Un modulo por seccion funcional
lib/          Dominio, cliente de API, hooks y almacenamiento local
public/       Iconos y service worker
```

## Convenciones

- **Sin emojis.** La iconografia es exclusivamente vectorial.
- **Dominio en espanol**, alineado con los nombres del backend (`insumo`, `pedido`, `canal`,
  `estado`), para que no exista una capa de traduccion entre API e interfaz.
- **Sin `any`, sin `@ts-ignore`, sin `eslint-disable`** en el codigo de la aplicacion.
- Cada pantalla nueva es una ruta, nunca un caso mas de un `switch`.

## Documentacion

- `MANUAL_TECNICO_Y_ARQUITECTURA.md`: arquitectura, reglas del servidor VPS y runbook.
- `DOCUMENTACION_COMPLETA.md`: manual operativo extendido (uso interno, no se publica).
