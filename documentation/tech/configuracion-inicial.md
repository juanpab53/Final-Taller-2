# Configuración Inicial

## Requisitos

- Node.js >= 18
- pnpm >= 11.3.0

## Instalación

```bash
cd backend
pnpm install
```

## Variables de Entorno

El archivo `.env` en `backend/` contiene la configuración:

| Variable       | Descripción                          | Valor por defecto        |
|----------------|--------------------------------------|--------------------------|
| `PORT`         | Puerto del servidor Express          | `3000`                   |
| `NODE_ENV`     | Entorno de ejecución                 | `development`            |
| `CORS_ORIGIN`  | Origen permitido para CORS           | `http://localhost:5500`  |

## Ejecución

```bash
# Modo desarrollo (con recarga automática)
cd backend
pnpm dev

# Modo producción
cd backend
pnpm start
```

## Acceso

| Sitio                | URL                                    |
|----------------------|----------------------------------------|
| Frontend público     | http://localhost:3000                  |
| Panel admin          | http://localhost:3000/admin            |
| Recursos compartidos | http://localhost:3000/shared           |
| API health check     | http://localhost:3000/api/health       |

## Rutas de Archivos Estáticos

El servidor monta las siguientes carpetas del frontend:

| Ruta URL       | Carpeta local                          |
|----------------|----------------------------------------|
| `/`            | `frontend/public/`                     |
| `/admin`       | `frontend/admin/`                      |
| `/shared`      | `frontend/shared/`                     |

Esto permite que el frontend haga peticiones `fetch("/api/...")` sin problemas de CORS, al estar todo en el mismo origen.
