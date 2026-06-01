// Caso de uso de cierre de sesión.
export class LogoutUseCase {
	constructor() {}

	async execute() {
		// En este diseño stateless no hay estado de sesión en servidor.
		// El controlador se encarga de limpiar la cookie de refresh.
		return {
			success: true,
			message: 'Logout ejecutado correctamente.',
		};
	}
}
