import { PrismaClient } from '@prisma/client';

// Mantener una sola instancia de Prisma en desarrollo para evitar fugas de conexiones aunque el módulo se recargue varias veces.
const globalForPrisma = globalThis;

export const prisma =
	globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
