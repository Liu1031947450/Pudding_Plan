import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  BottomDrawer,
  BottomNavBar,
  Button,
  TopAppBar,
  Toast,
} from '../components';
import {
  CalendarHeader,
  CalendarGrid,
  TodayFocusSection,
  HabitSection,
  DailyQuoteCard,
  NotificationDrawer,
} from '../features/calendar';
import { useAppSettings, useNotifications } from '../contexts';
import type { DayData, Habit, Plan, PlanCheckInDetails } from '../types/domain';
import { usePlanManagement } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { calendarApi, habitsApi, type HabitInput } from '../api/calendar';
import { formatLocalDate, isDateInCheckInWindow } from '../utils/date';
import { syncNotificationSettings } from '../services/notificationScheduler';

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

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
  const [checkInPlan, setCheckInPlan] = useState<Plan | null>(null);
  const [numericValue, setNumericValue] = useState('');
  const [note, setNote] = useState('');
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const { plans, refreshPlans, handleCheckIn, handleRemoveCheckIn } =
    usePlanManagement();
  const { settings } = useAppSettings();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEditorVisible, setHabitEditorVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitSubtitle, setHabitSubtitle] = useState('');
  const [habitWeekdays, setHabitWeekdays] = useState<number[]>(ALL_WEEKDAYS);
  const [habitReminderTime, setHabitReminderTime] = useState('');
  const [habitStartDate, setHabitStartDate] = useState(
    formatLocalDate(new Date()),
  );
  const [habitActive, setHabitActive] = useState(true);
  const [habitSaving, setHabitSaving] = useState(false);

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
  const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(
    selectedDay,
  ).padStart(2, '0')}`;
  const canEditSelectedDate = isDateInCheckInWindow(selectedDate);

  const fetchHabits = React.useCallback(async () => {
    if (!currentUserId) {
      setHabits([]);
      return;
    }
    const response = await habitsApi.getAll(selectedDate);
    if (response.success && response.data) setHabits(response.data);
  }, [currentUserId, selectedDate]);

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
      fetchHabits();
    }, [
      currentUserId,
      refreshNotifications,
      refreshPlans,
      fetchCalendarData,
      fetchHabits,
    ]),
  );

  React.useEffect(() => {
    fetchCalendarData(true); // 切换日历静默刷新
  }, [fetchCalendarData]);

  React.useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

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
        fetchHabits(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    currentUserId,
    fetchCalendarData,
    fetchHabits,
    refreshPlans,
    refreshNotifications,
  ]);

  const submitCheckIn = async (plan: Plan, details?: PlanCheckInDetails) => {
    if (!currentUserId) {
      setToastMessage('请先登录后再打卡');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      setCheckInSubmitting(true);
      const result = await handleCheckIn(plan.id, selectedDate, details);
      if (result.success) {
        playStampAnimation();
        await Promise.all([fetchCalendarData(true), fetchHabits()]);
        setCheckInPlan(null);
        setToastMessage(result.message || '打卡成功');
        setToastType('success');
      } else {
        setToastMessage(result.error || '打卡失败，请重试');
        setToastType('error');
      }
    } catch {
      setToastMessage('打卡失败，请重试');
      setToastType('error');
    } finally {
      setCheckInSubmitting(false);
      setToastVisible(true);
    }
  };

  const onCheckIn = async (planId: string) => {
    const plan = plans.find(item => item.id === planId);
    if (!plan) return;

    if (plan.type === 0) {
      await submitCheckIn(plan);
      return;
    }

    const existing = plan.checkInRecords?.find(
      record => record.date === selectedDate,
    );
    setNumericValue(
      existing?.numericValue === null || existing?.numericValue === undefined
        ? ''
        : String(existing.numericValue),
    );
    setNote(existing?.note || '');
    setCheckInPlan(plan);
  };

  const removePlanCheckIn = async (planId: string) => {
    const response = await handleRemoveCheckIn(planId, selectedDate);
    if (response.success) {
      await fetchCalendarData(true);
      setToastMessage('打卡已撤销');
      setToastType('success');
    } else {
      setToastMessage(response.error || '撤销失败');
      setToastType('error');
    }
    setToastVisible(true);
  };

  const refreshHabitViews = async () => {
    await Promise.all([fetchHabits(), fetchCalendarData(true)]);
    await syncNotificationSettings(settings);
  };

  const openHabitEditor = (habit?: Habit) => {
    setEditingHabit(habit || null);
    setHabitTitle(habit?.title || '');
    setHabitSubtitle(habit?.subtitle || '');
    setHabitWeekdays(habit?.weekdays || ALL_WEEKDAYS);
    setHabitReminderTime(habit?.reminderTime || '');
    setHabitStartDate(habit?.startDate || formatLocalDate(new Date()));
    setHabitActive(habit?.isActive ?? true);
    setHabitEditorVisible(true);
  };

  const saveHabit = async () => {
    if (!habitTitle.trim()) {
      setToastMessage('请输入习惯名称');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (habitWeekdays.length === 0) {
      setToastMessage('请至少选择一个重复星期');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (
      habitReminderTime &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(habitReminderTime)
    ) {
      setToastMessage('提醒时间需使用 HH:mm 格式');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const payload: HabitInput = {
      title: habitTitle.trim(),
      subtitle: habitSubtitle.trim(),
      icon: editingHabit?.icon || 'task-alt',
      category: editingHabit?.category || '日常',
      weekdays: [...habitWeekdays].sort(),
      reminderTime: habitReminderTime || null,
      startDate: habitStartDate,
      isActive: habitActive,
    };
    setHabitSaving(true);
    try {
      const response = editingHabit
        ? await habitsApi.update(editingHabit.id, payload)
        : await habitsApi.create(payload);
      if (!response.success) {
        setToastMessage(response.error || '保存习惯失败');
        setToastType('error');
      } else {
        setHabitEditorVisible(false);
        await refreshHabitViews();
        setToastMessage(editingHabit ? '习惯已更新' : '习惯已创建');
        setToastType('success');
      }
    } finally {
      setHabitSaving(false);
      setToastVisible(true);
    }
  };

  const toggleHabitCheckIn = async (habit: Habit) => {
    const completed = habit.checkInDates.includes(selectedDate);
    const response = completed
      ? await habitsApi.removeCheckIn(habit.id, selectedDate)
      : await habitsApi.checkIn(habit.id, selectedDate);
    if (response.success) {
      await Promise.all([fetchHabits(), fetchCalendarData(true)]);
      setToastMessage(completed ? '习惯打卡已撤销' : '习惯打卡成功');
      setToastType('success');
    } else {
      setToastMessage(response.error || '习惯打卡失败');
      setToastType('error');
    }
    setToastVisible(true);
  };

  const toggleHabitActive = async (habit: Habit) => {
    const response = await habitsApi.update(habit.id, {
      isActive: !habit.isActive,
    });
    if (response.success) {
      await refreshHabitViews();
      setToastMessage(habit.isActive ? '习惯已停用' : '习惯已启用');
      setToastType('success');
    } else {
      setToastMessage(response.error || '更新习惯状态失败');
      setToastType('error');
    }
    setToastVisible(true);
  };

  const deleteHabit = async (habit: Habit) => {
    const runDelete = async () => {
      const response = await habitsApi.delete(habit.id);
      if (response.success) {
        await refreshHabitViews();
        setToastMessage('习惯已删除');
        setToastType('success');
      } else {
        setToastMessage(response.error || '删除习惯失败');
        setToastType('error');
      }
      setToastVisible(true);
    };

    if (Platform.OS === 'web') {
      const confirmDelete = (globalThis as any).confirm?.(
        `确定删除「${habit.title}」吗？`,
      );
      if (confirmDelete) await runDelete();
      return;
    }
    Alert.alert('删除习惯', `确定删除「${habit.title}」及其打卡记录吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          runDelete().catch(() => {
            setToastMessage('删除习惯失败，请重试');
            setToastType('error');
            setToastVisible(true);
          });
        },
      },
    ]);
  };

  const moveHabit = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= habits.length) return;
    const next = [...habits];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setHabits(next);
    const response = await habitsApi.reorder(next.map(habit => habit.id));
    if (!response.success) {
      await fetchHabits();
      setToastMessage(response.error || '习惯排序失败');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleDetailedCheckIn = async () => {
    if (!checkInPlan) return;

    if (checkInPlan.type === 1) {
      const value = Number(numericValue);
      if (
        numericValue.trim() === '' ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 9999999999.99
      ) {
        setToastMessage('请输入有效的非负数值');
        setToastType('error');
        setToastVisible(true);
        return;
      }
      await submitCheckIn(checkInPlan, { numericValue: value });
      return;
    }

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setToastMessage('请写下本次打卡内容');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    await submitCheckIn(checkInPlan, { note: trimmedNote });
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
                onPrevMonth={() => {
                  setCurrentDate(new Date(year, month - 2, 1));
                  setSelectedDay(1);
                }}
                onNextMonth={() => {
                  setCurrentDate(new Date(year, month, 1));
                  setSelectedDay(1);
                }}
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
              canEditDate={canEditSelectedDate}
              onCheckIn={onCheckIn}
              onRemoveCheckIn={removePlanCheckIn}
            />

            <HabitSection
              habits={habits}
              selectedDate={selectedDate}
              canEditDate={canEditSelectedDate}
              onAdd={() => openHabitEditor()}
              onEdit={openHabitEditor}
              onDelete={deleteHabit}
              onToggleActive={toggleHabitActive}
              onToggleCheckIn={toggleHabitCheckIn}
              onMove={moveHabit}
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

      <BottomDrawer
        visible={checkInPlan !== null}
        onClose={() => setCheckInPlan(null)}
        title={checkInPlan?.type === 1 ? '记录本次数值' : '写下打卡日记'}
        height="auto"
      >
        <View style={styles.checkInDrawerContent}>
          <Text style={styles.checkInPlanTitle}>{checkInPlan?.title}</Text>
          {checkInPlan?.type === 1 ? (
            <TextInput
              value={numericValue}
              onChangeText={setNumericValue}
              placeholder="例如：30"
              placeholderTextColor={Colors.outline}
              keyboardType="decimal-pad"
              style={styles.checkInInput}
              autoFocus
            />
          ) : (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="记录今天的感受或收获..."
              placeholderTextColor={Colors.outline}
              multiline
              maxLength={5000}
              style={[styles.checkInInput, styles.checkInNoteInput]}
              textAlignVertical="top"
              autoFocus
            />
          )}
          <Button
            title="完成打卡"
            onPress={handleDetailedCheckIn}
            loading={checkInSubmitting}
            disabled={checkInSubmitting}
          />
        </View>
      </BottomDrawer>

      <BottomDrawer
        visible={habitEditorVisible}
        onClose={() => setHabitEditorVisible(false)}
        title={editingHabit ? '编辑快捷习惯' : '新建快捷习惯'}
        height="85%"
      >
        <ScrollView contentContainerStyle={styles.habitForm}>
          <Text style={styles.formLabel}>习惯名称</Text>
          <TextInput
            value={habitTitle}
            onChangeText={setHabitTitle}
            placeholder="例如：喝水 8 杯"
            placeholderTextColor={Colors.outline}
            maxLength={100}
            style={styles.checkInInput}
          />
          <Text style={styles.formLabel}>补充说明</Text>
          <TextInput
            value={habitSubtitle}
            onChangeText={setHabitSubtitle}
            placeholder="可选"
            placeholderTextColor={Colors.outline}
            maxLength={200}
            style={styles.checkInInput}
          />
          <View style={styles.formHeaderRow}>
            <Text style={styles.formLabel}>重复星期</Text>
            <TouchableOpacity onPress={() => setHabitWeekdays(ALL_WEEKDAYS)}>
              <Text style={styles.formLink}>每天</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekdayRow}>
            {ALL_WEEKDAYS.map(day => {
              const selected = habitWeekdays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.weekdayButton,
                    selected && styles.weekdayButtonActive,
                  ]}
                  onPress={() =>
                    setHabitWeekdays(current =>
                      current.includes(day)
                        ? current.filter(value => value !== day)
                        : [...current, day],
                    )
                  }
                >
                  <Text
                    style={[
                      styles.weekdayText,
                      selected && styles.weekdayTextActive,
                    ]}
                  >
                    {WEEKDAY_LABELS[day]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.formLabel}>开始日期</Text>
          <TextInput
            value={habitStartDate}
            onChangeText={setHabitStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.outline}
            style={styles.checkInInput}
          />
          <Text style={styles.formLabel}>提醒时间（可选）</Text>
          <TextInput
            value={habitReminderTime}
            onChangeText={setHabitReminderTime}
            placeholder="例如 08:30，留空则不提醒"
            placeholderTextColor={Colors.outline}
            maxLength={5}
            style={styles.checkInInput}
          />
          <View style={styles.activeRow}>
            <View>
              <Text style={styles.formLabel}>启用习惯</Text>
              <Text style={styles.formHint}>
                停用后不再提醒，也不能继续打卡
              </Text>
            </View>
            <Switch value={habitActive} onValueChange={setHabitActive} />
          </View>
          <Button
            title={editingHabit ? '保存修改' : '创建习惯'}
            onPress={saveHabit}
            loading={habitSaving}
            disabled={habitSaving}
          />
        </ScrollView>
      </BottomDrawer>

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
  checkInDrawerContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  checkInPlanTitle: {
    color: Colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  checkInInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  checkInNoteInput: {
    minHeight: 140,
  },
  habitForm: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  formLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  formHint: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  formLink: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  weekdayButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  weekdayButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  weekdayText: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  weekdayTextActive: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
});

export default CalendarScreen;
