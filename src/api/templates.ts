import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { TemplateDetail } from '../data/templates';

const USE_MOCK = true;

export const templatesApi = {
  // 获取所有模板
  getAll: async (): Promise<ApiResponse<TemplateDetail[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getAll();
        console.log('[Mock API] templatesApi.getAll - 获取所有模板', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail[]>(API_ENDPOINTS.TEMPLATES);
  },

  // 根据 ID 获取单个模板
  getById: async (id: string): Promise<ApiResponse<TemplateDetail>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getById(id);
        if (!data) {
          return { success: false, error: '未找到模板' };
        }
        console.log('[Mock API] templatesApi.getById - 获取单个模板详情', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail>(API_ENDPOINTS.TEMPLATE_DETAIL(id));
  },

  // 根据分类获取模板
  getByCategory: async (
    category: string,
  ): Promise<ApiResponse<TemplateDetail[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.templates.getByCategory(category);
        console.log(
          '[Mock API] templatesApi.getByCategory - 获取模板分类',
          category,
          data,
        );
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<TemplateDetail[]>(
      API_ENDPOINTS.TEMPLATES_BY_CATEGORY(category),
    );
  },
};
