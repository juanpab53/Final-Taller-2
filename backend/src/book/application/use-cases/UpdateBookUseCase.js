import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class UpdateBookUseCase {
  constructor({ bookRepository, authorRepository, categoryRepository }) {
    this.bookRepository = bookRepository;
    this.authorRepository = authorRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute({ id, dto }) {
    if (dto.authorId) {
      const author = await this.authorRepository.findById(dto.authorId);
      if (!author) throw new ValidationError('Author not found.');
    }
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new ValidationError('Category not found.');
    }

    return this.bookRepository.update(id, dto);
  }
}
