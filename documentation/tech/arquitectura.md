# Arquitectura del Proyecto

## Vista General

```
Final/
├── backend/         → API REST con Express (Node.js)
├── frontend/        → HTML, CSS y JavaScript vanilla
│   ├── admin/       → Panel de administración
│   ├── public/      → Tienda para clientes
│   └── shared/      → Recursos compartidos
└── documentation/   → Documentación técnica y de usuario
```

## Backend

API REST construida con **Express 5** usando módulos ES.

### Estructura por Módulos — DDD (Domain-Driven-Design)

Cada módulo de negocio sigue 3 capas:

```
módulo/
├── domain/          → Entidades, value objects, reglas de negocio
├── application/     → Casos de uso, DTOs, puertos
└── infrastructure/  → Implementaciones concretas (BD, APIs externas)
```

### Módulos

| Módulo       | Propósito                                |
|--------------|------------------------------------------|
| `auth`       | Autenticación y autorización (JWT)       |
| `authors`    | Gestión de autores                       |
| `books`      | Catálogo de libros                       |
| `cart`       | Carrito de compras                       |
| `categories` | Categorías de libros                     |
| `orders`     | Pedidos y checkout                       |
| `payments`   | Procesamiento de pagos                   |
| `users`      | Gestión de usuarios                      |
| `shared`     | Configuración, errores, middleware común |

## Frontend

HTML, CSS y JavaScript vanilla, servidos como archivos estáticos desde Express.

Separado en tres secciones:

- **`public/`** — Interfaz de clientes (catálogo, carrito, registro)
- **`admin/`** — Panel administrativo (gestión de inventario, pedidos)
- **`shared/`** — CSS, JS y assets comunes a ambos frontends

## Conexión Frontend-Backend

Express sirve tanto la API como los archivos estáticos del frontend, eliminando la necesidad de CORS en desarrollo. El frontend llama a `fetch("/api/...")` directamente.

## Tecnologías

| Capa         | Tecnología                          |
|--------------|-------------------------------------|
| Backend      | Node.js + Express 5                 |
| ORM          | Prisma 7                            |
| BD           | PostgreSQL                          |
| Frontend     | HTML5, CSS3, JavaScript vanilla     |
| Paquetería   | pnpm                                |
