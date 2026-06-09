import { prisma } from "../../database/prismaClient.js";
import { Category } from "../domain/Category.js";
import { CategoryRepository } from "../domain/CategoryRepository.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

export class PrismaCategoryRepository extends CategoryRepository {
  async findAll() {
    const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => new Category({ id: r.id, name: r.name }));
  }

  async findById(id) {
    const row = await prisma.category.findUnique({ where: { id } });
    return row ? new Category({ id: row.id, name: row.name }) : null;
  }

  async findByName(name) {
    const rows = await prisma.category.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => new Category({ id: r.id, name: r.name }));
  }

  async save(category) {
    try {
      const created = await prisma.category.create({ data: { name: category.name } });
      return new Category({ id: created.id, name: created.name });
    } catch (err) {
      if (err?.code === 'P2002') throw new ValidationError('Category name already exists.');
      throw err;
    }
  }

  async update(id, data) {
    try {
      const updated = await prisma.category.update({ where: { id }, data });
      return new Category({ id: updated.id, name: updated.name });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Category not found.');
      if (err?.code === 'P2002') throw new ValidationError('Category name already exists.');
      throw err;
    }
  }

  async delete(id) {
    try {
      await prisma.category.delete({ where: { id } });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Category not found.');
      if (err?.code === 'P2003') throw new ValidationError('Cannot delete category with existing books.');
      throw err;
    }
  }
}
