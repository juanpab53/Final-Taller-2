# FERVOR Bookstore — Plan DevOps (Entorno de Desarrollo)

> **Nota:** Este plan configura infraestructura DevOps para entorno de desarrollo y testing local. El proyecto sigue en fase activa de desarrollo.

## Stack actual del proyecto

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js 20+ / Express 5 |
| ORM | Prisma 7 |
| BD | PostgreSQL 16 |
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Pagos | Stripe |
| Auth | JWT (access + refresh tokens) |
| Despliegue actual | Railway (Nixpacks) |

## Entorno disponible

| Tool | Versión | Estado |
|------|---------|--------|
| Node | v24.18.0 | Disponible |
| pnpm | 11.5.0 (package.json) | Disponible |
| Docker | 29.6.1 | Disponible |
| kubectl | v1.36.2 | Disponible |
| minikube | v1.38.1 | Instalado, corriendo (192.168.49.2), ingress habilitado |
| PostgreSQL | 16 | Container Docker `fervor-postgres` (postgres:16-alpine), puerto 5432 |

---

## Fase 0 — Graceful Shutdown ✅ COMPLETADA

**Estado:** Ya implementado en código actual.

- `backend/src/server.js:236-261` — manejo SIGTERM/SIGINT con timeout 10s
- `backend/src/database/prismaClient.js:17-19` — `disconnectPrisma()` exportada

**No requiere acción.**

---

## Fase 1 — Docker

### 1.1 — `Dockerfile` (raíz del proyecto)

Multi-stage build (2 stages):

| Stage | Base | Qué hace |
|-------|------|----------|
| `build` | `node:22-alpine` | `corepack enable && corepack prepare pnpm@11.5.0 --activate`, `pnpm install --frozen-lockfile --prod`, `npx prisma generate` |
| `runtime` | `node:22-alpine` | Copia `node_modules`, `src/`, `frontend/`. Instala `tini`. `ENV NODE_ENV=development`. `EXPOSE 3000`. CMD: `prisma migrate deploy && node src/server.js` |

Imagen final no incluye devDependencies ni herramientas de build.

**Notas importantes:**
- Usa Node 22 (compatible con pnpm@11.5.0, disponible localmente v24.18.0)
- Fija pnpm@11.5.0 vía corepack
- `prisma generate` necesita `DATABASE_URL` en build-time (build arg)
- Frontend se copia desde raíz del proyecto (`../../frontend` → `/app/frontend`)

### 1.2 — `.dockerignore` (raíz del proyecto)

```
.git
backend/.env
*/node_modules/
documentation/
*.md
railway.json
.github/
k8s/
scripts/
.env*
!backend/.env.example
```

### 1.3 — `docker-compose.yml` (raíz del proyecto)

Para desarrollo local sin K8s: postgres + backend con hot-reload.

**Archivos creados:** `Dockerfile`, `.dockerignore`, `docker-compose.yml`

---

---

## Fase 2 — Kubernetes Manifests

Archivos en `k8s/`. YAML raw, sin Helm.

### 2.1 — `k8s/namespace.yaml`

Namespace `fervor` para aislar el stack.

### 2.2 — `k8s/configmap.yaml`

Variables no sensibles:
- `NODE_ENV=development`
- `PORT=3000`
- `CORS_ORIGIN=http://localhost:5500`

### 2.3 — `k8s/secret.yaml`

Secret con valores **reales** (no placeholders) para entorno local.
Se crea manualmente una vez: `kubectl create secret generic fervor-secrets -n fervor --from-literal=DATABASE_URL=... --from-literal=JWT_SECRET=... --from-literal=STRIPE_SECRET_KEY=... --from-literal=STRIPE_WEBHOOK_SECRET=... --from-literal=POSTGRES_PASSWORD=...`
**No se commitea.** Documentar en `SECRETS.md` (gitignored) cómo generarlo.

### 2.4 — PostgreSQL

| Archivo | Tipo | Qué define |
|---------|------|------------|
| `k8s/postgres-pvc.yaml` | PersistentVolumeClaim | 1Gi, StorageClass `standard` |
| `k8s/postgres-deployment.yaml` | Deployment | `postgres:16-alpine`, volumen en `/var/lib/postgresql/data`, health check `pg_isready`, resource limits 256Mi/512Mi |
| `k8s/postgres-service.yaml` | Service | ClusterIP, puerto 5432, nombre `postgres-svc` |

