export class UpdateCategoryUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ id, dto }) {
    const data = {};
    if (dto.name !== undefined) data.name = dto.name;
    return this.categoryRepository.update(id, data);
  }
}
