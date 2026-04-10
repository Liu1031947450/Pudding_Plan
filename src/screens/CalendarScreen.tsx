import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

interface DayData {
  day: number;
  hasActivity: boolean;
  isToday: boolean;
  isSelected: boolean;
  activityType?: 'primary' | 'secondary' | 'tertiary';
}

import { calendarApi } from '../api/calendar';

interface Habit {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  completed: boolean;
  category: string;
}

const mockHabits: Habit[] = [
  {
    id: '1',
    title: '晨间补水',
    subtitle: '250ml goal',
    icon: 'local-drink',
    completed: true,
    category: 'Morning Ritual',
  },
  {
    id: '2',
    title: '数字脱毒',
    subtitle: '30 min focus',
    icon: 'phone-disabled',
    completed: false,
    category: 'Focus',
  },
];

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);

  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const { notifications, markAsRead, refreshNotifications, unreadCount } = useNotificationState();

  const handleOpenNotifications = () => {
    setNotificationDrawerVisible(true);
  };

  // 页面初始化时加载通知
  React.useEffect(() => {
    refreshNotifications('1234567890');
  }, [refreshNotifications]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const CHINESE_MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  React.useEffect(() => {
    const fetchCalendarData = async () => {
      const res = await calendarApi.getData(year, month, '1234567890');
      if (res.success && res.data) {
        setCalendarDays(res.data);
      }
    };
    fetchCalendarData();
  }, [year, month]);

  const getActivityColor = (type?: 'primary' | 'secondary' | 'tertiary') => {
    switch (type) {
      case 'primary':
        return Colors.primaryContainer;
      case 'secondary':
        return Colors.secondary;
      case 'tertiary':
        return Colors.tertiary;
      default:
        return 'transparent';
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
        <View style={styles.calendarSection}>
          <View style={styles.monthHeader}>
            <View>
              <Text style={styles.monthLabel}>
                {`${year}年`}
              </Text>
              <Text style={styles.monthTitle}>{CHINESE_MONTHS[month - 1]}</Text>
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
              {Array.from({ length: (() => {
                  const firstDay = new Date(year, month - 1, 1).getDay();
                  return firstDay === 0 ? 6 : firstDay - 1;
                })() }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.dayCellContainer} />
              ))}

              {Array.from({ length: new Date(year, month, 0).getDate() }).map((_, index) => {
                const dayStr = index + 1;
                const dayObj = calendarDays.find(d => d.day === dayStr) || {
                  day: dayStr,
                  hasActivity: false,
                  isToday: false,
                  isSelected: false,
                };
                const isSelected = selectedDay === dayStr;

                return (
                  <View key={`day-${dayStr}`} style={styles.dayCellContainer}>
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
                              backgroundColor: getActivityColor(dayObj.activityType),
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
            {mockHabits.map(habit => (
              <Card key={habit.id} style={styles.habitCard}>
                <View style={styles.habitContent}>
                  <View
                    style={[
                      styles.habitIcon,
                      {
                        backgroundColor: habit.completed
                          ? Colors.tertiaryContainer
                          : Colors.surfaceContainerHigh,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={habit.icon}
                      size={28}
                      color={
                        habit.completed
                          ? Colors.tertiary
                          : Colors.onSurfaceVariant
                      }
                    />
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.habitSubtitle}>{habit.subtitle}</Text>
                  </View>
                </View>
                <Button
                  title="点击盖章"
                  onPress={() => {}}
                  variant="primary"
                  size="small"
                />
              </Card>
            ))}
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
              "Taking a deep breath is the first step towards clarity."
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
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    paddingBottom: 140,
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
});

export default CalendarScreen;
