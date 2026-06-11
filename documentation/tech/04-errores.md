# Manejo de Errores

## Arquitectura

El sistema usa clases de error personalizadas y un middleware centralizado que captura cualquier error y devuelve una respuesta JSON uniforme.

```
Error (nativo)
 └─ AppError (statusCode, code, isOperational)
      ├─ NotFoundError       → 404
      ├─ UnauthorizedError   → 401
      ├─ ForbiddenError      → 403
      └─ ValidationError     → 400 + details[]
```

## Clases de Error

Todas en `backend/src/shared/errors/`.

### AppError (base)

```js
import { AppError } from "../shared/errors/AppError.js";

throw new AppError("mensaje", 500, "CUSTOM_CODE");
```

| Propiedad     | Tipo    | Descripción                             |
|---------------|---------|-----------------------------------------|
| `message`     | string  | Descripción del error                   |
| `statusCode`  | number  | Código HTTP                             |
| `code`        | string  | Identificador único del error           |
| `isOperational` | boolean | `true` = error conocido, `false` = bug |

### Errores concretos

```js
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "../shared/errors/index.js";

throw new NotFoundError("Usuario no encontrado");         // 404
throw new UnauthorizedError("Token inválido");             // 401
throw new ForbiddenError("No tienes permisos");            // 403
throw new ValidationError("Datos inválidos", [             // 400
  { field: "email", message: "Formato incorrecto" },
]);
```

## Middleware: errorHandler

Ubicado en `backend/src/shared/middleware/errorHandler.js`. Está registrado como el **último middleware** en `server.js`:

```js
app.use(errorHandler);
```

### Respuesta JSON

**Error operacional (AppError):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Usuario no encontrado"
  }
}
```

**ValidationError (incluye details):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [
      { "field": "email", "message": "Formato incorrecto" }
    ]
  }
}
```

**Error inesperado (no es AppError):**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Error interno del servidor"
  }
}
```

### Modo development vs producción

| Entorno      | Comportamiento                                   |
|--------------|--------------------------------------------------|
| `development`| Incluye propiedad `stack` con el stack trace     |
| producción   | Stack oculto, no filtra información interna      |

## Códigos de error por módulo

| Código                | HTTP | Uso                                    |
|-----------------------|------|----------------------------------------|
| `NOT_FOUND`           | 404  | Recurso no encontrado                  |
| `UNAUTHORIZED`        | 401  | Token faltante o inválido              |
| `FORBIDDEN`           | 403  | Rol sin permisos                       |
| `VALIDATION_ERROR`    | 400  | Datos de entrada inválidos             |
| `INTERNAL_SERVER_ERROR` | 500 | Error no manejado (bug)              |

## Cómo usar en un módulo

```js
import { NotFoundError, ValidationError } from "../shared/errors/index.js";

// En un caso de uso
const book = await this.bookRepository.findById(id);
if (!book) throw new NotFoundError("Libro no encontrado");

if (price < 0) throw new ValidationError("Precio inválido", [
  { field: "price", message: "No puede ser negativo" },
]);
```
