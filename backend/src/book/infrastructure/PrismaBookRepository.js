import { prisma } from "../../database/prismaClient.js";
import { Book } from "../domain/Book.js";
import { BookRepository } from "../domain/BookRepository.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

export class PrismaBookRepository extends BookRepository {
  async findAll(filters, page, limit) {
    const where = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.categoryId) where.category_id = filters.categoryId;
    if (filters.authorId) where.author_id = filters.authorId;

    const [rows, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { author: true, category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: rows.map(r => this._mapRowToBook(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id) {
    const row = await prisma.book.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    return row ? this._mapRowToBook(row) : null;
  }

  async save(book) {
    try {
      const created = await prisma.book.create({
        data: this._mapBookToPrisma(book),
        include: { author: true, category: true },
      });
      return this._mapRowToBook(created);
    } catch (err) {
      if (err?.code === 'P2003') throw new ValidationError('Invalid author or category reference.');
      throw err;
    }
  }

  async update(id, data) {
    const prismaData = {};
    if (data.name !== undefined) prismaData.name = data.name;
    if (data.price !== undefined) prismaData.price = data.price;
    if (data.stock !== undefined) prismaData.stock = data.stock;
    if (data.imageUrl !== undefined) prismaData.image_url = data.imageUrl;
    if (data.publicationDate !== undefined) prismaData.publication_date = data.publicationDate;
    if (data.description !== undefined) prismaData.description = data.description;
    if (data.language !== undefined) prismaData.language = data.language;
    if (data.authorId !== undefined) prismaData.author_id = data.authorId;
    if (data.categoryId !== undefined) prismaData.category_id = data.categoryId;

    try {
      const updated = await prisma.book.update({
        where: { id },
        data: prismaData,
        include: { author: true, category: true },
      });
      return this._mapRowToBook(updated);
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Book not found.');
      if (err?.code === 'P2003') throw new ValidationError('Invalid author or category reference.');
      throw err;
    }
  }

  async delete(id) {
    try {
      await prisma.book.delete({ where: { id } });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Book not found.');
      if (err?.code === 'P2003') throw new ValidationError('Cannot delete book referenced in orders or carts.');
      throw err;
    }
  }

  async updateStock(id, quantity) {
    try {
      const updated = await prisma.book.update({
        where: { id },
        data: { stock: { increment: quantity } },
      });
      return updated.stock;
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Book not found.');
      throw err;
    }
  }

  async countLowStock(threshold = 5) {
    return prisma.book.count({ where: { stock: { lt: threshold } } });
  }

  _mapBookToPrisma(book) {
    return {
      name: book.name,
      price: book.price,
      stock: book.stock,
      image_url: book.imageUrl,
      publication_date: book.publicationDate,
      description: book.description,
      language: book.language,
      author_id: book.authorId,
      category_id: book.categoryId,
    };
  }

  _mapRowToBook(row) {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock,
      imageUrl: row.image_url,
      publicationDate: row.publication_date,
      description: row.description,
      language: row.language,
      authorId: row.author_id,
      categoryId: row.category_id,
      author: row.author ? { id: row.author.id, name: row.author.name } : undefined,
      category: row.category ? { id: row.category.id, name: row.category.name } : undefined,
    };
  }
}
