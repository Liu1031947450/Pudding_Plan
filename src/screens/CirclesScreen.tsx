import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  BottomNavBar,
  TopAppBar,
  FloatingActionButton,
  Toast,
} from '../components';
import {
  BuddyList,
  CircleWaterfall,
  CircleDetailModal,
} from '../features/circle';
import { NotificationDrawer } from '../features/plan';
import { useCircleData } from '../hooks';
import { useNotifications } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import { buddiesApi } from '../api';

const CirclesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { buddies, circles, refreshData, loading, error } = useCircleData();
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const { notifications, markAsRead, refreshNotifications, unreadCount } =
    useNotifications();

  const displayCircles = useMemo(
    () =>
      circles.map(circle => {
        if (circle.type !== 'waterfall') {
          return circle;
        }

        const isOwn =
          !!currentUserId &&
          !!circle.authorUserId &&
          String(circle.authorUserId) === String(currentUserId);

        return {
          ...circle,
          authorName: isOwn ? '我' : circle.authorName,
        };
      }),
    [circles, currentUserId],
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentUserId) {
        return;
      }

      refreshData();
      refreshNotifications();
    }, [currentUserId, refreshData, refreshNotifications]),
  );

  useEffect(() => {
    if (error) {
      setToast({ visible: true, message: error });
    }
  }, [error]);

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  const handleCirclePress = (circleId: string) => {
    setSelectedCircleId(circleId);
    setDetailVisible(true);
  };

  const handleCreatePost = () => {
    navigation.navigate('PostMoment');
  };

  const requestBuddy = async (userId: string) => {
    const response = await buddiesApi.request(userId);
    setToast({
      visible: true,
      message: response.success
        ? '搭子请求已发送'
        : response.error || '请求发送失败',
    });
    if (response.success) await refreshData();
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedCircleId(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="group-add"
        title="发现圈子"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        notificationCount={unreadCount}
        onLeftPress={() => navigation.navigate('BuddyCenter')}
        onRightPress={handleOpenNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        <BuddyList
          buddies={buddies.slice(0, 2)}
          onViewAll={() => navigation.navigate('BuddyCenter')}
          onBuddyPress={buddy => requestBuddy(buddy.id)}
        />
        <CircleWaterfall
          circles={displayCircles}
          onCirclePress={handleCirclePress}
        />
      </ScrollView>

      <FloatingActionButton onPress={handleCreatePost} />

      <CircleDetailModal
        visible={detailVisible}
        onClose={handleCloseDetail}
        circleId={selectedCircleId}
        onDataChange={refreshData}
      />

      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={() => setNotificationDrawerVisible(false)}
        notifications={notifications}
        onNotificationPress={id => markAsRead(id)}
        navigation={navigation}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={error && toast.message === error ? 'error' : 'success'}
        onHide={() => setToast(value => ({ ...value, visible: false }))}
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
});

export default CirclesScreen;
