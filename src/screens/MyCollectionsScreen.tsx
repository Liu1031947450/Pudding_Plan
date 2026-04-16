import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { TopAppBar, Toast } from '../components';
import { useAuth } from '../contexts';
import { circleService } from '../services/circleService';
import { CircleWaterfall } from '../features/circle';
import type { CircleListItem } from '../features/circle/types';

const MyCollectionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [collections, setCollections] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'error',
  );

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
      const success = await circleService.toggleCollectCircle({
        id: circleId,
        isCollected: false,
      } as any);

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

  const handleLongPress = (circleId: string) => {
    Alert.alert('取消收藏', '确定要将此动态从收藏中移除吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认删除',
        style: 'destructive',
        onPress: () => handleRemoveCollection(circleId),
      },
    ]);
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
            <Text style={styles.emptySubtext}>浏览圈子，收藏感兴趣的动态</Text>
          </View>
        ) : (
          <View style={styles.waterfallContainer}>
            <CircleWaterfall
              circles={collections}
              onCirclePress={handleCirclePress}
              onCircleLongPress={handleLongPress}
            />
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
  waterfallContainer: {
    paddingVertical: Spacing.sm,
  },
});

export default MyCollectionsScreen;
