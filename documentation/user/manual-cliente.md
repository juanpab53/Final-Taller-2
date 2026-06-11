# Manual del Cliente — FERVOR Bookstore

Guía para navegar el catálogo, comprar libros y gestionar tu cuenta.

---

## Índice

1. [Navegar el catálogo](#navegar-el-catálogo)
2. [Buscar y filtrar libros](#buscar-y-filtrar-libros)
3. [Ver detalle de un libro](#ver-detalle-de-un-libro)
4. [Registrarse e iniciar sesión](#registrarse-e-iniciar-sesión)
5. [Carrito de compras](#carrito-de-compras)
6. [Pagar (checkout)](#pagar-checkout)
7. [Mis pedidos](#mis-pedidos)

---

## Navegar el catálogo

La página principal del catálogo (`/catalogo.html`) muestra todos los libros disponibles en una cuadrícula. Cada tarjeta incluye:

- Portada del libro
- Título
- Autor
- Precio

Haz clic en cualquier tarjeta para ver la información completa del libro.

### Paginación

Si hay más de 8 libros, aparecen controles de paginación al final de la cuadrícula:

- **Anterior / Siguiente** — cambiar de página
- **Dots** — clic en un dot para ir directamente a esa página
- El número de página actual se muestra entre los botones

---

## Buscar y filtrar libros

En la parte superior del catálogo hay una barra de búsqueda y filtros.

### Barra combinada

```
┌──────────────────────────────────────────────────────────────┐
│ [Buscar]  [___________input de búsqueda___________]  [Filtrar] │
└──────────────────────────────────────────────────────────────┘
```

La barra contiene:

- **Buscar** — al hacer clic, se enfoca el campo de búsqueda
- **Input de búsqueda** — escribe el título del libro que buscas. Los resultados se actualizan automáticamente mientras escribes (con una pausa de 300ms). Al lado del input aparece un botón **Limpiar** para borrar la búsqueda.
- **Filtrar** — abre/cierra el panel de filtros avanzados

### Panel de filtros

Al hacer clic en **Filtrar**, se despliegan los filtros por:

- **Autor** — selecciona un autor de la lista desplegable
- **Categoría** — selecciona una categoría de la lista desplegable

Botones:

- **Aplicar** — aplica los filtros seleccionados y actualiza el catálogo
- **Limpiar** — limpia los filtros aplicados

### Filtro activo (chip)

Cuando hay una búsqueda o filtro activo, aparece un chip indicador:

```
Mostrando: "arquitectura"  [✕]
```

El botón [✕] cierra el filtro activo y muestra todo el catálogo nuevamente.

> **Nota**: La búsqueda por título y los filtros por autor/categoría se pueden usar al mismo tiempo. El resultado combina ambos criterios.

---

## Ver detalle de un libro

Desde cualquier tarjeta del catálogo, haz clic para ir a la página de detalle (`/pages/book-detail.html?id=N`).

Allí encontrarás:

- **Portada** en tamaño grande
- **Título** y **autor**
- **Precio**
- **Sinopsis** o descripción
- **Especificaciones** — año, páginas, idioma, categoría
- **Reseñas editoriales** — citas de críticos o fuentes relevantes
- **Libros relacionados** — navegación a otros títulos
- **Botón "Agregar al carrito"** — añade el libro a tu carrito

---

## Registrarse e iniciar sesión

### Registro

1. Ve a `/pages/register.html` (o haz clic en "Registrarse")
2. Completa: **nombre**, **email**, **contraseña**
3. Haz clic en **Registrarse**
4. Serás redirigido automáticamente al catálogo con la sesión iniciada

### Inicio de sesión

1. Ve a `/pages/login.html`
2. Ingresa tu **email** y **contraseña**
3. Haz clic en **Iniciar sesión**

### Cierre de sesión

Haz clic en el ícono de usuario en la esquina superior derecha y selecciona **Cerrar sesión**.

> La sesión se mantiene activa incluso si cierras el navegador (refresh token con validez de 7 días).

---

## Carrito de compras

### Agregar un libro

Desde el catálogo o la página de detalle, haz clic en **Agregar al carrito**.

### Ver el carrito

Haz clic en el ícono de carrito en la esquina superior derecha.

En la página del carrito (`/pages/cart.html`) puedes:

- **Ver los libros** agregados con su precio unitario
- **Cambiar la cantidad** usando los botones `+` y `-`
- **Eliminar un libro** con el botón "Eliminar"
- **Ver el subtotal** y el **total** de la compra

### Ir al checkout

Haz clic en **Proceder al pago** para iniciar el proceso de compra.

---

## Pagar (checkout)

1. **Datos de envío**: completa tu nombre, email y dirección de envío
2. **Resumen del pedido**: revisa los libros, cantidades y total
3. **Pagar**: serás redirigido a Stripe para ingresar los datos de tu tarjeta
4. **Confirmación**: después del pago, serás redirigido a la página de confirmación con el resumen de tu pedido

> Stripe acepta tarjetas de crédito y débito (Visa, Mastercard, American Express). Los datos de la tarjeta se ingresan directamente en Stripe, nunca pasan por el servidor de FERVOR.

---

## Mis pedidos

Después de realizar una compra, puedes consultar tus pedidos en la sección correspondiente (en desarrollo).

El estado de tu pedido puede ser:

| Estado      | Significado                                      |
|-------------|--------------------------------------------------|
| `pending`   | Pago recibido, pedido en espera de confirmación  |
| `confirmed` | Pedido confirmado por el administrador           |
| `shipped`   | Pedido enviado                                   |
| `delivered` | Pedido entregado                                 |
| `cancelled` | Pedido cancelado                                 |

Si tienes dudas sobre el estado de tu pedido, contacta al administrador de la tienda.
