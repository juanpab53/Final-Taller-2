# Configuración Inicial

## Requisitos

- Node.js >= 18
- pnpm >= 11.3.0
- PostgreSQL 16+ instalado y corriendo

## Instalación

```bash
cd backend
pnpm install
```

## PostgreSQL

### Instalación

Descargar el instalador desde [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/).

Durante la instalación:

- Puerto: `5432` (default)
- Contraseña del usuario `postgres`: elegir una y recordarla
- Desmarcar "Launch Stack Builder at exit"

### Verificar que el servicio está corriendo

```bash
# Git Bash
net start | grep -i postgres

# PowerShell
Get-Service -Name "postgresql*"
```

### Crear la base de datos

```bash
# Desde psql
psql -U postgres
CREATE DATABASE ecommerce_books;
\q
```

O desde **pgAdmin**: clic derecho en **Databases** → **Create** → **Database** → nombre: `ecommerce_books` → **Save**.

### Crear la shadow database

Prisma necesita una shadow database para generar migraciones. Crealá con el mismo método pero con nombre `ecommerce_books_shadow`.

## Variables de Entorno

El archivo `.env` en `backend/` contiene la configuración del servidor y la base de datos. Cada developer debe crearlo a partir de la plantilla:

```bash
cd backend
cp .env.example .env
# Windows (PowerShell)
Copy-Item .env.example .env
```

### Variables del servidor

| Variable        | Descripción                | Valor por defecto         |
| --------------- | --------------------------- | ------------------------- |
| `PORT`        | Puerto del servidor Express | `3000`                  |
| `NODE_ENV`    | Entorno de ejecución       | `development`           |
| `CORS_ORIGIN` | Origen permitido para CORS  | `http://localhost:5500` |

### Variables de PostgreSQL

| Variable                | Descripción                       | Ejemplo                                                   |
| ----------------------- | ---------------------------------- | --------------------------------------------------------- |
| `DB_HOST`             | Host de PostgreSQL                 | `localhost`                                             |
| `DB_PORT`             | Puerto de PostgreSQL               | `5432`                                                  |
| `DB_NAME`             | Nombre de la base de datos         | `ecommerce_books`                                       |
| `DB_USER`             | Usuario de PostgreSQL              | `postgres`                                              |
| `DB_PASSWORD`         | Contraseña de PostgreSQL          | `tu_contraseña`                                        |
| `DATABASE_URL`        | URL completa de conexión          | `postgresql://postgres:pass@...`                        |
| `SHADOW_DATABASE_URL` | URL para shadow database de Prisma | `postgresql://postgres:pass@.../ecommerce_books_shadow` |

### Variables de Stripe

| Variable                  | Descripción                             | Ejemplo                           |
| ------------------------- | ---------------------------------------- | --------------------------------- |
| `STRIPE_SECRET_KEY`     | Clave secreta del servidor (sk_test)     | `sk_test_tu_llave_secreta_aqui` |
| `STRIPE_WEBHOOK_SECRET` | Secret para verificar webhooks de Stripe | `whsec_tu_llave_secreta_aqui`   |

> **Importante**: `DATABASE_URL` debe coincidir con las demás variables. Si cambias `DB_PASSWORD`, actualízala también dentro de `DATABASE_URL`.

## Prisma ORM

El proyecto usa **Prisma** como ORM para conectar con PostgreSQL.

### Archivos clave

| Archivo                          | Propósito                                       |
| -------------------------------- | ------------------------------------------------ |
| `backend/prisma/schema.prisma` | Modelos de datos y configuración del datasource |
| `backend/prisma.config.ts`     | Configuración de Prisma v7 (carga `.env`)     |
| `backend/prisma/migrations/`   | Historial de migraciones                         |

### Comandos

```bash
# Generar el Prisma Client (después de instalar o modificar el schema)
pnpm prisma generate

# Crear y aplicar migraciones (después de modificar el schema)
pnpm prisma migrate dev --name descripcion_del_cambio

# Resync si hay conflictos (borra datos locales)
pnpm prisma migrate reset --force

# Abrir Prisma Studio (visor de datos)
pnpm prisma studio
```

## Flujo completo para un nuevo developer

```bash
# 1. Instalar Node.js y pnpm (si no están)
# 2. Instalar PostgreSQL y crear la BD ecommerce_books
# 3. Clonar el repositorio
# 4. Ir al backend e instalar dependencias
cd backend
pnpm install

# 5. Copiar .env.example como .env y editar con tus credenciales
Copy-Item .env.example .env

# 6. Generar el Prisma Client
pnpm prisma generate

# 7. Ejecutar migraciones (crea las tablas en la BD)
pnpm prisma migrate dev

# 8. Arrancar el servidor
pnpm dev
```

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

