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
}
