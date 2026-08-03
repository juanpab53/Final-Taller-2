#!/usr/bin/env bash
set -euo pipefail

# deploy.sh - Despliegue completo de FERVOR Bookstore a minikube
# Uso: ./scripts/deploy.sh

NAMESPACE="fervor"
IMAGE="fervor-bookstore:latest"

log() { echo -e "\033[1;32m[INFO]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $*"; exit 1; }

check_prereqs() {
    log "Verificando prerrequisitos..."
    command -v kubectl >/dev/null || error "kubectl no encontrado"
    command -v minikube >/dev/null || error "minikube no encontrado"
    command -v docker >/dev/null || error "docker no encontrado"
    log "Prerrequisitos OK"
}

ensure_minikube() {
    log "Verificando minikube..."
    if ! minikube status >/dev/null 2>&1; then
        log "Iniciando minikube..."
        minikube start
    else
        log "minikube ya está corriendo"
    fi
    
    log "Habilitando ingress addon..."
    minikube addons enable ingress >/dev/null 2>&1 || warn "ingress ya habilitado"
}

ensure_namespace() {
    log "Verificando namespace '$NAMESPACE'..."
    kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || {
        log "Creando namespace..."
        kubectl apply -f k8s/namespace.yaml
    }
}

ensure_secret() {
    log "Verificando secret 'fervor-secrets'..."
    if ! kubectl get secret fervor-secrets -n "$NAMESPACE" >/dev/null 2>&1; then
        error "Secret 'fervor-secrets' no existe en namespace '$NAMESPACE'.
Crea manualmente:
  kubectl create secret generic fervor-secrets -n $NAMESPACE \\
    --from-literal=DATABASE_URL='postgresql://postgres:<pass>@postgres-svc:5432/ecommerce_books?schema=public' \\
    --from-literal=JWT_SECRET='<32-char-random>' \\
    --from-literal=STRIPE_SECRET_KEY='sk_test_...' \\
    --from-literal=STRIPE_WEBHOOK_SECRET='whsec_...' \\
    --from-literal=POSTGRES_PASSWORD='<pass>'
Ver SECRETS.md para detalles."
    fi
    log "Secret OK"
}

apply_manifests() {
    log "Aplicando manifiestos en orden..."
    local manifests=(
        "k8s/namespace.yaml"
        "k8s/configmap.yaml"
        "k8s/postgres-pvc.yaml"
        "k8s/postgres-deployment.yaml"
        "k8s/postgres-service.yaml"
        "k8s/backend-deployment.yaml"
        "k8s/backend-service.yaml"
        "k8s/ingress.yaml"
    )
    
    for m in "${manifests[@]}"; do
        log "  Aplicando $m"
        kubectl apply -f "$m"
    done
}

wait_ready() {
    log "Esperando a que PostgreSQL esté ready..."
    kubectl wait --for=condition=ready pod -l component=postgres -n "$NAMESPACE" --timeout=180s
    
    log "Esperando a que Backend esté ready..."
    kubectl wait --for=condition=ready pod -l component=backend -n "$NAMESPACE" --timeout=180s
}

print_access() {
    local ip
    ip=$(minikube ip)
    log "=========================================="
    log "FERVOR Bookstore desplegado correctamente"
    log "=========================================="
    log "Frontend/API: http://$ip"
    log "Health:       http://$ip/api/health"
    log "Ready:        http://$ip/api/ready"
    log ""
    log "Para acceso directo (port-forward):"
    log "  ./scripts/port-forward.sh"
}

main() {
    log "=== Desplegando FERVOR Bookstore a minikube ==="
    check_prereqs
    ensure_minikube
    ensure_namespace
    ensure_secret
    apply_manifests
    wait_ready
    print_access
}

main "$@"