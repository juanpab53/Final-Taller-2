import { ValidationError } from "../../../shared/errors/ValidationError.js";
import { Book } from "../../domain/Book.js";

export class CreateBookUseCase {
  constructor({ bookRepository, authorRepository, categoryRepository }) {
    this.bookRepository = bookRepository;
    this.authorRepository = authorRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute(dto) {
    const author = await this.authorRepository.findById(dto.authorId);
    if (!author) throw new ValidationError('Author not found.');

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) throw new ValidationError('Category not found.');

    const book = Book.create({
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      imageUrl: dto.imageUrl,
      publicationDate: dto.publicationDate,
      description: dto.description,
      language: dto.language,
      authorId: dto.authorId,
      categoryId: dto.categoryId,
    });

    return this.bookRepository.save(book);
  }
}
