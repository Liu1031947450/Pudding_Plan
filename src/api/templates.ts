import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { TemplateDetail } from '../types/domain';

export const templatesApi = {
  // 获取所有模板
  getAll: async (): Promise<ApiResponse<TemplateDetail[]>> => {
    return apiClient.get<TemplateDetail[]>(API_ENDPOINTS.TEMPLATES);
  },

  // 根据 ID 获取单个模板
  getById: async (id: string): Promise<ApiResponse<TemplateDetail>> => {
    return apiClient.get<TemplateDetail>(API_ENDPOINTS.TEMPLATE_DETAIL(id));
  },

  // 根据分类获取模板
  getByCategory: async (
    category: string,
  ): Promise<ApiResponse<TemplateDetail[]>> => {
    return apiClient.get<TemplateDetail[]>(
      API_ENDPOINTS.TEMPLATES_BY_CATEGORY(category),
    );
  },
};
