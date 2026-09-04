import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { BottomDrawer, Toast } from '../../../components';
import { circleService } from '../../../services/circleService';
import { useAuth } from '../../../contexts/AuthContext';
import { getImageUrl } from '../../../utils';
import type { CircleListItem, CircleMoment } from '../types';
import { DEFAULT_AVATAR } from '../constants';
import { blocksApi, circlesApi } from '../../../api';
import type { Comment } from '../../../types/domain';

interface CircleDetailContentProps {
  circleId: string;
  onDataChange?: () => void | Promise<void>;
  onClose?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CircleDetailContent: React.FC<CircleDetailContentProps> = ({
  circleId,
  onDataChange,
  onClose,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [circle, setCircle] = useState<CircleListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
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
  const [actionDrawerVisible, setActionDrawerVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'moment' | 'comment';
    id: string;
  } | null>(null);

  const loadExtraData = React.useCallback(async () => {
    if (!circleId) return;
    try {
      const [commentsData, likersData] = await Promise.all([
        circleService.getComments(circleId),
        circleService.getLikers(circleId),
      ]);
      setComments(commentsData);
      setLikers(likersData);
    } catch (error) {
      console.error('加载详情辅助数据失败:', error);
    }
  }, [circleId]);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const detail = await circleService.getCircleById(circleId);
        setCircle(detail || null);
        await loadExtraData();
      } catch (error) {
        console.error('加载动态详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [circleId, loadExtraData]);

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

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleToggleLike = async () => {
    if (!circle || circle.type === 'topic') return;
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
    } catch {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      // Revert on failure
      setCircle(circle);
    } finally {
      setToastVisible(true);
    }
  };

  const handleToggleCollect = async () => {
    if (!circle) return;
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
    } catch {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      // Revert on failure
      setCircle(circle);
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
        setCircle(circle); // Revert
        setToastMessage('操作失败，请重试');
        setToastType('error');
      } else {
        setToastMessage(nextFollowing ? '关注成功' : '取消关注成功');
        setToastType('success');
      }
      await onDataChange?.();
    } catch {
      setToastMessage('操作失败，请重试');
      setToastType('error');
      setCircle(circle); // Revert
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
        await onDataChange?.();
        setToastMessage('发布成功');
        setToastType('success');
      } else {
        setToastMessage('发布失败，请重试');
        setToastType('error');
      }
    } catch {
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

  const confirmAction = (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => {
    const runAction = () => {
      action().catch(() => {
        setToastMessage('操作失败，请重试');
        setToastType('error');
        setToastVisible(true);
      });
    };
    if (Platform.OS === 'web') {
      if ((globalThis as any).confirm?.(message)) runAction();
      return;
    }
    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      { text: '确认', style: 'destructive', onPress: runAction },
    ]);
  };

