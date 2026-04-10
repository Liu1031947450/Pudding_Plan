import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  BottomNavBar,
  TopAppBar,
  Card,
  Button,
  NotificationDrawer,
} from '../components';
import { useNotificationState } from '../hooks/useNotificationState';
import type { DayData } from '../types/domain';
import { usePlanManagement } from '../hooks';

import { calendarApi } from '../api/calendar';

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [quote, setQuote] = useState<{ text: string; author: string }>({
    text: '每一个不曾起舞的日子，都是对生命的辜负。',
    author: '尼采',
  });
  const [loading, setLoading] = useState(true);
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
    useNotificationState();

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const CHINESE_MONTHS = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  const fetchCalendarData = React.useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await calendarApi.getData(year, month, '1234567890');
        if (res.success && res.data) {
          setCalendarDays(res.data);
        }

        // 获取当天的金句
        const quoteRes = await calendarApi.getDailyQuote();
        if (quoteRes.success && quoteRes.data) {
          setQuote(quoteRes.data);
        }
      } finally {
        setLoading(false);
      }
    },
    [year, month],
  );

  // 当页面获得焦点时刷新通知、计划列表和日历数据
  useFocusEffect(
    React.useCallback(() => {
      const userId = '1234567890';
      refreshNotifications(userId);
      refreshPlans(userId);
      fetchCalendarData(true); // 每次切回来静默刷新
    }, [refreshNotifications, refreshPlans, fetchCalendarData]),
  );

  React.useEffect(() => {
    fetchCalendarData(true); // 切换日历静默刷新
  }, [fetchCalendarData]);

  const onCheckIn = async (planId: string) => {
    const selectedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(
      selectedDay,
    ).padStart(2, '0')}`;
    const result = await handleCheckIn(planId, selectedDateStr, '1234567890');
    if (result) {
      playStampAnimation(); // 如果打卡成功，播放动画
      fetchCalendarData(true); // 静默刷新，不触发全屏 loading
    }
  };

  const getActivityColor = (type?: 'primary' | 'secondary' | 'tertiary') => {
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
        onRightPress={handleOpenNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
              <View style={styles.monthHeader}>
                <View>
                  <Text style={styles.monthLabel}>{`${year}年`}</Text>
                  <Text style={styles.monthTitle}>
                    {CHINESE_MONTHS[month - 1]}
                  </Text>
                </View>
                <View style={styles.monthNav}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                      const today = new Date();
                      setCurrentDate(today);
                      setSelectedDay(today.getDate());
                    }}
                  >
                    <MaterialIcons
                      name="today"
                      size={20}
                      color={Colors.onSurface}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => setCurrentDate(new Date(year, month - 2, 1))}
                  >
                    <MaterialIcons
                      name="chevron-left"
                      size={24}
                      color={Colors.onSurface}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => setCurrentDate(new Date(year, month, 1))}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={Colors.onSurface}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Card style={styles.calendarCard}>
                <View style={styles.weekDays}>
                  {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                    <Text key={day} style={styles.weekDay}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {Array.from({
                    length: (() => {
                      const firstDay = new Date(year, month - 1, 1).getDay();
                      return firstDay === 0 ? 6 : firstDay - 1;
                    })(),
                  }).map((_, index) => (
                    <View
                      key={`empty-${index}`}
                      style={styles.dayCellContainer}
                    />
                  ))}

                  {Array.from({
                    length: new Date(year, month, 0).getDate(),
                  }).map((_, index) => {
                    const dayStr = index + 1;
                    const dayObj = calendarDays.find(d => d.day === dayStr) || {
                      day: dayStr,
                      hasActivity: false,
                      isToday: false,
                      isSelected: false,
                    };
                    const isSelected = selectedDay === dayStr;

                    return (
                      <View
                        key={`day-${dayStr}`}
                        style={styles.dayCellContainer}
                      >
                        <TouchableOpacity
                          style={[
                            styles.dayCell,
                            isSelected && styles.selectedDay,
                            dayObj.isToday && !isSelected && styles.todayCell,
                          ]}
                          onPress={() => setSelectedDay(dayStr)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.selectedDayText,
                              dayObj.isToday && !isSelected && styles.todayText,
                            ]}
                          >
                            {dayStr}
                          </Text>
                          {dayObj.hasActivity && (
                            <View
                              style={[
                                styles.activityDot,
                                {
                                  backgroundColor: getActivityColor(
                                    dayObj.activityType,
                                  ),
                                },
                              ]}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </Card>

              {/* 盖章动画浮层紧贴着日历模块 */}
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

            <View style={styles.habitsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={Colors.secondary}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>今日重点</Text>
                </View>
              </View>

              <View style={styles.habitsList}>
                {plans.map(plan => {
                  const selectedDayObj = calendarDays.find(
                    d => d.day === selectedDay,
                  );
                  const isCompleted = selectedDayObj?.completedPlanIds
                    ? selectedDayObj.completedPlanIds.includes(plan.id)
                    : false;

                  const now = new Date();
                  const isTodaySelected =
                    selectedDay === now.getDate() &&
                    month === now.getMonth() + 1 &&
                    year === now.getFullYear();

                  let buttonTitle = '点击盖章';
                  if (isCompleted) {
                    buttonTitle = '已盖章';
                  } else if (!isTodaySelected) {
                    buttonTitle = '非今日';
                  }

                  return (
                    <Card key={plan.id} style={styles.habitCard}>
                      <View style={styles.habitContent}>
                        <View
                          style={[
                            styles.habitIcon,
                            {
                              backgroundColor: isCompleted
                                ? Colors.tertiaryContainer
                                : plan.color || Colors.surfaceContainerHigh,
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={(plan.icon || 'stars') as any}
                            size={28}
                            color={
                              isCompleted
                                ? Colors.tertiary
                                : Colors.onSurfaceVariant
                            }
                          />
                        </View>
                        <View style={styles.habitInfo}>
                          <Text style={styles.habitTitle}>{plan.title}</Text>
                          <Text style={styles.habitSubtitle}>
                            {plan.totalDays
                              ? `目标: ${plan.totalDays}天`
                              : '通用计划'}
                          </Text>
                        </View>
                      </View>
                      <Button
                        title={buttonTitle}
                        onPress={() => onCheckIn(plan.id)}
                        variant={
                          isCompleted
                            ? 'outline'
                            : isTodaySelected
                            ? 'primary'
                            : 'outline'
                        }
                        size="small"
                        disabled={isCompleted || !isTodaySelected}
                      />
                    </Card>
                  );
                })}
              </View>

              <Card
                style={styles.quoteCard}
                gradient
                gradientColors={[Colors.primary, Colors.primaryContainer]}
              >
                <MaterialIcons
                  name="format-quote"
                  size={32}
                  color={Colors.onPrimaryContainer}
                />
                <Text style={styles.quoteText}>
                  "{quote.text}"{'\n'}
                  <Text style={styles.quoteAuthor}>—— {quote.author}</Text>
                </Text>
              </Card>
            </View>
          </>
        )}
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
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 24,
    paddingBottom: 120,
    flexGrow: 1, // 确保 loading 状态下能居中
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
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  monthLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  monthTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  monthNav: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },
  calendarCard: {
    padding: Spacing.md,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: `${Colors.onSurfaceVariant}80`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellContainer: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    position: 'relative',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
  },
  todayCell: {
    backgroundColor: `${Colors.primaryContainer}40`,
    borderRadius: BorderRadius.full,
  },
  dayText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  selectedDayText: {
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  todayText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stampOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 20,
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
  habitsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionIconText: {
    fontSize: 20,
    color: Colors.secondary,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  habitsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  habitIconText: {
    fontSize: 28,
  },
  habitInfo: {},
  habitTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  habitSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  quoteIcon: {
    fontSize: 32,
    color: Colors.onPrimaryContainer,
    marginRight: Spacing.md,
  },
  quoteText: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: FontSize.sm,
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginTop: 8,
  },
});

export default CalendarScreen;
