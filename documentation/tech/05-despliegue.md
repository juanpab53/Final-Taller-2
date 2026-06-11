# Despliegue en Railway

## Requisitos previos

- Repositorio en GitHub (o GitLab/Bitbucket)
- Cuenta en [Railway](https://railway.app)
- Plugin PostgreSQL aprovisionado en Railway
- Cuenta de Stripe con claves de producción (o test)

## Configuración del proyecto

El proyecto incluye un archivo `railway.json` en la raíz con la configuración necesaria:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "cd backend && node src/server.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Pasos

### 1. Conectar el repositorio

- En Railway, crear un **New Project** → **Deploy from GitHub repo**
- Seleccionar el repositorio del proyecto
- Railway detecta automáticamente `railway.json` y sigue las instrucciones

### 2. Agregar PostgreSQL

- En el dashboard del proyecto, hacer clic en **+ New** → **Database** → **PostgreSQL**
- Railway provee automáticamente la variable `DATABASE_URL`

### 3. Configurar variables de entorno

En la sección **Variables** del proyecto, agregar:

| Variable                | Descripción                         | Cómo obtenerla                     |
|-------------------------|-------------------------------------|------------------------------------|
| `DATABASE_URL`          | Conexión a PostgreSQL               | La provee Railway automáticamente  |
| `JWT_SECRET`            | Clave secreta para JWT              | Generar cadena aleatoria ≥32 chars |
| `STRIPE_SECRET_KEY`     | Clave secreta de Stripe             | Dashboard de Stripe                |
| `STRIPE_WEBHOOK_SECRET` | Secret para verificar webhooks      | Configurar webhook en Stripe       |
| `NODE_ENV`              | `production`                        | Fijar manualmente                  |
| `CORS_ORIGIN`           | Opcional. Dominio del frontend      | Solo si el frontend está separado  |

### 4. Aplicar migraciones

Railway ejecuta `prisma generate` durante el build. Para aplicar las migraciones a la base de datos, ejecutar en Railway:

```bash
# Desde Railway CLI o en deploy settings
npx prisma migrate deploy
```

O configurarlo como un comando post-deploy en `railway.json`:

```json
"deploy": {
  "startCommand": "cd backend && npx prisma migrate deploy && node src/server.js",
  "healthcheckPath": "/api/health"
}
```

### 5. Configurar Stripe Webhook

En el dashboard de Stripe, configurar un webhook que apunte a:

```
https://tu-dominio.railway.app/api/payments/webhook
```

Seleccionar los eventos:
- `checkout.session.completed`
- `checkout.session.expired`

Stripe mostrará el **Webhook Secret** (`whsec_...`) que debe copiarse a la variable `STRIPE_WEBHOOK_SECRET` en Railway.

### 6. Verificar el despliegue

- La URL del proyecto se muestra en Railway (`https://<proyecto>.railway.app`)
- El healthcheck (`/api/health`) debe responder `{ "status": "ok" }`
- El frontend debe cargar en la raíz
- El panel admin en `/admin`

## Notas importantes

- **CORS**: En producción con `NODE_ENV=production`, CORS está deshabilitado (el frontend y la API están en el mismo origen). Si el frontend se sirve desde otro dominio, configurar `CORS_ORIGIN`.
- **Static files**: Express sirve los archivos del frontend desde `frontend/public/`, `frontend/admin/` y `frontend/shared/`. No se necesita un servidor adicional.
- **Migraciones en producción**: Usar `prisma migrate deploy` (no `prisma migrate dev`). `deploy` aplica migraciones sin preguntar ni crear archivos nuevos.
- **Stripe test vs production**: Usar claves `sk_test_` y `whsec_test_` para desarrollo. En producción, usar `sk_live_` y `whsec_live_`.

## Solución de problemas

### El deploy falla con `ERR_MODULE_NOT_FOUND`

Verificar que `package.json` tiene `"type": "module"` y que todas las importaciones usan extensión `.js`.

### El healthcheck falla

Revisar los logs de Railway. Posibles causas:
- `DATABASE_URL` incorrecta o faltante
- `JWT_SECRET` faltante
- Puerto incorrecto (usar `process.env.PORT || 3000`)

### Stripe webhook devuelve 400

Verificar que `STRIPE_WEBHOOK_SECRET` es correcto y que el endpoint usa `express.raw()` antes del `express.json()` global.
