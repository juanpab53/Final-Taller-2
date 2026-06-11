# Configuración Inicial

## Requisitos

- Node.js >= 20
- pnpm >= 11
- PostgreSQL 16+ instalado y corriendo

## Instalación

```bash
git clone <repo-url>
cd backend
pnpm install
```

## PostgreSQL

### Verificar que el servicio está corriendo

```powershell
# PowerShell
Get-Service -Name "postgresql*"
```

### Crear la base de datos

```bash
psql -U postgres
CREATE DATABASE ecommerce_books;
CREATE DATABASE ecommerce_books_shadow;
\q
```

O desde pgAdmin: clic derecho en **Databases** → **Create** → **Database**.

## Variables de Entorno

El archivo `.env` en `backend/` contiene la configuración. Cada developer debe crearlo a partir de la plantilla:

```bash
cd backend
Copy-Item .env.example .env   # PowerShell
```

### Tabla de variables

| Variable                | Obligatorio | Descripción                              | Ejemplo                                                  |
|-------------------------|-------------|------------------------------------------|----------------------------------------------------------|
| `PORT`                  | No          | Puerto del servidor Express              | `3000`                                                   |
| `NODE_ENV`              | No          | Entorno (`development` / `production`)   | `development`                                            |
| `DATABASE_URL`          | Sí          | URL completa de conexión a PostgreSQL    | `postgresql://postgres:pass@localhost:5432/ecommerce_books?schema=public` |
| `SHADOW_DATABASE_URL`   | No          | Shadow database para migraciones Prisma  | `postgresql://postgres:pass@localhost:5432/ecommerce_books_shadow?schema=public` |
| `JWT_SECRET`            | Sí          | Clave secreta para firmar tokens JWT     | `una_cadena_aleatoria_minimo_32_caracteres`             |
| `JWT_EXPIRES_IN`        | No          | Duración del token (default: `24h`)      | `24h`                                                    |
| `CORS_ORIGIN`           | No          | Origen permitido para CORS               | `http://localhost:5500`                                  |
| `STRIPE_SECRET_KEY`     | Sí          | Clave secreta del servidor Stripe        | `sk_test_...`                                            |
| `STRIPE_WEBHOOK_SECRET` | Sí          | Secret para verificar webhooks de Stripe | `whsec_...`                                              |

## Prisma ORM

### Archivos clave

| Archivo                                | Propósito                              |
|----------------------------------------|----------------------------------------|
| `backend/prisma/schema.prisma`         | Modelos de datos y configuración       |
| `backend/prisma/migrations/`           | Historial de migraciones               |

### Comandos

```bash
cd backend

# Generar el Prisma Client (después de instalar o modificar el schema)
pnpm prisma generate

# Crear y aplicar migraciones (después de modificar el schema)
pnpm prisma migrate dev --name descripcion_del_cambio

# Aplicar migraciones en producción
pnpm prisma migrate deploy

# Resync si hay conflictos (borra datos locales)
pnpm prisma migrate reset --force

# Abrir Prisma Studio (visor de datos)
pnpm prisma studio
```

## Flujo completo para un nuevo developer

```bash
# 1. Instalar Node.js >=20 y pnpm
# 2. Instalar PostgreSQL y crear las BD
# 3. Clonar el repositorio
cd backend
pnpm install

# 4. Copiar .env.example como .env y editar
Copy-Item .env.example .env

# 5. Generar el Prisma Client y ejecutar migraciones
pnpm prisma generate
pnpm prisma migrate dev

# 6. Arrancar el servidor
pnpm dev
```

## Ejecución

```bash
# Modo desarrollo (con recarga automática por nodemon)
cd backend
pnpm dev

# Modo producción
cd backend
pnpm start
```

## Acceso

| Sitio                | URL                           |
|----------------------|-------------------------------|
| Frontend público     | http://localhost:3000          |
| Panel admin          | http://localhost:3000/admin    |
| Recursos compartidos | http://localhost:3000/shared   |
| API health check     | http://localhost:3000/api/health |

## Rutas de Archivos Estáticos

El servidor monta las siguientes carpetas del frontend:

| Ruta URL    | Carpeta local        |
|-------------|----------------------|
| `/`         | `frontend/public/`   |
| `/admin`    | `frontend/admin/`    |
| `/shared`   | `frontend/shared/`   |

## Solución de problemas comunes

### Error P1012 — Schema validation

Causa: errores de sintaxis en `schema.prisma`. Revisar:
- Nombres de tipos nativos correctos (`VarChar`, no `Varchar`)
- Tipos de datos compatibles con PostgreSQL (`Float` no lleva `@db.Float`)
- Relaciones con tipo de modelo definido (`orders order[]`, no `order[]`)
- Tipos de columnas consistentes (`@db.Uuid` tanto en FK como en PK)

### Error P3006 — Shadow database corrupta

Ocurre cuando una migración falló previamente y dejó la shadow database en estado inconsistente.

```bash
pnpm prisma migrate reset --force
```

### Error de tipo incompatible (42804)

Causa: una columna FK no tiene el mismo tipo nativo que su PK. Agregar `@db.Uuid` al campo faltante en `schema.prisma` y regenerar la migración.
