import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomNavBar, TopAppBar, FloatingActionButton } from '../components';
import { CircleWaterfall, CircleDetailModal } from '../features/circle';
import { NotificationDrawer } from '../features/plan';
import { useCircleData } from '../hooks';
import { useNotificationState } from '../hooks/useNotificationState';
import type { Circle } from '../types/domain';

const CirclesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { circles, refreshData, loading } = useCircleData();
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const { notifications, markAsRead, refreshNotifications, unreadCount } =
    useNotificationState();

  // 当页面获得焦点时（包括从发布页返回），自动刷新动态列表
  useFocusEffect(
    useCallback(() => {
      refreshData();
      refreshNotifications();
    }, [refreshData, refreshNotifications])
  );

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  const handleCirclePress = (circle: Circle) => {
    setSelectedCircle(circle);
    setDetailVisible(true);
  };

  const handleCreatePost = () => {
    navigation.navigate('PostMoment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="menu"
        title="发现圈子"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        onRightPress={handleOpenNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>发现圈子</Text>
          <Text style={styles.mainSubtitle}>
            在温润的数字花园中，寻找志同道合的宁静灵魂。
          </Text>
        </View> */}

        <CircleWaterfall circles={circles} onCirclePress={handleCirclePress} />
      </ScrollView>

      <FloatingActionButton onPress={handleCreatePost} />

      <CircleDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        circle={selectedCircle}
      />

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
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  mainSubtitle: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    opacity: 0.8,
  },
});

export default CirclesScreen;
