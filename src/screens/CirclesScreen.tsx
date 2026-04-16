import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomNavBar, TopAppBar, FloatingActionButton } from '../components';
import { CircleWaterfall, CircleDetailModal } from '../features/circle';
import { NotificationDrawer } from '../features/plan';
import { useCircleData } from '../hooks';
import { useNotifications } from '../contexts';
import { useAuth } from '../contexts/AuthContext';

const CirclesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { circles, refreshData, loading } = useCircleData();
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedCircleId(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="menu"
        title="发现圈子"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        notificationCount={unreadCount}
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
