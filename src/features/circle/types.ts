import type { Comment } from '../../types/domain';

export interface CircleBase {
  id: string;
  title: string;
  members: string;
  type: 'large' | 'small' | 'medium' | 'waterfall' | 'topic';
  category?: string;
  description?: string;
  imageUri?: string;
  isLiked?: boolean;
  isCollected?: boolean;
  isFollowing?: boolean;
}

export interface CircleTopic extends CircleBase {
  type: 'topic';
  isTopic?: boolean;
  topicTag?: string;
  participantsAvatars?: string[];
  backgroundColor?: string;
}

export interface CircleMoment extends CircleBase {
  type: 'waterfall';
  content?: string;
  images?: string[];
  authorUserId?: string;
  authorName?: string;
  authorAvatarUri?: string;
  likes?: number;
  commentsCount?: number;
  comments?: Comment[];
}

export type CircleListItem = CircleTopic | CircleMoment;
export type CircleDetail = CircleTopic | CircleMoment;
