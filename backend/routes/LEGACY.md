# Legacy route files (`backend/routes/`)

These files predate the Prisma-based API in `backend/src/routes/`. Runtime mounts are defined in `backend/src/app.js`.

**Do not add new endpoints here.** Prefer `backend/src/routes/` for all new work.

## Still mounted

| File | Mount path | Notes |
|------|------------|-------|
| `health.js` | `/health`, `/api/health` | Lightweight health probe (no DB) |

## Unmounted (superseded by `backend/src/routes/`)

These legacy handlers are **not** registered in `app.js`. Active equivalents live under `backend/src/routes/`:

| Legacy file | Active replacement | Prisma route mount |
|-------------|-------------------|-------------------|
| `trips.js` | `tripRoutes.js` | `/api/trips` |
| `destinations.js` | `destinationsRoutes.js` | `/api/destinations` |
| `stories.js` | `storiesRoutes.js` | `/api/stories` |
| `reviews.js` | `reviewsRoutes.js` | `/api/reviews` |
| `faqs.js` | `tripFaqsRoutes.js` | `/api/trips` (FAQ sub-routes) |
| `tripKnowledge.js` | `tripKnowledge.js` (src) | `/api/trips-knowledge` |
| `tripDocuments.js` | `tripDocuments.js` (src) | `/api/trips-documents` |
| `tripVendors.js` | `tripVendors.js` (src) | `/api/trips-vendors` |
| `tripSOPs.js` | `tripSOPs.js` (src) | `/api/trips-sops` |

## Verification

Cross-check mounts in `backend/src/app.js` — only `../routes/health` is imported from this directory. All other API trees use `./routes/*` under `backend/src/routes/`.
