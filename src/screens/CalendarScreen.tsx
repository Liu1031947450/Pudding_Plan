import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
import { BottomNavBar, TopAppBar, Toast } from '../components';
import {
  CalendarHeader,
  CalendarGrid,
  TodayFocusSection,
  DailyQuoteCard,
  NotificationDrawer,
} from '../features/calendar';
import { useNotifications } from '../contexts';
import type { DayData } from '../types/domain';
import { usePlanManagement } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { calendarApi } from '../api/calendar';

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [quote, setQuote] = useState<{ text: string; author: string }>({
    text: '每一个不曾起舞的日子，都是对生命的辜负。',
    author: '尼采',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'success',
  );
  const { plans, refreshPlans, handleCheckIn } = usePlanManagement();

  // 盖章动画状态
  const stampAnim = React.useRef(new Animated.Value(0)).current;

  // 播放印章砸下动画
  const playStampAnimation = () => {
    stampAnim.setValue(0);

    Animated.spring(stampAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // 2秒后逐渐消失
    setTimeout(() => {
      Animated.timing(stampAnim, {
        toValue: 2,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const stampScale = stampAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [3, 1, 1], // 从很大(3)缩小到正常(1)
  });

  const stampOpacity = stampAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0], // 淡入，保持，然后淡出
  });

  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const { notifications, markAsRead, refreshNotifications, unreadCount } =
    useNotifications();

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchCalendarData = React.useCallback(
    async (silent = false) => {
      if (!currentUserId) {
        setCalendarDays([]);
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      try {
        const res = await calendarApi.getData(year, month);
        if (res.success && res.data) {
          setCalendarDays(res.data);
        }

        const quoteRes = await calendarApi.getDailyQuote();
        if (quoteRes.success && quoteRes.data) {
          setQuote(quoteRes.data);
        }
      } finally {
        setLoading(false);
      }
    },
    [year, month, currentUserId],
  );

  // 当页面获得焦点时刷新通知、计划列表和日历数据
  useFocusEffect(
    React.useCallback(() => {
      if (!currentUserId) return;
      refreshNotifications();
      refreshPlans(currentUserId);
      fetchCalendarData(true);
    }, [currentUserId, refreshNotifications, refreshPlans, fetchCalendarData]),
  );

  React.useEffect(() => {
    fetchCalendarData(true); // 切换日历静默刷新
  }, [fetchCalendarData]);

  const handleRefresh = React.useCallback(async () => {
    if (!currentUserId) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all([
        fetchCalendarData(true),
        refreshPlans(currentUserId, true),
        refreshNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [currentUserId, fetchCalendarData, refreshPlans, refreshNotifications]);

  const onCheckIn = async (planId: string) => {
    if (!currentUserId) {
      setToastMessage('请先登录后再打卡');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      const selectedDateStr = `${year}-${String(month).padStart(
        2,
        '0',
      )}-${String(selectedDay).padStart(2, '0')}`;
      const result = await handleCheckIn(
        planId,
        selectedDateStr,
        currentUserId,
      );
      if (result.success) {
        playStampAnimation();
        fetchCalendarData(true);
        setToastMessage('打卡成功');
        setToastType('success');
      } else {
        setToastMessage(result.error || '打卡失败，请重试');
        setToastType('error');
      }
    } catch (error) {
      setToastMessage('打卡失败，请重试');
      setToastType('error');
    } finally {
      setToastVisible(true);
    }
  };

  const getActivityColor = (type?: string) => {
    switch (type) {
      case 'primary':
        return '#4CAF50'; // 协调生机的质感绿色
      case 'secondary':
        return Colors.secondary;
      case 'tertiary':
        return Colors.tertiary;
      default:
        return '#4CAF50';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="spa"
        title="日历"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        notificationCount={unreadCount}
        onRightPress={handleOpenNotifications}
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
        ) : (
          <>
            <View style={styles.calendarSection}>
              <CalendarHeader
                year={year}
                month={month}
                onPrevMonth={() => setCurrentDate(new Date(year, month - 2, 1))}
                onNextMonth={() => setCurrentDate(new Date(year, month, 1))}
                onGoToToday={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDay(today.getDate());
                }}
              />

              <CalendarGrid
                year={year}
                month={month}
                calendarDays={calendarDays}
                selectedDay={selectedDay}
                onDayPress={setSelectedDay}
                getActivityColor={getActivityColor}
              />

              <Animated.View
                style={[
                  styles.stampOverlay,
                  {
                    opacity: stampOpacity,
                    transform: [{ scale: stampScale }, { rotate: '-15deg' }],
                  },
                ]}
                pointerEvents="none"
              >
                <View style={styles.stampInner}>
                  <Text style={styles.stampText}>完成!</Text>
                </View>
              </Animated.View>
            </View>

            <TodayFocusSection
              plans={plans}
              selectedDay={selectedDay}
              month={month}
              year={year}
              calendarDays={calendarDays}
              onCheckIn={onCheckIn}
            />

            <DailyQuoteCard quote={quote} />
          </>
        )}
      </ScrollView>

      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={() => setNotificationDrawerVisible(false)}
        notifications={notifications}
        onNotificationPress={id => markAsRead(id)}
        navigation={navigation}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <BottomNavBar />
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
    paddingTop: 24,
    paddingBottom: 120,
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
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  calendarSection: {
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  stampOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 20,
    top: 60, // 避开 Header
  },
  stampInner: {
    borderWidth: 8,
    borderColor: '#4CAF50',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  stampText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
});

export default CalendarScreen;
