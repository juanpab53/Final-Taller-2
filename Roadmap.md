Propuesta de Desarrollo - Proyecto BookStore (Arquitectura Limpia)
Este documento detalla el diagnóstico del estado actual del proyecto BookStore y presenta una hoja de ruta detallada para su implementación estructurada. Al tratarse de un entregable universitario con un stack inmutable, la propuesta respeta estrictamente las tecnologías definidas (Node.js/Express 5, PostgreSQL, Vanilla CSS/JS) y el patrón de Arquitectura Limpia (DDD).

1. Diagnóstico del Estado Actual
El proyecto cuenta con una base estructural sólida pero vacía. Se observa lo siguiente:

Backend configurado: Servidor Express 5 en 
server.js
 listo para servir archivos estáticos del frontend (public, admin y shared) y con un endpoint de /api/health.
Variables de entorno: Archivo 
.env
 con la plantilla para configurar puerto, base de datos PostgreSQL, JWT secret y CORS.
Estructura DDD: Todos los módulos de negocio (auth, authors, books, cart, categories, orders, payments, users, shared) tienen creadas las carpetas domain, application e infrastructure, aunque actualmente solo contienen archivos .gitkeep.
Frontend esqueleto: Existen archivos de entrada 
public/index.html
 y 
admin/index.html
 que apuntan a archivos de estilos (styles.css) y scripts (app.js, utils.js) que aún no existen físicamente.
2. Hoja de Ruta Propuesta (Roadmap por Fases)
Para construir el proyecto de manera incremental y sin perder el foco en la arquitectura, sugerimos la siguiente secuencia de desarrollo:

Fase 1: Infraestructura Común y Base de Datos (Backend)
Antes de programar lógica de negocio, se requiere habilitar la comunicación con la base de datos y la gestión de errores común.

Diseño del Esquema de BD: Crear un archivo de migración o script SQL (schema.sql) para inicializar las tablas en PostgreSQL:
users (id, email, password_hash, role, created_at)
authors (id, name, biography, created_at)
categories (id, name, description, created_at)
books (id, title, description, price, stock, cover_url, author_id, category_id, created_at)
cart_items (id, user_id, book_id, quantity)
orders (id, user_id, total, status, payment_status, created_at)
order_items (id, order_id, book_id, quantity, price_at_purchase)
Conexión a PostgreSQL: Instalar el controlador pg (pnpm add pg) y configurar un Pool de conexiones en backend/src/shared/infrastructure/database/pgPool.js que lea las credenciales del .env.
Manejador de Errores Global: Crear middlewares en backend/src/shared/infrastructure/middleware/errorHandler.js para capturar errores y retornar respuestas JSON estructuradas de manera uniforme.

Fase 2: Módulo de Usuarios y Autenticación (Core de Seguridad)
Esta fase es crítica para definir roles de usuario (Cliente vs. Admin) y asegurar los endpoints.

Dependencias de Seguridad: Agregar bcrypt para el hashing de contraseñas y jsonwebtoken para tokens JWT (pnpm add bcrypt jsonwebtoken).
Capa de Dominio (users y auth):
Definir la entidad User y los Value Objects (p.ej., Email, Password).
Definir la interfaz del repositorio UserRepository (puerto).
Capa de Aplicación (users y auth):
Casos de uso: RegisterUser (Registro), LoginUser (Inicio de sesión), GetProfile (Obtención de perfil).
DTOs de entrada/salida.
Capa de Infraestructura (users y auth):
Implementación de UserRepository usando SQL nativo mediante el Pool de PostgreSQL.
Controladores de Express para las rutas /api/auth/register y /api/auth/login.
Middleware de verificación de JWT y autorización de roles (authenticateToken, requireRole('admin')).

Fase 3: Módulos de Catálogo (Autores, Categorías y Libros)
Con la seguridad lista, se procede a implementar el corazón del catálogo.

Módulos authors y categories:
Crear entidades, puertos de repositorio, casos de uso CRUD (Crear, Leer, Actualizar, Eliminar).
Implementar persistencia y exponer rutas de API.
Módulo books:
Entidad Book (debe validar que el precio sea positivo y el stock no sea menor a 0).
Caso de uso ListBooks con filtros (por categoría, autor y búsqueda de texto) y paginación.
Casos de uso de gestión para el administrador (Crear, Editar, Borrar).
Rutas correspondientes en Express.
Fase 4: Carrito de Compras y Pedidos (Ventas e Inventario)
La lógica transaccional del sistema.

Módulo cart:
Lógica para gestionar el carrito persistido en la BD (Agregar, Remover, Modificar cantidad, Vaciar).
Módulo orders (Checkout):
Lógica de negocio compleja: el checkout debe verificar el stock de cada libro en base de datos en una transacción SQL, restar el stock, crear el registro de orden e items correspondientes.
Módulo payments:
Simular una pasarela de pago (Mock Payment Gateway). Recibe detalles de la orden, procesa un retraso artificial (setTimeout) y simula éxito o rechazo basándose en el monto o un parámetro de prueba. Actualiza el estado de pago de la orden a PAID o FAILED.
Fase 5: Frontend Compartido (Diseño Premium y Utilidades)
Antes de construir las páginas individuales del frontend, se establece un sistema de diseño premium (Vanilla CSS) para garantizar una experiencia visualmente espectacular.

