# API Reference

## Base URL

Todas las rutas relativas a `/api`. En desarrollo: `http://localhost:3000/api`.

## Formato de Respuesta

Toda respuesta sigue la estructura:

```json
{
  "success": true | false,
  "data": { ... } | [ ... ] | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción",
    "details": [ ... ]
  },
  "meta": {
    "page": 1,
    "totalPages": 5,
    "totalItems": 37
  }
}
```

`data` solo presente si `success: true`. `error` solo presente si `success: false`. `meta` presente en endpoints paginados.

## Autenticación

### POST /api/auth/login

Inicia sesión con email y contraseña.

```json
// Request
{ "email": "user@example.com", "password": "123456" }

// Response 200
{ "success": true, "data": { "user": { "id", "email", "name", "role" } } }
```

Las cookies `accessToken` y `refreshToken` se setean automáticamente (httpOnly).

### POST /api/auth/register

Registra un nuevo usuario.

```json
// Request
{ "email": "user@example.com", "password": "123456", "name": "Juan" }

// Response 201
{ "success": true, "data": { "user": { "id", "email", "name", "role" } } }
```

### POST /api/auth/refresh

Refresca el token de acceso usando la cookie `refreshToken`.

```json
// Response 200
{ "success": true, "data": { "user": { "id", "email", "name", "role" } } }
```

### POST /api/auth/logout

Cierra sesión y elimina las cookies.

```json
// Response 200
{ "success": true, "data": { "message": "Sesión cerrada correctamente" } }
```

## Usuarios

Requiere autenticación (`Cookie: accessToken`).

### GET /api/users/me

Obtiene el perfil del usuario autenticado.

```json
// Response 200
{ "success": true, "data": { "id", "email", "name", "role", "createdAt" } }
```

## Libros

### GET /api/books

Lista libros con filtros opcionales y paginación.

| Parámetro    | Tipo   | Descripción                        |
|--------------|--------|------------------------------------|
| `search`     | string | Búsqueda por título o descripción  |
| `authorId`   | string | Filtrar por autor (UUID)           |
| `categoryId` | string | Filtrar por categoría (UUID)       |
| `page`       | number | Número de página (default: 1)      |
| `limit`      | number | Items por página (default: 8)      |

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "El nombre del libro",
      "description": "...",
      "price": 25000,
      "stock": 10,
      "imageUrl": "/images/libro.jpg",
      "language": "Español",
      "year": 2024,
      "pages": 320,
      "author": { "id": "uuid", "name": "Autor" },
      "category": { "id": "uuid", "name": "Categoría" }
    }
  ],
  "meta": { "page": 1, "totalPages": 5, "totalItems": 37 }
}
```

### GET /api/books/:id

Obtiene un libro por ID.

```json
// Response 200
{ "success": true, "data": { "id", "name", ..., "author": {...}, "category": {...} } }
```

### POST /api/books

Crea un libro (requiere rol `admin`).

```json
// Request
{ "name": "...", "description": "...", "price": 25000, "stock": 10, "imageUrl": "...", "language": "Español", "year": 2024, "pages": 320, "authorId": "uuid", "categoryId": "uuid" }

// Response 201
{ "success": true, "data": { ... } }
```

### PUT /api/books/:id

Actualiza un libro (requiere rol `admin`). Mismos campos que POST.

### DELETE /api/books/:id

Elimina un libro (requiere rol `admin`).

```json
// Response 200
{ "success": true, "data": { "message": "Libro eliminado correctamente" } }
```

## Autores

### GET /api/authors

Lista todos los autores.

```json
// Response 200
{ "success": true, "data": [{ "id": "uuid", "name": "Autor", "bio": "..." }] }
```

### POST /api/authors

Crea un autor (requiere rol `admin`).

```json
// Request
{ "name": "Autor", "bio": "..." }

// Response 201
{ "success": true, "data": { ... } }
```

### PUT /api/authors/:id

Actualiza un autor (requiere rol `admin`).

### DELETE /api/authors/:id

Elimina un autor (requiere rol `admin`).

## Categorías

### GET /api/categories

Lista todas las categorías.

```json
// Response 200
{ "success": true, "data": [{ "id": "uuid", "name": "Categoría" }] }
```

### POST /api/categories

Crea una categoría (requiere rol `admin`).

```json
// Request
{ "name": "Categoría" }

// Response 201
{ "success": true, "data": { ... } }
```

### PUT /api/categories/:id

Actualiza una categoría (requiere rol `admin`).

### DELETE /api/categories/:id

Elimina una categoría (requiere rol `admin`).

## Carrito

Requiere autenticación.

### GET /api/cart

Obtiene el carrito del usuario autenticado.

```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "quantity": 2,
        "book": { "id": "uuid", "name": "...", "price": 25000, "imageUrl": "..." }
      }
    ],
    "subtotal": 50000,
    "total": 50000
  }
}
```

### POST /api/cart

Agrega un item al carrito.

```json
// Request
{ "bookId": "uuid", "quantity": 1 }

// Response 201
{ "success": true, "data": { ... } }
```

### PUT /api/cart/:itemId

Actualiza la cantidad de un item.

```json
// Request
{ "quantity": 3 }

// Response 200
{ "success": true, "data": { ... } }
```

### DELETE /api/cart/:itemId

Elimina un item del carrito.

```json
// Response 200
{ "success": true, "data": { "message": "Item eliminado del carrito" } }
```

## Pedidos

Requiere autenticación.

### POST /api/orders

Crea un pedido (checkout). El carrito debe tener items.

```json
// Request
{ "customerName": "Juan", "customerEmail": "juan@example.com", "customerAddress": "Calle 123" }

// Response 201
{ "success": true, "data": { "order": { "id", "total", "status", "createdAt" }, "sessionUrl": "https://checkout.stripe.com/..." } }
```

### GET /api/orders

Lista los pedidos del usuario autenticado.

```json
// Response 200
{ "success": true, "data": [{ "id", "total", "status", "createdAt", "items": [...] }] }
```

### GET /api/orders/:id

Obtiene detalle de un pedido.

```json
// Response 200
{ "success": true, "data": { "id", "total", "status", "items": [...], "payment": {...} } }
```

## Administración (Pedidos)

Requiere rol `admin`.

### GET /api/admin/orders

Lista todos los pedidos con paginación.

| Parámetro | Tipo   | Descripción                     |
|-----------|--------|---------------------------------|
| `page`    | number | Número de página (default: 1)   |
| `limit`   | number | Items por página (default: 15)  |

```json
// Response 200
{
  "success": true,
  "data": [{ "id", "total", "status", "customerName", "createdAt", "items": [...] }],
  "meta": { "page": 1, "totalPages": 3, "totalItems": 37 }
}
```

### PATCH /api/admin/orders/:id/status

Actualiza el estado de un pedido.

```json
// Request
{ "status": "confirmed" }

// Response 200
{ "success": true, "data": { "id", "status", ... } }
```

### GET /api/admin/stats

Obtiene estadísticas del dashboard.

```json
// Response 200
{
  "success": true,
  "data": {
    "cancellationRate": 0.05,
    "dailyRevenue": 150000,
    "monthlyRevenue": 4500000,
    "lowStockCount": 3
  }
}
```

## Pagos

### POST /api/payments/webhook

Webhook de Stripe. Express procesa el cuerpo como `raw` para verificar la firma. Stripe envía eventos `checkout.session.completed` y `checkout.session.expired`.

## Health

### GET /api/health

```json
// Response 200
{ "status": "ok", "timestamp": "2026-06-10T12:00:00.000Z" }
```
