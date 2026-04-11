import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { BottomDrawer } from '../../../components/common/BottomDrawer';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'social' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationDrawerProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress?: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  visible,
  onClose,
  notifications,
  onNotificationPress,
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return 'notifications-active';
      case 'achievement':
        return 'workspace-premium';
      case 'social':
        return 'people';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return Colors.primary;
      case 'achievement':
        return Colors.secondary;
      case 'social':
        return Colors.tertiary;
      case 'system':
        return Colors.onSurfaceVariant;
      default:
        return Colors.primary;
    }
  };

  return (
    <BottomDrawer
      visible={visible}
      onClose={onClose}
      title="消息通知"
      height="80%"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="notifications-none"
              size={64}
              color={Colors.outlineVariant}
            />
            <Text style={styles.emptyText}>暂无新消息</Text>
            <Text style={styles.emptySubtext}>保持专注，继续前行</Text>
          </View>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.notificationUnread,
              ]}
              onPress={() => onNotificationPress?.(notification.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.notificationIcon,
                  {
                    backgroundColor: `${getNotificationColor(
                      notification.type,
                    )}15`,
                  },
                ]}
              >
                <MaterialIcons
                  name={getNotificationIcon(notification.type)}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  notificationUnread: {
    backgroundColor: `${Colors.primaryContainer}10`,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
  },
  notificationMessage: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  notificationTime: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    opacity: 0.7,
  },
});