### 2.5 — Backend

| Archivo | Tipo | Qué define |
|---------|------|------------|
| `k8s/backend-deployment.yaml` | Deployment | 1 réplica, image local (`fervor-bookstore:latest`), envFrom ConfigMap+Secret, liveness/readiness probes en `/api/health` y `/api/ready`, resource limits 256Mi/512Mi (dev), `terminationGracePeriodSeconds: 15` |
| `k8s/backend-service.yaml` | Service | ClusterIP, 80 → 3000 |

### 2.6 — `k8s/ingress.yaml`

Ingress con `ingress-nginx`:
- Regla: `/` → `backend-svc:80`
- Minikube: `minikube addons enable ingress`

**Archivos creados:** 8 YAML en `k8s/` + `SECRETS.md` (documentación, no commiteado)

---

## Fase 3 — CI/CD (GitHub Actions)

### 3.1 — `.github/workflows/ci-cd.yml`

Trigger: push a `main` y PRs a `main`.

| Job | Qué hace |
|-----|----------|
| `lint-typecheck` | `pnpm lint`, `pnpm typecheck` (si existen scripts) |
| `test` | `pnpm test` (cuando existan tests) |
| `build-and-push` | Checkout → Login GHCR → Build Docker image (con cache) → Push a `ghcr.io/<owner>/<repo>:<sha>` + `:latest` |

**Requiere secrets en GitHub:** `GHCR_TOKEN` (o `GITHUB_TOKEN` con packages:write), `DATABASE_URL` (para prisma generate en build).

No hay deploy automático a K8s (es local). El usuario aplica manualmente con `kubectl apply` o el script helper.

**Archivos creados:** `.github/workflows/ci-cd.yml`

---

## Fase 4 — Script helper

### 4.1 — `scripts/deploy.sh`

Script bash que:
1. Verifica `kubectl` y `minikube`
2. (Opcional) Inicia minikube si no está corriendo
3. Habilita ingress addon
4. Verifica que exista el secret `fervor-secrets` en namespace `fervor` (fallo con instrucciones si no)
5. Aplica manifests en orden: namespace → configmap/secret → postgres → backend → ingress
6. Espera a que backend esté ready
7. Imprime URL de acceso (`minikube service` o ingress IP)

### 4.2 — `scripts/port-forward.sh` (opcional)

Helper rápido para `kubectl port-forward` a backend y postgres.

**Archivos creados:** `scripts/deploy.sh`, `scripts/port-forward.sh`

---

## Resumen de archivos

| Acción | Archivos |
|--------|----------|
| **Modificar** | *(ninguno — Fase 0 ya completada)* |
| **Crear (Fase 1)** | `Dockerfile`, `.dockerignore`, `docker-compose.yml` |
| **Crear (Fase 2)** | `k8s/namespace.yaml`, `k8s/configmap.yaml`, `k8s/postgres-pvc.yaml`, `k8s/postgres-deployment.yaml`, `k8s/postgres-service.yaml`, `k8s/backend-deployment.yaml`, `k8s/backend-service.yaml`, `k8s/ingress.yaml`, `SECRETS.md` (doc, gitignored) |
| **Crear (Fase 3)** | `.github/workflows/ci-cd.yml` |
| **Crear (Fase 4)** | `scripts/deploy.sh`, `scripts/port-forward.sh` |

**Total: 0 archivos modificados + 14 archivos creados**

## Orden de ejecución

```
Fase 1 (Docker) → Fase 2 (K8s) → Fase 3 (CI/CD) → Fase 4 (scripts)
```

Cada fase es independiente y testeable por separado.

## Versionado por Issues

Cada fase se implementa como issue separado, se versiona al completar:

| Issue | Fase | Tag al cerrar |
|-------|------|---------------|
| #1 | Docker (Dockerfile, docker-compose, .dockerignore) | `devops/docker-v1` |
| #2 | K8s Manifests (8 YAML + SECRETS.md) | `devops/k8s-v1` |
| #3 | CI/CD GitHub Actions | `devops/ci-v1` |
| #4 | Scripts helper (deploy.sh, port-forward.sh) | `devops/scripts-v1` |

**Tag final integrado:** `devops/complete-v1`
