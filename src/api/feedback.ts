import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

export type FeedbackCategory = 'suggestion' | 'issue' | 'experience' | 'other';

export const feedbackApi = {
  submit: (
    category: FeedbackCategory,
    content: string,
    contact: string,
  ): Promise<ApiResponse<{ id: string; status: string }>> =>
    apiClient.post(API_ENDPOINTS.FEEDBACK, { category, content, contact }),
};
