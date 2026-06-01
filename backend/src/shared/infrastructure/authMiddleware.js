import { UnauthorizedError } from '../errors/UnauthorizedError.js';

// Crea un middleware que valida el access token usando el TokenService inyectado.
export function createAuthMiddleware(tokenService) {
	return (req, res, next) => {
		try {
			const authHeader = req.headers['authorization'];
			const token = authHeader?.split(' ')[1];

			if (!token) {
				throw new UnauthorizedError('Token no proporcionado.');
			}

			const payload = tokenService.verifyAccessToken(token);

			// Contrato simple para downstream: id, email, role.
			req.user = {
				id: payload.id,
				email: payload.email,
				role: payload.role,
			};

			next();
		} catch (err) {
			next(new UnauthorizedError('Token inválido o expirado.'));
		}
	};
}
