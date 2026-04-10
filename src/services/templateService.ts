import type { TemplateDetail } from '../data/templates';
import { templatesApi } from '../api';

// Template Service - handles template operations
class TemplateService {
  // Get all templates
  async getAllTemplates(): Promise<TemplateDetail[]> {
    const response = await templatesApi.getAll();
    return response.data || [];
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<TemplateDetail | undefined> {
    const response = await templatesApi.getById(id);
    return response.data;
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<TemplateDetail[]> {
    const response = await templatesApi.getByCategory(category);
    return response.data || [];
  }

  // Get templates by difficulty
  async getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<TemplateDetail[]> {
    const templates = await this.getAllTemplates();
    return templates.filter(template => template.difficulty === difficulty);
  }
}

// Export singleton instance
export const templateService = new TemplateService();
