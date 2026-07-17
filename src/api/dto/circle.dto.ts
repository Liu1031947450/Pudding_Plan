// Circle API 响应 DTO（模拟后端返回的数据结构）

export interface CommentDTO {
  id: string;
  user_id?: string;
  user_name: string;
  /** 用户头像 URL，最大长度 1000 字符 */
  user_avatar?: string;
  content: string;
  created_at: string;
}

// 圈子列表项 DTO（列表接口返回的简化数据）
export interface CircleListItemDTO {
  id: string;
  title: string;
  description?: string;
  type: 'large' | 'small' | 'medium' | 'waterfall' | 'topic';
  member_count: string;
  cover_image?: string;
  category?: string;
  // Waterfall 类型字段
  author_name?: string;
  /** 作者头像 URL，最大长度 1000 字符 */
  author_avatar?: string;
  like_count?: number;
  comment_count?: number;
  // Topic 类型字段
  is_topic?: boolean;
  topic_tag?: string;
  /** 参与者头像 URL 列表，每个 URL 最大长度 1000 字符 */
  participant_avatars?: string[];
  background_color?: string;
  // 用户交互状态
  is_liked?: boolean;
  is_collected?: boolean;
}

// 圈子详情 DTO（详情接口返回的完整数据）
export interface CircleDetailDTO {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'large' | 'small' | 'medium' | 'waterfall' | 'topic';
  member_count: string;
  cover_image?: string;
  images?: string[];
  category?: string;
  // Waterfall 类型字段
  author_name?: string;
  /** 作者头像 URL，最大长度 1000 字符 */
  author_avatar?: string;
  like_count?: number;
  comment_count?: number;
  comments?: CommentDTO[];
  // Topic 类型字段
  is_topic?: boolean;
  topic_tag?: string;
  /** 参与者头像 URL 列表，每个 URL 最大长度 1000 字符 */
  participant_avatars?: string[];
  background_color?: string;
  // 用户交互状态
  is_liked?: boolean;
  is_collected?: boolean;
  // 详情专属字段
  created_at?: string;
  updated_at?: string;
}
