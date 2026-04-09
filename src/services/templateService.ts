import type { TemplateDetail } from '../data/templates';
import { templateDetails } from '../data/templates';

// Template Service - handles template operations
class TemplateService {
  // Get all templates
  getAllTemplates(): TemplateDetail[] {
    return Object.values(templateDetails);
  }

  // Get template by ID
  getTemplateById(id: string): TemplateDetail | undefined {
    return templateDetails[id];
  }

  // Get templates by category
  getTemplatesByCategory(category: string): TemplateDetail[] {
    return Object.values(templateDetails).filter(
      template => template.category === category
    );
  }

  // Get templates by difficulty
  getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TemplateDetail[] {
    return Object.values(templateDetails).filter(
      template => template.difficulty === difficulty
    );
  }
}

// Export singleton instance
export const templateService = new TemplateService();
