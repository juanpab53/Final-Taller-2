# Arquitectura del Proyecto

## Vista General

```
Final/
├── backend/              → API REST con Express 5 (Node.js)
│   ├── src/
│   │   ├── auth/         → Autenticación y autorización (JWT)
│   │   ├── author/       → Gestión de autores
│   │   ├── book/         → Catálogo de libros
│   │   ├── cart/         → Carrito de compras
│   │   ├── category/     → Categorías de libros
│   │   ├── order/        → Pedidos y checkout
│   │   ├── payment/      → Procesamiento de pagos (Stripe)
│   │   ├── user/         → Gestión de usuarios
│   │   ├── shared/       → Middleware común, errores, utilidades
│   │   └── server.js     → Punto de entrada
│   ├── prisma/           → Schema, migraciones, seed
│   └── package.json
├── frontend/
│   ├── admin/            → Panel administrativo (HTML/CSS/JS)
│   ├── public/           → Tienda para clientes
│   └── shared/           → CSS, JS y assets compartidos
├── documentation/        → Documentación técnica y de usuario
├── railway.json          → Configuración de despliegue (Railway)
└── .gitignore
```

## Backend — Domain-Driven Design

Cada módulo de negocio sigue 3 capas:

```
modulo/
├── domain/               → Entidades, value objects, interfaces (puertos)
├── application/          → Casos de uso, DTOs, lógica de negocio
└── infrastructure/       → Implementaciones concretas (Prisma, Stripe, Express)
```

### Flujo de una petición

```
Navegador
  ↓ fetch("/api/books?search=...")
Express (server.js)
  ↓
Router (BookRouter)
  ↓
Controller (BookController.list)
  ↓
UseCase (ListBooksUseCase.execute)
  ↓
Repository (PrismaBookRepository.findAll)
  ↓
Prisma → PostgreSQL
  ↓ (respuesta)
Controller → JSON → Navegador
```

### Módulos

| Módulo     | Puerto (domain)                | Infraestructura                          |
|------------|--------------------------------|------------------------------------------|
| `auth`     | TokenService                   | JwtService (jsonwebtoken)               |
| `author`   | AuthorRepository               | PrismaAuthorRepository                  |
| `book`     | BookRepository                 | PrismaBookRepository                    |
| `cart`     | CartRepository                 | PrismaCartRepository                    |
| `category` | CategoryRepository             | PrismaCategoryRepository                |
| `order`    | OrderRepository                | PrismaOrderRepository                   |
| `payment`  | PaymentRepository, PaymentGateway | PrismaPaymentRepository, StripePaymentGateway |
| `user`     | UserRepository                 | PrismaUserRepository                    |
| `shared`   | —                              | ErrorHandler, authMiddleware, AppError  |

### Inyección de dependencias

No se usa un contenedor DI. Las dependencias se crean en `server.js` y se pasan manualmente a los controladores y casos de uso:

```js
const bookRepository = new PrismaBookRepository();
const listBooksUseCase = new ListBooksUseCase({ bookRepository });
const bookController = new BookController({ listBooksUseCase });
```

## Frontend

HTML, CSS y JavaScript vanilla, servidos como archivos estáticos desde Express.

- **`public/`** — Interfaz de clientes (catálogo, carrito, registro, detalle, checkout)
- **`admin/`** — Panel administrativo (gestión de inventario, pedidos, estadísticas)
- **`shared/`** — CSS, JS y assets comunes a ambos frontends

### Páginas principales

| Ruta              | Archivo                  | Módulo JS         |
|-------------------|--------------------------|-------------------|
| `/`               | `index.html`             | —                 |
| `/catalogo.html`  | `pages/catalogo.html`    | `catalog.js`      |
| `/book-detail.html?id=N` | `pages/book-detail.html` | `detail.js` |
| `/cart.html`      | `pages/cart.html`        | `cart.js`         |
| `/checkout.html`  | `pages/checkout.html`    | `checkout.js`     |
| `/login.html`     | `pages/login.html`       | `auth.js`         |
| `/register.html`  | `pages/register.html`    | `auth.js`         |
| `/admin/`         | `index.html`             | `dashboard.js`    |

### Sistema de diseño (Design Tokens)

Los estilos se definen con variables CSS personalizadas en `frontend/shared/css/styles.css`:

- `--color-*` — Colores (soporte nativo para modo oscuro con `[data-theme="dark"]`)
- `--font-*` — Tipografías (Libre Caslon, Inter, JetBrains Mono)
- `--radius-*` — Bordes redondeados
- `--transition-*` — Velocidades de animación
- Utilidades tipo Tailwind (`.flex`, `.gap-2`, `.text-primary`, etc.)

## Conexión Frontend-Backend

Express sirve tanto la API como los archivos estáticos del frontend, eliminando la necesidad de CORS en producción. El frontend llama a `fetch("/api/...")` siempre con URL relativa.

En desarrollo, CORS está configurado para permitir orígenes externos (Live Server en puerto 5500).

## Tecnologías

| Capa         | Tecnología                     |
|--------------|--------------------------------|
| Backend      | Node.js >=20 + Express 5       |
| ORM          | Prisma 7                       |
| BD           | PostgreSQL 16+                 |
| Frontend     | HTML5, CSS3, JavaScript vanilla |
| Paquetería   | pnpm >=11                      |
| Pagos        | Stripe (API + Webhooks)        |
| Autenticación| JWT (access + refresh tokens)  |
