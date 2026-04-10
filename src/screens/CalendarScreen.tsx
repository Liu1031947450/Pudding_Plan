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

const mockCalendarData: DayData[] = [
  { day: 26, hasActivity: false, isToday: false, isSelected: false },
  { day: 27, hasActivity: false, isToday: false, isSelected: false },
  { day: 28, hasActivity: false, isToday: false, isSelected: false },
  { day: 29, hasActivity: false, isToday: false, isSelected: false },
  { day: 1, hasActivity: false, isToday: false, isSelected: false },
  { day: 2, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 3,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 4,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 5, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 6,
    hasActivity: true,
    activityType: 'primary',
    isToday: false,
    isSelected: false,
  },
  { day: 7, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 8,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 9, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 10,
    hasActivity: true,
    activityType: 'tertiary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 11,
    hasActivity: true,
    activityType: 'primary',
    isToday: true,
    isSelected: true,
  },
  { day: 12, hasActivity: false, isToday: false, isSelected: false },
  { day: 13, hasActivity: false, isToday: false, isSelected: false },
  { day: 14, hasActivity: false, isToday: false, isSelected: false },
  { day: 15, hasActivity: false, isToday: false, isSelected: false },
  { day: 16, hasActivity: false, isToday: false, isSelected: false },
  { day: 17, hasActivity: false, isToday: false, isSelected: false },
];

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
  const [, setSelectedDay] = React.useState(11);
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
              <Text style={styles.monthLabel}>March 2024</Text>
              <Text style={styles.monthTitle}>Calendar</Text>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navButton}>
                <MaterialIcons
                  name="chevron-left"
                  size={24}
                  color={Colors.onSurface}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
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
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {mockCalendarData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    item.isSelected && styles.selectedDay,
                    item.isToday && styles.todayCell,
                  ]}
                  onPress={() => setSelectedDay(item.day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      item.isSelected && styles.selectedDayText,
                      item.isToday && styles.todayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                  {item.hasActivity && (
                    <View
                      style={[
                        styles.activityDot,
                        {
                          backgroundColor: getActivityColor(item.activityType),
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
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
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: `${Colors.primaryContainer}20`,
    borderRadius: BorderRadius.full,
  },
  todayCell: {},
  dayText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  selectedDayText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  todayText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  activityDot: {
    position: 'absolute',
    bottom: 6,
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
