import { prisma } from "../../database/prismaClient.js";
import { Author } from "../domain/Author.js";
import { AuthorRepository } from "../domain/AuthorRepository.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

export class PrismaAuthorRepository extends AuthorRepository {
  async findAll() {
    const rows = await prisma.author.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => new Author({ id: r.id, name: r.name }));
  }

  async findById(id) {
    const row = await prisma.author.findUnique({ where: { id } });
    return row ? new Author({ id: row.id, name: row.name }) : null;
  }

  async findByName(name) {
    const rows = await prisma.author.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => new Author({ id: r.id, name: r.name }));
  }

  async save(author) {
    try {
      const created = await prisma.author.create({ data: { name: author.name } });
      return new Author({ id: created.id, name: created.name });
    } catch (err) {
      if (err?.code === 'P2002') throw new ValidationError('Author name already exists.');
      throw err;
    }
  }

  async update(id, data) {
    try {
      const updated = await prisma.author.update({ where: { id }, data });
      return new Author({ id: updated.id, name: updated.name });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Author not found.');
      if (err?.code === 'P2002') throw new ValidationError('Author name already exists.');
      throw err;
    }
  }

  async delete(id) {
    try {
      await prisma.author.delete({ where: { id } });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Author not found.');
      if (err?.code === 'P2003') throw new ValidationError('Cannot delete author with existing books.');
      throw err;
    }
  }
}
