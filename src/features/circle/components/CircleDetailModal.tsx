import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import type { CircleListItem, CircleMoment } from '../types';
import { DEFAULT_AVATAR } from '../constants';
import { circleService } from '../../../services/circleService';
import { useAuth } from '../../../contexts/AuthContext';

interface CircleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  circleId: string | null;
  onDataChange?: () => Promise<void>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  visible,
  onClose,
  circleId,
  onDataChange,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [circle, setCircle] = useState<CircleListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!visible || !circleId) {
      setCircle(null);
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      try {
        const detail = await circleService.getCircleById(circleId);
        setCircle(detail || null);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [visible, circleId]);

  const images = useMemo(() => {
    if (!circle || circle.type === 'topic') return [];
    return circle.images || (circle.imageUri ? [circle.imageUri] : []);
  }, [circle]);

  const displayAuthorName = useMemo(() => {
    if (!circle || circle.type !== 'waterfall') return '圈子话题';
    const isOwn =
      !!currentUserId &&
      !!circle.authorUserId &&
      String(circle.authorUserId) === String(currentUserId);
    return isOwn ? '我' : circle.authorName || '匿名用户';
  }, [circle, currentUserId]);

  if (!circle) return null;

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleToggleLike = async () => {
    if (circle.type === 'topic') return;
    const nextCircle: CircleMoment = {
      ...circle,
      isLiked: !circle.isLiked,
      likes: Math.max(0, (circle.likes || 0) + (circle.isLiked ? -1 : 1)),
    };
    setCircle(nextCircle);
    await circleService.toggleLikeCircle(nextCircle);
    await onDataChange?.();
  };

  const handleToggleCollect = async () => {
    const nextCircle = {
      ...circle,
      isCollected: !circle.isCollected,
    };
    setCircle(nextCircle);
    await circleService.toggleCollectCircle(nextCircle);
    await onDataChange?.();
  };

  const handleToggleFollow = async () => {
    if (!circle || circle.type !== 'waterfall' || !circle.authorUserId) return;
    const authorId = String(circle.authorUserId);
    const nextFollowing = !circle.isFollowing;
    const nextCircle = {
      ...circle,
      isFollowing: nextFollowing,
    };
    setCircle(nextCircle);
    const success = await circleService.toggleFollowBuddy(
      authorId,
      !nextFollowing,
    );
    if (!success) {
      // Revert on failure
      setCircle({ ...circle, isFollowing: !nextFollowing });
    }
    await onDataChange?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons
              name="expand-more"
              size={32}
              color={Colors.onSurface}
            />
          </TouchableOpacity>
          <View style={styles.authorInfo}>
            <Image
              source={{
                uri:
                  circle.type === 'waterfall' && circle.authorAvatarUri
                    ? circle.authorAvatarUri
                    : DEFAULT_AVATAR,
              }}
              style={styles.authorAvatar}
            />
            <Text style={styles.authorName}>{displayAuthorName}</Text>
          </View>
          {circle.type === 'waterfall' &&
            circle.authorUserId &&
            String(circle.authorUserId) !== String(currentUserId) && (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  circle.isFollowing && styles.followedButton,
                ]}
                onPress={handleToggleFollow}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    circle.isFollowing && styles.followedButtonText,
                  ]}
                >
                  {circle.isFollowing ? '已关注' : '关注'}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {circle.type === 'waterfall' && images.length > 0 && (
            <View style={styles.sliderContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.sliderImage}
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        activeIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.contentSection}>
            <Text style={styles.title}>{circle.title}</Text>
            <Text style={styles.content}>
              {circle.type === 'waterfall'
                ? circle.content || circle.description
                : circle.description}
            </Text>
            <Text style={styles.time}>
              {loading ? '加载中...' : '编辑于 刚刚'}
            </Text>
          </View>

          {circle.type === 'waterfall' && (
            <View style={styles.commentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  共 {circle.commentsCount || 0} 条评论
                </Text>
              </View>
              {circle.comments?.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{ uri: comment.userAvatarUri || DEFAULT_AVATAR }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>{comment.userName}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                </View>
              ))}
              {(!circle.comments || circle.comments.length === 0) && (
                <Text style={styles.emptyComments}>
                  快来发表你的第一个评论吧 ~
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.inputPlaceholder}>
            <MaterialIcons
              name="edit"
              size={18}
              color={Colors.onSurfaceVariant}
            />
            <Text style={styles.inputPlaceholderText}>说点什么...</Text>
          </View>
          <View style={styles.interactionIcons}>
            <TouchableOpacity
              onPress={handleToggleLike}
              style={styles.iconButton}
            >
              <MaterialIcons
                name={circle.isLiked ? 'favorite' : 'favorite-border'}
                size={24}
                color={circle.isLiked ? Colors.error : Colors.onSurface}
              />
              <Text style={styles.iconCount}>
                {circle.type === 'waterfall' ? circle.likes || 0 : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleCollect}
              style={styles.iconButton}
            >
              <MaterialIcons
                name={circle.isCollected ? 'star' : 'star-border'}
                size={26}
                color={circle.isCollected ? Colors.primary : Colors.onSurface}
              />
              <Text style={styles.iconCount}>收藏</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={22}
                color={Colors.onSurface}
              />
              <Text style={styles.iconCount}>
                {circle.type === 'waterfall' ? circle.commentsCount || 0 : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginLeft: Spacing.sm,
  },
  followButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  followedButton: {
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
  },
  followButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  followedButtonText: {
    color: Colors.onSurfaceVariant,
  },
  sliderContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.25,
    backgroundColor: Colors.surfaceVariant,
  },
  sliderImage: {
    width: SCREEN_WIDTH,
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 12,
  },
  contentSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}15`,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  content: {
    fontSize: 16,
    color: Colors.onSurface,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.lg,
  },
  commentsSection: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  commentsHeader: {
    marginBottom: Spacing.lg,
  },
  commentsTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceVariant,
  },
  commentContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  commentUser: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  commentText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  commentTime: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  emptyComments: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontSize: FontSize.sm,
    marginTop: Spacing.xl,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: `${Colors.outlineVariant}15`,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPlaceholder: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputPlaceholderText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  interactionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
    gap: Spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconCount: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
});
