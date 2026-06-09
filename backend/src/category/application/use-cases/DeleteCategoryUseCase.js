export class DeleteCategoryUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ id }) {
    await this.categoryRepository.delete(id);
  }
}
