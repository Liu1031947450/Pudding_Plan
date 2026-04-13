import type { Comment } from '../../types/domain';
import type { CircleListItem, CircleMoment, CircleTopic } from '../../features/circle/types';
import type { CircleListItemDTO, CircleDetailDTO, CommentDTO } from '../dto/circle.dto';

// DTO 转换为前端领域模型的映射器

export class CircleMapper {
  // 将评论 DTO 转换为前端 Comment 模型
  static mapCommentFromDTO(dto: CommentDTO): Comment {
    return {
      id: dto.id,
      userName: dto.user_name,
      userAvatarUri: dto.user_avatar,
      text: dto.content,
      time: dto.created_at,
    };
  }

  // 将列表项 DTO 转换为前端 CircleListItem 模型
  static mapListItemFromDTO(dto: CircleListItemDTO): CircleListItem {
    const base = {
      id: dto.id,
      title: dto.title,
      members: dto.member_count,
      type: dto.type,
      category: dto.category,
      description: dto.description,
      imageUri: dto.cover_image,
      isLiked: dto.is_liked,
      isCollected: dto.is_collected,
    };

    if (dto.type === 'topic') {
      return {
        ...base,
        type: 'topic',
        isTopic: dto.is_topic,
        topicTag: dto.topic_tag,
        participantsAvatars: dto.participant_avatars,
        backgroundColor: dto.background_color,
      } as CircleTopic;
    }

    return {
      ...base,
      type: dto.type,
      authorName: dto.author_name,
      authorAvatarUri: dto.author_avatar,
      likes: dto.like_count,
      commentsCount: dto.comment_count,
    } as CircleMoment;
  }

  // 将详情 DTO 转换为前端 CircleDetail 模型
  static mapDetailFromDTO(dto: CircleDetailDTO): CircleMoment | CircleTopic {
    const base = {
      id: dto.id,
      title: dto.title,
      members: dto.member_count,
      type: dto.type,
      category: dto.category,
      description: dto.description,
      imageUri: dto.cover_image,
      isLiked: dto.is_liked,
      isCollected: dto.is_collected,
    };

    if (dto.type === 'topic') {
      return {
        ...base,
        type: 'topic',
        isTopic: dto.is_topic,
        topicTag: dto.topic_tag,
        participantsAvatars: dto.participant_avatars,
        backgroundColor: dto.background_color,
      } as CircleTopic;
    }

    return {
      ...base,
      type: dto.type,
      content: dto.content,
      images: dto.images,
      authorName: dto.author_name,
      authorAvatarUri: dto.author_avatar,
      likes: dto.like_count,
      commentsCount: dto.comment_count,
      comments: dto.comments?.map(this.mapCommentFromDTO),
    } as CircleMoment;
  }

  // 将前端模型转换为 DTO（用于创建/更新）
  static mapToDTO(circle: Partial<CircleListItem>): Partial<CircleListItemDTO> {
    return {
      id: circle.id,
      title: circle.title,
      description: circle.description,
      type: circle.type,
      member_count: circle.members,
      cover_image: circle.imageUri,
      category: circle.category,
      is_liked: circle.isLiked,
      is_collected: circle.isCollected,
    };
  }
}
