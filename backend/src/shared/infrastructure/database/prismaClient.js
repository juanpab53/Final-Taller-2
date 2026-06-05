import { PrismaClient } from '@prisma/client';

// Keep a single Prisma instance in development to avoid connection leaks
// when the module reloads.
const globalForPrisma = globalThis;

export const prisma =
	globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
