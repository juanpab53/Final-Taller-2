# FERVOR Bookstore

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-5.2-blue)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/prisma-7-orange)](https://prisma.io)
[![License](https://img.shields.io/badge/license-MIT-gray)]()

Tienda de libros online con catálogo, carrito de compras, pagos con Stripe y panel administrativo.

## Quick Start

```bash
cd backend
pnpm install
cp backend/.env.example backend/.env    # editar con credenciales
pnpm prisma migrate dev
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Documentación

- [Arquitectura](documentation/tech/01-arquitectura.md) — estructura del proyecto, DDD, flujo de requests
- [Configuración](documentation/tech/02-configuracion.md) — instalación, PostgreSQL, variables de entorno, Prisma
- [API Reference](documentation/tech/03-api.md) — todos los endpoints con ejemplos de request/response
- [Manejo de errores](documentation/tech/04-errores.md) — clases de error, middleware, códigos HTTP
- [Despliegue](documentation/tech/05-despliegue.md) — cómo desplegar en Railway

## Stack

| Capa         | Tecnología                     |
|--------------|--------------------------------|
| Backend      | Node.js + Express 5            |
| ORM          | Prisma 7                       |
| BD           | PostgreSQL 16                  |
| Frontend     | HTML5, CSS3, JavaScript vanilla|
| Pagos        | Stripe                         |
| Autenticación| JWT (access + refresh tokens)  |