Causa: una columna FK no tiene el mismo tipo nativo que su PK. Ej: `String` (text) vs `String @db.Uuid` (uuid). Agregar `@db.Uuid` al campo faltante en `schema.prisma` y regenerar la migración.

### Error: `process` no reconocido en `prisma.config.ts`

Es un error de tipos de VS Code, no de ejecución. Si molesta, instalar:

```bash
pnpm add -D @types/node
```

### Variables de PostgreSQL

| Variable         | Descripción                    | Ejemplo                          |
|------------------|--------------------------------|----------------------------------|
| `DB_HOST`        | Host de PostgreSQL             | `localhost`                      |
| `DB_PORT`        | Puerto de PostgreSQL           | `5432`                           |
| `DB_NAME`        | Nombre de la base de datos     | `ecommerce_books`                |
| `DB_USER`        | Usuario de PostgreSQL          | `postgres`                       |
| `DB_PASSWORD`    | Contraseña de PostgreSQL       | `tu_contraseña`                  |
| `DATABASE_URL`   | URL completa de conexión       | `postgresql://postgres:pass@...` |
| `SHADOW_DATABASE_URL` | URL para shadow database de Prisma | `postgresql://postgres:pass@.../ecommerce_books_shadow` |

### Variables de Stripe

| Variable             | Descripción                              | Ejemplo                          |
|----------------------|------------------------------------------|----------------------------------|
| `STRIPE_SECRET_KEY`  | Clave secreta del servidor (sk_test)     | `sk_test_tu_llave_secreta_aqui` |
| `STRIPE_WEBHOOK_SECRET` | Secret para verificar webhooks de Stripe | `whsec_tu_llave_secreta_aqui` |

> **Importante**: `DATABASE_URL` debe coincidir con las demás variables. Si cambias `DB_PASSWORD`, actualízala también dentro de `DATABASE_URL`.

## Prisma ORM

El proyecto usa **Prisma** como ORM para conectar con PostgreSQL.

### Archivos clave

| Archivo                          | Propósito                                        |
|----------------------------------|--------------------------------------------------|
| `backend/prisma/schema.prisma`   | Modelos de datos y configuración del datasource  |
| `backend/prisma.config.ts`       | Configuración de Prisma v7 (carga `.env`)        |
| `backend/prisma/migrations/`     | Historial de migraciones                         |

### Comandos

```bash
# Generar el Prisma Client (después de instalar o modificar el schema)
pnpm prisma generate

# Crear y aplicar migraciones (después de modificar el schema)
pnpm prisma migrate dev --name descripcion_del_cambio

# Resync si hay conflictos (borra datos locales)
pnpm prisma migrate reset --force

# Abrir Prisma Studio (visor de datos)
pnpm prisma studio
```

## Flujo completo para un nuevo developer

```bash
# 1. Instalar Node.js y pnpm (si no están)
# 2. Instalar PostgreSQL y crear la BD ecommerce_books
# 3. Clonar el repositorio
# 4. Ir al backend e instalar dependencias
cd backend
pnpm install

# 5. Copiar .env.example como .env y editar con tus credenciales
Copy-Item .env.example .env

# 6. Generar el Prisma Client
pnpm prisma generate

# 7. Ejecutar migraciones (crea las tablas en la BD)
pnpm prisma migrate dev

# 8. Arrancar el servidor
pnpm dev
```

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

Causa: una columna FK no tiene el mismo tipo nativo que su PK. Ej: `String` (text) vs `String @db.Uuid` (uuid). Agregar `@db.Uuid` al campo faltante en `schema.prisma` y regenerar la migración.

### Error: `process` no reconocido en `prisma.config.ts`

Es un error de tipos de VS Code, no de ejecución. Si molesta, instalar:

```bash
pnpm add -D @types/node
```

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

| Sitio                | URL                              |
| -------------------- | -------------------------------- |
| Frontend público    | http://localhost:3000            |
| Panel admin          | http://localhost:3000/admin      |
| Recursos compartidos | http://localhost:3000/shared     |
| API health check     | http://localhost:3000/api/health |

## Rutas de Archivos Estáticos

El servidor monta las siguientes carpetas del frontend:

| Ruta URL    | Carpeta local        |
| ----------- | -------------------- |
| `/`       | `frontend/public/` |
| `/admin`  | `frontend/admin/`  |
| `/shared` | `frontend/shared/` |

Esto permite que el frontend haga peticiones `fetch("/api/...")` sin problemas de CORS, al estar todo en el mismo origen.
