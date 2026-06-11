# FERVOR Bookstore — Presentación

**Una tienda de libros online curada, con pagos integrados y panel administrativo completo.**

---

## Visión General

FERVOR es una plataforma de comercio electrónico para libros físicos, diseñada para librerías independientes, editoriales pequeñas y proyectos culturales que quieran vender su catálogo en línea sin depender de plataformas genéricas.

A diferencia de marketplaces masivos, FERVOR privilegia la **curaduría**, la **calidad editorial** y una **experiencia de compra minimalista**.

## Problema que resuelve

| Problema | Solución FERVOR |
|----------|----------------|
| Las librerías independientes no tienen plataforma digital propia | Catálogo online completo con gestión de inventario |
| Vender por redes sociales es desordenado y no escala | Carrito de compras + checkout con Stripe |
| Los marketplaces genéricos no reflejan la identidad de la librería | Diseño personalizable con sistema de tokens visuales |
| Seguimiento manual de pedidos es ineficiente | Panel admin con gestión de estados y estadísticas |

## Roles del sistema

### Cliente (comprador)

Navega el catálogo, busca y filtra libros, gestiona su carrito, realiza compras con tarjeta de crédito/débito, y consulta el estado de sus pedidos.

### Administrador

Gestiona el inventario (libros, autores, categorías), actualiza el estado de los pedidos, y monitorea métricas del negocio (ingresos, tasas de cancelación, stock bajo).

## Funcionalidades principales

### Catálogo

- Visualización en cuadrícula responsive (2-4 columnas según pantalla)
- Búsqueda por título con debounce
- Filtrado por autor y categoría (combinables con búsqueda)
- Paginación con dots interactivos
- Vista detalle con sinopsis, precio, especificaciones técnicas y reseñas editoriales

### Carrito de compras

- Agregar/quitar libros con control de cantidad
- Subtotal y total calculados automáticamente
- Persistencia por sesión de usuario

### Checkout y pagos

- Formulario de datos de envío
- Pago con tarjeta de crédito/débito procesado por **Stripe**
- Página de confirmación post-pago con verificación en tiempo real

### Autenticación

- Registro e inicio de sesión con email y contraseña
- Tokens JWT (access + refresh) con cookies httpOnly
- Roles de usuario (cliente / admin)

### Panel administrativo

- Dashboard con métricas:
  - Ingresos del día y del mes
  - Tasa de cancelación de pedidos
  - Libros con stock bajo
- Gestión completa de libros, autores y categorías (CRUD)
- Lista de pedidos con paginación
- Actualización de estado de pedidos

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 16+ |
| ORM | Prisma 7 |
| Frontend | HTML5, CSS3 (Design Tokens), JavaScript vanilla |
| Pagos | Stripe Payments + Webhooks |
| Autenticación | JWT (jsonwebtoken) |
| Despliegue | Railway |

## Modelo de monetización

FERVOR usa **Stripe** como procesador de pagos. El dueño de la tienda define los precios de los libros y recibe el pago directamente. Stripe cobra su comisión estándar por transacción.

No hay costos de licencia ni suscripción obligatoria para usar la plataforma.

## Roadmap / Próximos pasos

- [ ] Cupones de descuento y promociones
- [ ] Valoraciones y reseñas de clientes
- [ ] Notificaciones por email (confirmación de pedido, envío)
- [ ] Integración con logística / tracking de envíos
- [ ] Modo oscuro completo (ya implementado a nivel de CSS)
- [ ] Recomendaciones de libros personalizadas
- [ ] Soporte multimoneda
- [ ] Exportación de datos de ventas (CSV/Excel)

## Contacto

Proyecto desarrollado como parte del Taller de Lenguajes. Para más información, consultar la documentación técnica en `documentation/tech/`.
