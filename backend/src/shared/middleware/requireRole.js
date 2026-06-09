import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';

export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return next(new UnauthorizedError('Not authenticated.'));
		}

		if (!roles.includes(req.user.role)) {
			return next(new ForbiddenError(
				`Access denied. Required role: ${roles.join(' or ')}.`
			));
		}

		next();
	};
}
