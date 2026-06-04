import { prisma } from "../../shared/infrastructure/database/prismaClient.js";
import { Credential } from "../domain/Credential.js";

export class PrismaCredentialRepository {
  async findByUserId(userId) {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!row) {
      return null;
    }

    return new Credential({
      userId,
      passwordHash: row.password_hash,
    });
  }

  async findByEmailWithCredentials(email) {
    const row = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        password_hash: true,
      },
    });

    if (!row) {
      return null;
    }

    return {
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
      },
      credential: new Credential({
        userId: row.id,
        passwordHash: row.password_hash,
      }),
    };
  }
}
