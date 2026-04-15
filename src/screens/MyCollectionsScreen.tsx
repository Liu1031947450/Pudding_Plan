import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card, Toast } from '../components';
import { useAuth } from '../contexts';
import { circleService } from '../services/circleService';
import type { CircleListItem } from '../features/circle/types';

const MyCollectionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [collections, setCollections] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

  const fetchCollections = useCallback(async () => {
    if (!user?.id) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      const response = await circleService.getCollections();
      if (response.success && response.data) {
        setCollections(response.data);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error('获取收藏失败:', error);
      setToastMessage('获取收藏失败，请重试');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCollections();
  }, [fetchCollections]);

  const handleCirclePress = (circleId: string) => {
    (navigation as any).navigate('CircleDetail', { circleId });
  };

  const handleRemoveCollection = async (circleId: string) => {
    try {
      const success = await circleService.toggleCollectCircle({ id: circleId, isCollected: true });
      if (success) {
        setCollections(prev => prev.filter(item => item.id !== circleId));
        setToastMessage('已取消收藏');
        setToastType('success');
      } else {
        setToastMessage('取消收藏失败，请重试');
        setToastType('error');
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      setToastMessage('取消收藏失败，请重试');
      setToastType('error');
    } finally {
      setToastVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="我的收藏"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressBackgroundColor={Colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="favorite-border"
              size={64}
              color={Colors.outlineVariant}
            />
            <Text style={styles.emptyText}>暂无收藏内容</Text>
            <Text style={styles.emptySubtext}>
              浏览圈子，收藏感兴趣的动态
            </Text>
          </View>
        ) : (
          <View style={styles.collectionsList}>
            {collections.map((item) => (
              <Card key={item.id} style={styles.collectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.authorInfo}>
                    <View style={styles.avatarContainer}>
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={Colors.onSurfaceVariant}
                      />
                    </View>
                    <View>
                      <Text style={styles.authorName}>
                        {item.authorName || '匿名用户'}
                      </Text>
                      <Text style={styles.postTime}>收藏于 刚刚</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveCollection(item.id)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={20}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>
                {item.content && (
                  <Text style={styles.postContent} numberOfLines={2}>
                    {item.content}
                  </Text>
                )}

                {item.images && item.images.length > 0 && (
                  <View style={styles.imagesContainer}>
                    {item.images.slice(0, 3).map((image, index) => (
                      <View key={index} style={styles.imageWrapper}>
                        <MaterialIcons
                          name="image"
                          size={40}
                          color={Colors.outlineVariant}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.stats}>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="favorite"
                        size={16}
                        color={Colors.error}
                      />
                      <Text style={styles.statText}>{item.likes || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="chat-bubble"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.statText}>{item.comments || 0}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleCirclePress(item.id)}
                  >
                    <Text style={styles.viewButtonText}>查看详情</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  emptySubtext: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  collectionsList: {
    gap: Spacing.md,
  },
  collectionCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  postTime: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  postTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  postContent: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  viewButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
  },
  viewButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
  },
});

export default MyCollectionsScreen;