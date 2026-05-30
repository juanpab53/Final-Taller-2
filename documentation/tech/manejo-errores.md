# Manejo de Errores

## Arquitectura

El sistema de errores usa clases personalizadas que extienden `Error` y un middleware centralizado que captura cualquier error y devuelve una respuesta JSON uniforme.

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

| Propiedad     | Tipo    | Descripción                              |
|---------------|---------|------------------------------------------|
| `message`     | string  | Descripción del error                    |
| `statusCode`  | number  | Código HTTP                              |
| `code`        | string  | Identificador único del error            |
| `isOperational` | boolean | `true` — diferencia errores conocidos de bugs |

### Errores concretos

```js
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "../shared/errors/index.js";

throw new NotFoundError("Usuario no encontrado");
throw new UnauthorizedError("Token inválido");
throw new ForbiddenError("No tienes permisos");
throw new ValidationError("Datos inválidos", [
  { field: "email", message: "Formato incorrecto" },
]);
```

## Middleware: errorHandler

Ubicación: `backend/src/shared/middleware/errorHandler.js`

Está registrado como el **último middleware** en `server.js`:

```js
import { errorHandler } from "./shared/middleware/errorHandler.js";

// ... rutas ...

app.use(errorHandler); // <-- después de todas las rutas
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

### Modo desarrollo vs producción

| Variable     | Comportamiento                           |
|--------------|------------------------------------------|
| `development`| Incluye `stack` trace en la respuesta    |
| producción   | Stack oculto, no filtra información interna |

## Cómo usar en un módulo

```js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../shared/errors/index.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new NotFoundError("Usuario no encontrado");
    res.json({ success: true, data: user });
  } catch (err) {
    next(err); // ← el errorHandler lo captura
  }
});
```
