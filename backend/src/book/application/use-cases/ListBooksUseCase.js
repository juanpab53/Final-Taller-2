export class ListBooksUseCase {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute({ search, categoryId, authorId, page = 1, limit = 12 } = {}) {
    return this.bookRepository.findAll({ search, categoryId, authorId }, Number(page), Number(limit));
  }
}
