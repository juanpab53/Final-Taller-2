import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';

// Middleware de autorización por roles. Requiere que authMiddleware ya haya poblado req.user.
export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return next(new UnauthorizedError('No autenticado.'));
		}

		if (!roles.includes(req.user.role)) {
			return next(new ForbiddenError(
				`Acceso denegado. Se requiere rol: ${roles.join(' o ')}.`
			));
		}

		next();
	};
}