  const handleDeleteMoment = () => {
    confirmAction('删除动态', '确定永久删除这条动态吗？', async () => {
      const response = await circlesApi.deleteMoment(circleId);
      setToastMessage(
        response.success ? '动态已删除' : response.error || '删除失败',
      );
      setToastType(response.success ? 'success' : 'error');
      setToastVisible(true);
      if (response.success) {
        setCircle(null);
        await onDataChange?.();
        onClose?.();
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    confirmAction('删除评论', '确定删除这条评论吗？', async () => {
      const response = await circlesApi.deleteComment(circleId, commentId);
      setToastMessage(
        response.success ? '评论已删除' : response.error || '删除失败',
      );
      setToastType(response.success ? 'success' : 'error');
      setToastVisible(true);
      if (response.success) await loadExtraData();
    });
  };

  const handleBlockAuthor = () => {
    if (!circle || circle.type !== 'waterfall' || !circle.authorUserId) return;
    confirmAction(
      '拉黑用户',
      '拉黑后双方内容互不可见，关注和搭子关系也会解除。',
      async () => {
        const response = await blocksApi.block(String(circle.authorUserId));
        setToastMessage(
          response.success ? '已加入黑名单' : response.error || '拉黑失败',
        );
        setToastType(response.success ? 'success' : 'error');
        setToastVisible(true);
        if (response.success) {
          setCircle(null);
          await onDataChange?.();
          onClose?.();
        }
      },
    );
  };

  const submitReport = async (
    reason: 'spam' | 'harassment' | 'inappropriate' | 'other',
  ) => {
    if (!reportTarget) return;
    const target = reportTarget;
    const response = await circlesApi.report(target.type, target.id, reason);
    setActionDrawerVisible(false);
    setReportTarget(null);
    setToastMessage(
      response.success
        ? '举报已提交，该内容已隐藏'
        : response.error || '举报失败',
    );
    setToastType(response.success ? 'success' : 'error');
    setToastVisible(true);
    if (!response.success) return;
    if (target.type === 'moment') {
      setCircle(null);
      await onDataChange?.();
      onClose?.();
      return;
    }
    setComments(current =>
      current
        .filter(comment => comment.id !== target.id)
        .map(comment => ({
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== target.id),
        })),
    );
  };

  const renderAuthorActions = () => {
    if (circle?.type !== 'waterfall') return null;
    const isOwn = String(circle.authorUserId) === String(currentUserId);
    return (
      <View style={styles.authorActions}>
        {!isOwn && circle.authorUserId && (
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
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setReportTarget(null);
            setActionDrawerVisible(true);
          }}
        >
          <MaterialIcons
            name="more-horiz"
            size={22}
            color={Colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!circle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>动态不存在或已被删除</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 模态弹窗头部（如果有 onClose 属性，作为 static header 渲染在 ScrollView 之外） */}
      {onClose && (
        <View style={styles.modalHeader}>
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
                  getImageUrl(
                    circle.type === 'waterfall' && circle.authorAvatarUri
                      ? circle.authorAvatarUri
                      : undefined,
                  ) || DEFAULT_AVATAR,
              }}
              style={styles.modalAuthorAvatar}
            />
            <Text style={styles.authorName}>{displayAuthorName}</Text>
          </View>
          {renderAuthorActions()}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* 详情页头部（如果不是 Modal，作为 scrollable header 渲染在 ScrollView 内部） */}
        {!onClose && (
          <View style={styles.authorHeader}>
            <View style={styles.authorInfo}>
              <Image
                source={{
                  uri:
                    getImageUrl(
                      circle.type === 'waterfall' && circle.authorAvatarUri
                        ? circle.authorAvatarUri
                        : undefined,
                    ) || DEFAULT_AVATAR,
                }}
                style={styles.authorAvatar}
              />
              <Text style={styles.authorName}>{displayAuthorName}</Text>
            </View>
            {renderAuthorActions()}
          </View>
        )}

        {/* 图片轮播 */}
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
                  source={{ uri: getImageUrl(uri) }}
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
          {circle.type === 'waterfall' && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {
                  { public: '公开', buddies: '仅搭子', private: '仅自己' }[
                    circle.visibility || 'public'
                  ]
                }
              </Text>
              {!!circle.location && (
                <Text style={styles.metaText}>· {circle.location}</Text>
              )}
              {!!circle.createdAt && (
                <Text style={styles.metaText}>
                  · {new Date(circle.createdAt).toLocaleString('zh-CN')}
                </Text>
              )}
            </View>
          )}

          {likers.length > 0 && (
            <View style={styles.likersContainer}>
              <View style={styles.likerAvatars}>
                {likers.slice(0, 5).map((liker, index) => (
                  <Image
                    key={liker.id}
                    source={{
                      uri: getImageUrl(liker.avatar) || DEFAULT_AVATAR,
                    }}
                    style={[
                      styles.likerAvatar,
                      index > 0 && styles.overlappingLikerAvatar,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.likersText}>{likers.length} 人觉得很赞</Text>
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
                    source={{
                      uri: getImageUrl(comment.userAvatarUri) || DEFAULT_AVATAR,
                    }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeaderRow}>
                      <Text style={styles.commentUser}>{comment.userName}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleReply(comment.id, comment.userName)
                        }
                      >
                        <Text style={styles.replyActionText}>回复</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          comment.isOwn
                            ? handleDeleteComment(comment.id)
                            : (setReportTarget({
                                type: 'comment',
                                id: comment.id,
                              }),
                              setActionDrawerVisible(true))
                        }
                      >
                        <Text
                          style={
                            comment.isOwn
                              ? styles.deleteActionText
                              : styles.reportActionText
                          }
                        >
                          {comment.isOwn ? '删除' : '举报'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>

                    {comment.replies && comment.replies.length > 0 && (
                      <View style={styles.repliesList}>
                        {comment.replies.map(reply => (
                          <View key={reply.id} style={styles.replyItem}>
                            <Text style={styles.replyContent}>
                              <Text style={styles.replyUser}>
                                {reply.userName}:{' '}
                              </Text>
                              {reply.text}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                reply.isOwn
                                  ? handleDeleteComment(reply.id)
                                  : (setReportTarget({
                                      type: 'comment',
                                      id: reply.id,
                                    }),
                                    setActionDrawerVisible(true))
                              }
                            >
                              <Text
                                style={
                                  reply.isOwn
                                    ? styles.deleteActionText
                                    : styles.reportActionText
                                }
                              >
                                {reply.isOwn ? '删除' : '举报'}
                              </Text>
                            </TouchableOpacity>
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
                  color={circle.isCollected ? Colors.primary : Colors.onSurface}
                />
                <Text style={styles.iconCount}>收藏</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <BottomDrawer
        visible={actionDrawerVisible}
        onClose={() => {
          setActionDrawerVisible(false);
          setReportTarget(null);
        }}
        title={reportTarget ? '选择举报原因' : '内容操作'}
        height="auto"
      >
        <View style={styles.actionSheet}>
          {reportTarget ? (
            [
              ['spam', '垃圾内容'],
              ['harassment', '骚扰'],
              ['inappropriate', '不适宜内容'],
              ['other', '其他'],
            ].map(([reason, label]) => (
              <TouchableOpacity
                key={reason}
                style={styles.sheetItem}
                onPress={() => submitReport(reason as any)}
              >
                <Text style={styles.sheetItemText}>{label}</Text>
              </TouchableOpacity>
            ))
          ) : circle.type === 'waterfall' && circle.isOwn ? (
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={handleDeleteMoment}
            >
              <Text style={styles.sheetDangerText}>删除动态</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() =>
                  setReportTarget({ type: 'moment', id: circleId })
                }
              >
                <Text style={styles.sheetItemText}>举报动态</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={handleBlockAuthor}
              >
                <Text style={styles.sheetDangerText}>拉黑作者</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomDrawer>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  closeButton: {
    padding: 4,
  },
  modalAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
  },
  authorHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginLeft: Spacing.sm,
  },
  authorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  moreButton: { padding: Spacing.xs },
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
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.lg },
  metaText: { fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
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
  overlappingLikerAvatar: {
    marginLeft: -8,
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
  reportActionText: { fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
  deleteActionText: { fontSize: FontSize.xs, color: Colors.error },
  repliesList: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  replyItem: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
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
  actionSheet: { padding: Spacing.lg },
  sheetItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}20`,
  },
  sheetItemText: { fontSize: FontSize.md, color: Colors.onSurface },
  sheetDangerText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '600',
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
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
