import { CreateCategoryDTO } from "../application/dtos/CreateCategoryDTO.js";
import { UpdateCategoryDTO } from "../application/dtos/UpdateCategoryDTO.js";

export class CategoryController {
  constructor({ createCategoryUseCase, listCategoriesUseCase, getCategoryUseCase, updateCategoryUseCase, deleteCategoryUseCase }) {
    this.createCategoryUseCase = createCategoryUseCase;
    this.listCategoriesUseCase = listCategoriesUseCase;
    this.getCategoryUseCase = getCategoryUseCase;
    this.updateCategoryUseCase = updateCategoryUseCase;
    this.deleteCategoryUseCase = deleteCategoryUseCase;
  }

  async create(req, res) {
    const dto = new CreateCategoryDTO(req.body);
    const category = await this.createCategoryUseCase.execute(dto);
    res.status(201).json({ success: true, data: category });
  }

  async list(req, res) {
    const { name } = req.query;
    const categories = await this.listCategoriesUseCase.execute({ name });
    res.json({ success: true, data: categories });
  }

  async getById(req, res) {
    const { id } = req.params;
    const category = await this.getCategoryUseCase.execute({ id });
    res.json({ success: true, data: category });
  }

  async update(req, res) {
    const { id } = req.params;
    const dto = new UpdateCategoryDTO(req.body);
    const category = await this.updateCategoryUseCase.execute({ id, dto });
    res.json({ success: true, data: category });
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.deleteCategoryUseCase.execute({ id });
    res.json({ success: true, data: { message: 'Category deleted successfully.' } });
  }
}
