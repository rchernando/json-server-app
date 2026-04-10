# json-server-app

SSR en Angular 21 (zoneless) con backend mock basado en `json-server`.
Implementa autenticación con token estático, CRUD de posts y comentarios,
ownership, filtros, paginación, i18n `es`/`en` y carga diferida con `@defer`.

## Requisitos

- Node 20.19+ / 22.12+
- npm 10+

## Instalación

```bash
npm install
```

Si vas a correr los tests end-to-end, además:

```bash
npx playwright install
```

## Arranque (dos terminales)

```bash
# terminal 1 — backend mock
npm run backend

# terminal 2 — Angular dev server
npm start
```

- Backend: `http://localhost:3000`
- App: `http://localhost:4200`

## Credenciales

| Usuario | Contraseña |
| ------- | ---------- |
| `alice` | `alice123` |
| `bruno` | `bruno123` |
| `carla` | `carla123` |
| `diego` | `diego123` |
| `elena` | `elena123` |

## Scripts

| Comando              | Qué hace                                                  |
| -------------------- | --------------------------------------------------------- |
| `npm start`          | Dev server de Angular en `:4200`                          |
| `npm run backend`    | json-server sobre `db.json` en `:3000`                    |
| `npm run build`      | Build de producción                                       |
| `npm test`           | Tests unitarios con Vitest                                |
| `npm run test:watch` | Vitest en modo watch                                      |
| `npm run lint`       | ESLint sobre `src/`                                       |
| `npm run lint:fix`   | ESLint con autofix                                        |
| `npm run format`     | Prettier sobre `src/`                                     |
| `npm run e2e`        | Playwright (arranca backend + dev server automáticamente) |

## Flujo mínimo

- `/login` → pantalla de login
- `/` (o `/es`) → listado de posts con paginación, búsqueda, filtros por autor y tag
- `/posts/new` → crear post
- `/posts/:id` → detalle con autor, contenido, tags y comentarios diferidos
- `/posts/:id/edit` → editar post (solo si eres el dueño)
- `/forbidden` → estado 403 (acceso denegado)
- `/**` (cualquier URL desconocida) → 404

Las versiones en español tienen el prefijo `/es/...` (`/es/posts/3`,
`/es/posts/new`, etc.).
