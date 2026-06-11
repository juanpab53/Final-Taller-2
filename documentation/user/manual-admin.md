# Manual del Administrador — FERVOR Bookstore

Guía para gestionar el inventario, los pedidos y las estadísticas de la tienda.

---

## Índice

1. [Acceder al panel admin](#acceder-al-panel-admin)
2. [Dashboard de estadísticas](#dashboard-de-estadísticas)
3. [Gestionar libros](#gestionar-libros)
4. [Gestionar autores](#gestionar-autores)
5. [Gestionar categorías](#gestionar-categorías)
6. [Gestionar pedidos](#gestionar-pedidos)
7. [Estados de pedido](#estados-de-pedido)

---

## Acceder al panel admin

El panel administrativo está en la ruta `/admin/` (ej: `http://localhost:3000/admin/` o `https://tu-dominio.railway.app/admin/`).

### Requisitos

- Debes tener una cuenta de usuario con rol **admin**
- Si eres el primer administrador, debes asignarte el rol directamente en la base de datos

### Inicio de sesión

1. Ve a `/pages/login.html`
2. Ingresa tu email y contraseña de administrador
3. Una vez autenticado, navega a `/admin/`
4. El panel se carga automáticamente con los datos del dashboard

### Navegación del panel

El panel admin tiene tres secciones principales, accesibles desde el menú lateral:

| Sección      | Descripción                                      |
|--------------|--------------------------------------------------|
| Dashboard    | Estadísticas clave del negocio                   |
| Inventario   | Gestión de libros, autores y categorías (CRUD)  |
| Pedidos      | Lista de pedidos con control de estado           |

---

## Dashboard de estadísticas

La página principal del panel (`/admin/`) muestra cuatro métricas en tarjetas:

### Ingresos del día

Muestra el total de ingresos generados el día de hoy. Se actualiza automáticamente con cada nuevo pedido confirmado.

### Ingresos del mes

Muestra el total de ingresos acumulados en el mes calendario actual.

### Tasa de cancelación

Porcentaje de pedidos cancelados respecto al total de pedidos. Una tasa alta puede indicar problemas con stock, tiempos de entrega o calidad del servicio.

### Libros con stock bajo

Cantidad de libros cuyo stock es menor o igual a 5 unidades. Sirve como alerta para reabastecer inventario.

> **Nota**: Los datos se obtienen de la API `/api/admin/stats` y se actualizan al cargar la página.

---

## Gestionar libros

### Lista de libros

La sección de inventario muestra todos los libros en una tabla paginada (15 por página). Cada fila muestra:

- **Nombre** del libro
- **Autor**
- **Categoría**
- **Precio**
- **Stock**
- **Acciones** (editar / eliminar)

### Crear un libro

1. Haz clic en **Agregar libro**
2. Completa los campos:

| Campo        | Descripción                                      |
|--------------|--------------------------------------------------|
| Nombre       | Título del libro                                 |
| Descripción  | Sinopsis o resumen                               |
| Precio       | Precio de venta (en pesos colombianos COP)       |
| Stock        | Cantidad disponible en inventario                |
| Imagen (URL) | Enlace a la portada del libro                    |
| Idioma       | Idioma del libro (ej: Español, Inglés)           |
| Año          | Año de publicación                               |
| Páginas      | Número de páginas                                |
| Autor        | Seleccionar de la lista de autores existentes    |
| Categoría    | Seleccionar de la lista de categorías existentes |

3. Haz clic en **Guardar**

### Editar un libro

1. Haz clic en el ícono de editar (lápiz) junto al libro
2. Modifica los campos necesarios
3. Haz clic en **Guardar cambios**

### Eliminar un libro

1. Haz clic en el ícono de eliminar (basura) junto al libro
2. Confirma la eliminación

> **Importante**: Eliminar un libro no afecta pedidos existentes que lo contengan, pero el libro dejará de aparecer en el catálogo.

---

## Gestionar autores

### Lista de autores

Los autores se listan en la misma sección de inventario. Cada autor muestra:

- **Nombre**
- **Biografía** (si tiene)

### Crear un autor

1. Haz clic en **Agregar autor**
2. Completa:
   - **Nombre** del autor
   - **Bio** (opcional) — breve descripción o trayectoria
3. Haz clic en **Guardar**

### Editar / Eliminar autor

Usa los botones de acción correspondientes.

> **Nota**: No se puede eliminar un autor que tenga libros asociados. Primero debes reasignar o eliminar sus libros.

---

## Gestionar categorías

### Lista de categorías

Las categorías se gestionan desde la misma sección que autores y libros.

### Crear una categoría

1. Haz clic en **Agregar categoría**
2. Completa el **nombre** de la categoría (ej: Arquitectura, Filosofía, Fotografía)
3. Haz clic en **Guardar**

> **Nota**: Al igual que con los autores, no se puede eliminar una categoría que tenga libros asociados.

---

## Gestionar pedidos

### Lista de pedidos

La sección de pedidos (`/admin/orders`) muestra todos los pedidos en una tabla paginada (15 por página). Cada fila muestra:

- **ID** del pedido (UUID)
- **Cliente** (nombre)
- **Total** (en COP)
- **Estado** (con badge de color)
- **Fecha** de creación
- **Acción** (cambiar estado)

### Cambiar el estado de un pedido

1. Haz clic en el botón de estado del pedido que quieres actualizar
2. Selecciona el nuevo estado del menú desplegable
3. El cambio se aplica inmediatamente y el badge se actualiza

### Flujo típico de estados

```
pending → confirmed → shipped → delivered
                                  ↓
                             cancelled
```

| Estado      | Badge    | Acción del admin                         |
|-------------|----------|------------------------------------------|
| `pending`   | Amarillo | Verificar pago, preparar envío           |
| `confirmed` | Azul     | Despachar pedido                         |
| `shipped`   | Celeste  | Esperar confirmación de entrega          |
| `delivered` | Verde    | Pedido completado                        |
| `cancelled` | Rojo     | Pedido cancelado (por admin o cliente)   |

---

## Estados de pedido

| Estado      | Código     | Descripción                                      |
|-------------|------------|--------------------------------------------------|
| Pendiente   | `pending`  | Pago recibido, esperando confirmación del admin  |
| Confirmado  | `confirmed`| Pedido verificado y en preparación               |
| Enviado     | `shipped`  | Pedido despachado al cliente                     |
| Entregado   | `delivered`| Pedido recibido por el cliente                   |
| Cancelado   | `cancelled`| Pedido cancelado (reembolso si aplica)           |
