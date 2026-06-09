export class ListCategoriesUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ name } = {}) {
    if (name) {
      return this.categoryRepository.findByName(name);
    }
    return this.categoryRepository.findAll();
  }
}
