import { prisma } from "../../shared/infrastructure/database/prismaClient.js";
import { User } from "../domain/User.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";

export class PrismaUserRepository {
  async save(user) {
    try {
      const created = await prisma.user.create({
        data: user.toPrisma(),
      });
      return this._mapRowToUser(created);
    } catch (err) {
      if (err?.code === 'P2002') {
        throw new ValidationError('Email ya registrado.');
      }
      throw err;
    }
  }

  async findById(id) {
    const row = await prisma.user.findUnique({
      where: { id },
    });
    return this._mapRowToUser(row);
  }

  async findByEmail(email) {
    const row = await prisma.user.findUnique({
      where: { email },
    });
    return this._mapRowToUser(row);
  }

  _mapRowToUser(row) {
    if (!row) {
      return null;
    }

    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      tel: row.tel,
      role: row.role,
      passwordHash: row.password_hash,
    });
  }
}
