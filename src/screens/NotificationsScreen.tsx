import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { TopAppBar } from '../components/layout/TopAppBar';
import { notificationsApi } from '../api/notifications';
import { websocketService } from '../services/websocketService';
import { DEFAULT_AVATAR } from '../features/circle/constants';
import type { Notification } from '../types/domain';
import { getImageUrl } from '../utils';

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsApi.getAll();
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError(res.error || '消息加载失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    await handleMarkAsRead(notification.id);
    if (notification.targetType === 'moment' && notification.targetId) {
      navigation.navigate('CircleDetail', { circleId: notification.targetId });
    } else if (notification.targetType === 'buddy') {
      navigation.navigate('BuddyCenter');
    } else if (notification.targetType === 'user') {
      navigation.navigate('Main', { screen: 'Circles' });
    } else if (notification.targetType === 'plan' && notification.targetId) {
      navigation.navigate('CreatePlan', { planId: notification.targetId });
    } else if (notification.targetType === 'habit') {
      navigation.navigate('Main', { screen: 'Calendar' });
    }
  };

  const handleReadAll = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    loadNotifications();

    // 监听 WebSocket 实时通知
    const handleNewNotification = (data: any) => {
      setNotifications(prev => [data, ...prev]);
    };

    websocketService.on('new_notification', handleNewNotification);

    return () => {
      websocketService.off('new_notification', handleNewNotification);
    };
  }, []);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'like':
        return { name: 'favorite', color: Colors.error };
      case 'comment':
      case 'reply':
        return { name: 'chat-bubble', color: Colors.primary };
      case 'achievement':
        return { name: 'stars', color: Colors.primary };
      case 'follow':
        return { name: 'person-add', color: Colors.tertiary };
      case 'buddy_request':
        return { name: 'handshake', color: Colors.secondary };
      case 'buddy_accepted':
        return { name: 'group', color: Colors.secondary };
      case 'buddy_encouragement':
        return { name: 'waving-hand', color: Colors.primary };
      case 'reminder':
        return { name: 'notifications-active', color: Colors.primary };
      case 'system':
      default:
        return { name: 'notifications', color: Colors.onSurfaceVariant };
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const iconConfig = getIconConfig(item.type);
    const isSocial = [
      'like',
      'comment',
      'reply',
      'follow',
      'buddy_request',
      'buddy_accepted',
      'buddy_encouragement',
    ].includes(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          {isSocial && item.sender ? (
            <Image
              source={{
                uri: getImageUrl(item.sender.avatar) || DEFAULT_AVATAR,
              }}
              style={styles.senderAvatar}
            />
          ) : (
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: `${iconConfig.color}15` },
              ]}
            >
              <MaterialIcons
                name={iconConfig.name as any}
                size={22}
                color={iconConfig.color}
              />
            </View>
          )}
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemTime}>{item.time || '刚刚'}</Text>
          </View>
          <Text style={styles.itemMessage} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={20}
          color={Colors.outlineVariant}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar
        title="消息中心"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="done-all"
        onRightPress={handleReadAll}
      />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadNotifications} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="notifications-none"
                size={64}
                color={Colors.outlineVariant}
              />
              <Text style={styles.emptyText}>{error || '暂时没有新消息'}</Text>
              {!!error && (
                <TouchableOpacity onPress={loadNotifications}>
                  <Text style={styles.retryText}>重新加载</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  unreadItem: {
    backgroundColor: `${Colors.primary}03`,
  },
  iconContainer: {
    position: 'relative',
  },
  senderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceVariant,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  itemTime: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  itemMessage: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
});

export default NotificationsScreen;
