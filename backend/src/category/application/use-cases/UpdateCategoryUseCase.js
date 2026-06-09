export class UpdateCategoryUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ id, dto }) {
    return this.categoryRepository.update(id, { name: dto.name });
  }
}
