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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Toast } from '../../../components';
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
  const [comments, setComments] = useState<any[]>([]);
  const [likers, setLikers] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'success',
  );
  const inputRef = React.useRef<TextInput>(null);

  const loadExtraData = async () => {
    if (!circleId) return;
    try {
      const [comments, likers] = await Promise.all([
        circleService.getComments(circleId),
        circleService.getLikers(circleId),
      ]);
      setComments(comments);
      setLikers(likers);
    } catch (error) {
      console.error('加载详情辅助数据失败:', error);
    }
  };

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
        await loadExtraData();
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
    try {
      const nextCircle: CircleMoment = {
        ...circle,
        isLiked: !circle.isLiked,
        likes: Math.max(0, (circle.likes || 0) + (circle.isLiked ? -1 : 1)),
      };
      setCircle(nextCircle);
      await circleService.toggleLikeCircle(nextCircle);
      await onDataChange?.();
      setToastMessage(circle.isLiked ? '取消点赞成功' : '点赞成功');
      setToastType('success');
    } catch (error) {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      // Revert on failure
      setCircle({
        ...circle,
        isLiked: !circle.isLiked,
        likes: Math.max(0, (circle.likes || 0) + (circle.isLiked ? -1 : 1)),
      });
    } finally {
      setToastVisible(true);
    }
  };

  const handleToggleCollect = async () => {
    try {
      const nextCircle = {
        ...circle,
        isCollected: !circle.isCollected,
      };
      setCircle(nextCircle);
      await circleService.toggleCollectCircle(nextCircle);
      await onDataChange?.();
      setToastMessage(circle.isCollected ? '取消收藏成功' : '收藏成功');
      setToastType('success');
    } catch (error) {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      // Revert on failure
      setCircle({
        ...circle,
        isCollected: !circle.isCollected,
      });
    } finally {
      setToastVisible(true);
    }
  };

  const handleToggleFollow = async () => {
    if (!circle || circle.type !== 'waterfall' || !circle.authorUserId) return;
    try {
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
        setToastMessage('操作失败，请重试');
        setToastType('error');
      } else {
        setToastMessage(nextFollowing ? '关注成功' : '取消关注成功');
        setToastType('success');
      }
      await onDataChange?.();
    } catch (error) {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      // Revert on failure
      setCircle({ ...circle, isFollowing: !circle.isFollowing });
    } finally {
      setToastVisible(true);
    }
  };

  const handleSubmitComment = async () => {
    if (!circleId || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await circleService.postComment(
        circleId,
        commentText,
        replyTo?.id,
      );
      if (res.success) {
        setCommentText('');
        setReplyTo(null);
        await loadExtraData();
        // 如果是评论而非回复，更新外层的评论数
        if (!replyTo) {
          await onDataChange?.();
        }
        setToastMessage('发布成功');
        setToastType('success');
      } else {
        setToastMessage('发布失败，请重试');
        setToastType('error');
      }
    } catch (error) {
      setToastMessage('发布失败，请重试');
      setToastType('error');
    } finally {
      setSubmitting(false);
      setToastVisible(true);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ id: commentId, name: userName });
    inputRef.current?.focus();
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

            {likers.length > 0 && (
              <View style={styles.likersContainer}>
                <View style={styles.likerAvatars}>
                  {likers.slice(0, 5).map((liker, index) => (
                    <Image
                      key={liker.id}
                      source={{ uri: liker.avatar || DEFAULT_AVATAR }}
                      style={[
                        styles.likerAvatar,
                        { marginLeft: index === 0 ? 0 : -8 },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.likersText}>
                  {likers.length} 人觉得很赞
                </Text>
              </View>
            )}
          </View>

          {circle.type === 'waterfall' && (
            <View style={styles.commentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  共 {comments.length || 0} 条评论
                </Text>
              </View>

              {comments.map(comment => (
                <View key={comment.id} style={styles.commentContainer}>
                  <View style={styles.commentItem}>
                    <Image
                      source={{ uri: comment.userAvatarUri || DEFAULT_AVATAR }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeaderRow}>
                        <Text style={styles.commentUser}>
                          {comment.userName}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            handleReply(comment.id, comment.userName)
                          }
                        >
                          <Text style={styles.replyActionText}>回复</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>

                      {/* 回复列表 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View style={styles.repliesList}>
                          {comment.replies.map((reply: any) => (
                            <View key={reply.id} style={styles.replyItem}>
                              <Text style={styles.replyContent}>
                                <Text style={styles.replyUser}>
                                  {reply.userName}:{' '}
                                </Text>
                                {reply.text}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              {comments.length === 0 && (
                <Text style={styles.emptyComments}>
                  快来发表你的第一个评论吧 ~
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.footer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={Colors.onSurfaceVariant}
                />
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder={
                    replyTo ? `回复 @${replyTo.name}...` : '说点什么...'
                  }
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholderTextColor={Colors.onSurfaceVariant}
                  onBlur={() => !commentText && setReplyTo(null)}
                />
              </View>
              {commentText.length > 0 && (
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  disabled={submitting}
                  style={styles.sendButton}
                >
                  <Text style={styles.sendButtonText}>
                    {submitting ? '...' : '发布'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!commentText && (
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
                    color={
                      circle.isCollected ? Colors.primary : Colors.onSurface
                    }
                  />
                  <Text style={styles.iconCount}>收藏</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
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
  likersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: `${Colors.primary}05`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  likerAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  likerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.surfaceVariant,
  },
  likersText: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  commentContainer: {
    marginBottom: Spacing.lg,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyActionText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  repliesList: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  replyItem: {
    marginBottom: 4,
  },
  replyContent: {
    fontSize: FontSize.sm,
    color: Colors.onSurface,
    lineHeight: 18,
  },
  replyUser: {
    fontWeight: '700',
    color: Colors.onSurface,
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: `${Colors.outlineVariant}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: FontSize.md,
    color: Colors.onSurface,
    padding: 0,
  },
  sendButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
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
