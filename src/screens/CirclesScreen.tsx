import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize } from '../constants/theme';
import {
  BottomNavBar,
  TopAppBar,
  Card,
  NotificationDrawer,
} from '../components';
import { BuddyList, CircleGrid } from '../components/circle';
import { useCircleData } from '../hooks';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotificationState } from '../hooks/useNotificationState';

const CirclesScreen: React.FC = () => {
  const { buddies, circles } = useCircleData();
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const { notifications, markAsRead, refreshNotifications, unreadCount } = useNotificationState();

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  // 页面初始化时加载通知
  React.useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="spa"
        title="圈子"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        onRightPress={handleOpenNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.26, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>社交净土</Text>
            <Text style={styles.heroSubtitle}>
              在他人陪伴下寻找你的从容节奏。没有压力，只有共在。
            </Text>
          </LinearGradient>
        </View>

        <BuddyList
          buddies={buddies}
          onViewAll={() => {}}
          onBuddyPress={() => {}}
        />

        <CircleGrid circles={circles} onCirclePress={() => {}} />

        <View style={styles.section}>
          <Card style={styles.encouragementCard}>
            <View style={styles.encouragementHeader}>
              <View style={styles.encouragementIcon}>
                <MaterialIcons
                  name="favorite"
                  size={20}
                  color={Colors.onPrimaryContainer}
                />
              </View>
              <Text style={styles.encouragementTitle}>每日鼓励</Text>
            </View>
            <Text style={styles.encouragementText}>
              "成长不是一场竞赛，而是一段旅程。在这里，我们一起慢慢来。"
            </Text>
          </Card>
        </View>
      </ScrollView>

      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={() => setNotificationDrawerVisible(false)}
        notifications={notifications}
        onNotificationPress={markAsRead}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onPrimary,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.onPrimary,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  encouragementCard: {
    padding: Spacing.lg,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  encouragementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragementTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  encouragementText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default CirclesScreen;
