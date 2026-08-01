#!/usr/bin/env bash
set -euo pipefail

# port-forward.sh - Port-forward rápido para desarrollo local
# Uso: ./scripts/port-forward.sh
# Expone:
#   - Backend API en localhost:3000
#   - PostgreSQL en localhost:5432

NAMESPACE="fervor"

log() { echo -e "\033[1;32m[INFO]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }

cleanup() {
    log "Cerrando port-forwards..."
    kill "$BACKEND_PID" "$PG_PID" 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM EXIT

main() {
    log "Iniciando port-forwards (Ctrl+C para detener)..."
    log "Namespace: $NAMESPACE"
    
    # Backend: svc/backend-svc (puerto 80) -> localhost:3000
    kubectl port-forward -n "$NAMESPACE" svc/backend-svc 3000:80 >/dev/null 2>&1 &
    BACKEND_PID=$!
    log "  Backend:  localhost:3000 -> svc/backend-svc:80"
    
    # PostgreSQL: svc/postgres-svc (puerto 5432) -> localhost:5432
    kubectl port-forward -n "$NAMESPACE" svc/postgres-svc 5432:5432 >/dev/null 2>&1 &
    PG_PID=$!
    log "  Postgres: localhost:5432 -> svc/postgres-svc:5432"
    
    log ""
    log "Endpoints disponibles:"
    log "  http://localhost:3000/api/health"
    log "  http://localhost:3000/api/ready"
    log "  postgresql://postgres:fervor_dev@localhost:5432/ecommerce_books"
    log ""
    log "Presiona Ctrl+C para detener..."
    
    # Esperar a que terminen los procesos en background
    wait "$BACKEND_PID" "$PG_PID"
}

main "$@"