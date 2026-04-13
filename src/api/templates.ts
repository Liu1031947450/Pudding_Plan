import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// 模板详情类型
export interface TemplateDetail {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  icon: string;
  color: string;
  category: string;
  description: string;
  goals: string[];
  checkpoints: {
    day: number;
    title: string;
    description: string;
  }[];
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: string;
}

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
