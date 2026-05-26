# Servidor y Conexión con el Frontend

## Punto de Entrada

El servidor arranca desde `backend/src/server.js`.

```js
// Archivo: backend/src/server.js
import "dotenv/config";   // Carga variables de .env
import express from "express";
import cors from "cors";
```

## Middlewares

1. **CORS** — Configurado con el origen definido en `CORS_ORIGIN` (por defecto `http://localhost:5500`). Permite que el frontend se desarrolle con Live Server mientras la API corre en puerto 3000.

2. **express.json()** — Parseo de cuerpos JSON en peticiones entrantes.

3. **express.static()** — Sirve archivos estáticos del frontend:

   | Ruta URL      | Carpeta                                      |
   |---------------|----------------------------------------------|
   | `/`           | `frontend/public/`                           |
   | `/admin`      | `frontend/admin/`                            |
   | `/shared`     | `frontend/shared/`                           |

## Flujo de Peticiones

```
Navegador
  │
  ├── GET /               → frontend/public/index.html
  ├── GET /admin          → frontend/admin/index.html
  ├── GET /shared/css/... → frontend/shared/css/...
  ├── GET /api/health     → Respuesta JSON { status: "ok" }
  └── GET /api/*          → (Futuros endpoints de la API)
```

## Endpoints Actuales

Actualmente solo existe un endpoint de salud:

```
GET /api/health → 200 { status: "ok", timestamp: "ISO-8601" }
```

## Comandos

```bash
pnpm dev   # Inicia con nodemon (recarga automática en cambios)
pnpm start # Inicia con node (modo producción)
```
