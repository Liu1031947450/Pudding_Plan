// Circle 模块常量

// 默认头像
export const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=default';

// 默认圈子封面
export const DEFAULT_CIRCLE_IMAGE = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

// Topic 卡片默认背景色
export const DEFAULT_TOPIC_BG_COLOR = '#DEF9CE';

// 瀑布流图片高度范围
export const WATERFALL_IMAGE_HEIGHT = {
  MIN: 160,
  MAX: 260,
};

// 圈子类型
export const CIRCLE_TYPES = {
  LARGE: 'large',
  SMALL: 'small',
  MEDIUM: 'medium',
  WATERFALL: 'waterfall',
  TOPIC: 'topic',
} as const;
