import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { TemplateDetail } from '../data/templates';

const USE_MOCK = true;

export const templatesApi = {
  // Get all templates
  getAll: async (): Promise<ApiResponse<TemplateDetail[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail[]>(API_ENDPOINTS.TEMPLATES);
  },

  // Get template by ID
  getById: async (id: string): Promise<ApiResponse<TemplateDetail>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getById(id);
        if (!data) {
          return { success: false, error: 'Template not found' };
        }
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail>(API_ENDPOINTS.TEMPLATE_DETAIL(id));
  },

  // Get templates by category
  getByCategory: async (category: string): Promise<ApiResponse<TemplateDetail[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getByCategory(category);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail[]>(API_ENDPOINTS.TEMPLATES_BY_CATEGORY(category));
  },
};