Sistema de Diseño CSS (frontend/shared/css/styles.css):
Tipografía: Importar fuentes de Google Fonts (ej. Outfit para encabezados y Inter para el cuerpo).
Paleta de colores: Definir variables CSS (:root) con una paleta moderna, por ejemplo, fondos oscuros premium (#0B0F19), acentos degradados y bordes con efecto de vidrio (glassmorphism).
Componentes reutilizables: Clases base para botones con transiciones suaves, tarjetas de libros con efectos hover tridimensionales, modales animados y formularios limpios.
Librería de utilidades JS (frontend/shared/js/utils.js):
Cliente HTTP personalizado (un envoltorio sobre fetch) que inyecte automáticamente el token JWT guardado en localStorage y maneje redirecciones si el token expira.
Funciones de renderizado común (barras de navegación dinámicas que cambian según si el usuario está logueado o si es admin).
Fase 6: Vistas del Cliente (Frontend Público)
Se implementa la interfaz que utilizará el usuario final en /frontend/public/.

Página de Inicio / Catálogo (index.html y js/app.js):
Visualización de libros en cuadrícula (Grid) interactiva.
Barra de filtros lateral y buscador en tiempo real.
Detalle del Libro (book.html):
Vista detallada del libro con animación de entrada, información del autor y botón de agregar al carrito.
Registro y Login (login.html, register.html):
Formularios interactivos con validación de campos en tiempo real y transiciones animadas.
Carrito de Compras y Checkout (cart.html):
Resumen de productos con botones para incrementar/decrementar cantidades.
Formulario de checkout interactivo que muestre el procesamiento simulado del pago mediante un spinner premium de carga.
Historial de Pedidos (orders.html):
Panel de cliente para revisar el estado de sus compras.
Fase 7: Panel de Administración (Frontend Admin)
Interfaz en /frontend/admin/ reservada para usuarios con rol admin.

Dashboard / Login Admin (index.html):
Autenticación específica y panel resumen de ventas.
CRUD de Libros, Autores y Categorías (books.html, metadata.html):
Tablas interactivas con opción de búsqueda y paginación.
Modales dinámicos para añadir y editar registros.
Gestión de Pedidos (orders.html):
Listado de órdenes realizadas por clientes.
Controlador interactivo para cambiar el estado del pedido (ej. de Pending a Shipped o Delivered).
3. Ejemplo Práctico de Estructura de Capas (DDD) en Node.js
Para mantener la cohesión en la entrega académica, mostramos cómo estructurar un módulo concreto (por ejemplo, books):


backend/src/books/
├── domain/
│   ├── Book.js                  # Clase Entidad Book (validaciones y lógica pura)
│   └── BookRepository.js        # Interfaz/Puerto (definición de métodos, p.ej. "async save(book)")
├── application/
│   ├── ListBooksUseCase.js      # Caso de uso: obtiene libros y aplica filtros
│   ├── CreateBookUseCase.js    # Caso de uso: crea un libro validando reglas de negocio
│   └── BookDTO.js               # Objeto de transferencia de datos
└── infrastructure/
    ├── BookExpressRouter.js     # Definición de rutas Express de libros
    ├── BookExpressController.js # Manejador HTTP (recibe request, llama al caso de uso, responde)
    └── PgBookRepository.js      # Implementación del puerto BookRepository usando SQL nativo en Postgres
¿Cómo se comunican las capas?
El controlador de Express (infrastructure) recibe la petición, extrae los parámetros y los envía al caso de uso (application).
El caso de uso ejecuta la lógica de negocio, interactúa con el dominio y hace consultas/inserciones usando la interfaz puerto (domain/BookRepository).
El repositorio concreto (infrastructure/PgBookRepository) implementa esa interfaz comunicándose con la base de datos real.
Regla de Oro: El código de domain y application nunca debe importar módulos Express, controladores o llamadas directas a librerías de BD (como pg). Esto hace que la lógica de negocio sea 100% testeable e independiente del framework.
4. Recomendaciones Especiales para un Entregable Excelente
Manejo Limpio de Conexiones: Asegurar que las consultas a la base de datos liberen correctamente las conexiones del Pool para evitar fugas (connection leaks), un error común penalizado en la academia.
Semilla de Datos (Seeds): Crear un script en backend/src/shared/infrastructure/database/seed.js que limpie y llene la base de datos con autores, categorías y libros de prueba (con imágenes reales). Esto facilitará enormemente la calificación del docente.
Estética Premium sin Frameworks:
Usar efectos de desenfoque (backdrop-filter: blur()) para tarjetas flotantes.
Implementar variables CSS para transiciones globales (transition: all 0.3s ease).
Asegurar un diseño totalmente responsivo mediante Flexbox y CSS Grid.