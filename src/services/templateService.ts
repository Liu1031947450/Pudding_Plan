import type { TemplateDetail } from '../data/templates';
import { templateDetails } from '../data/templates';
import { templatesApi } from '../api';

// Template Service - handles template operations
class TemplateService {
  // Get all templates
  async getAllTemplates(): Promise<TemplateDetail[]> {
    try {
      const response = await templatesApi.getAll();
      if (response.success && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.error('获取远程模板失败，回退到本地系统模板:', error);
    }

    return Object.values(templateDetails);
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<TemplateDetail | undefined> {
    try {
      const response = await templatesApi.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('获取远程模板详情失败，回退到本地系统模板:', error);
    }

    return templateDetails[id];
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<TemplateDetail[]> {
    try {
      const response = await templatesApi.getByCategory(category);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('按分类获取远程模板失败，回退到本地系统模板:', error);
    }

    return Object.values(templateDetails).filter(
      template => template.category === category,
    );
  }

  // Get templates by difficulty
  async getTemplatesByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
  ): Promise<TemplateDetail[]> {
    const templates = await this.getAllTemplates();
    return templates.filter(template => template.difficulty === difficulty);
  }
}

// Export singleton instance
export const templateService = new TemplateService();
