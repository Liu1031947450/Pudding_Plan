import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText as Text } from '../../../components/common/AppText';
import { Card } from '../../../components/common/Card';
import { Colors, FontSize, Spacing } from '../../../constants/theme';
import type { Habit } from '../../../types/domain';
import {
  addLocalDays,
  formatLocalDate,
  parseLocalDate,
} from '../../../utils/date';

interface HabitSectionProps {
  habits: Habit[];
  selectedDate: string;
  canEditDate: boolean;
  onAdd: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggleActive: (habit: Habit) => void;
  onToggleCheckIn: (habit: Habit) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export const HabitSection: React.FC<HabitSectionProps> = ({
  habits,
  selectedDate,
  canEditDate,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleCheckIn,
  onMove,
}) => {
  const today = formatLocalDate(new Date());
  const recentDates = Array.from({ length: 7 }, (_, index) =>
    addLocalDays(today, index - 6),
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>快捷习惯</Text>
          <Text style={styles.subtitle}>打卡范围为今天及过去 6 个自然日</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <MaterialIcons
            name="add"
            size={18}
            color={Colors.onPrimaryContainer}
          />
          <Text style={styles.addButtonText}>新建</Text>
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <Card style={styles.emptyCard} variant="outlined">
          <Text style={styles.emptyText}>还没有快捷习惯，先创建一个吧。</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {habits.map((habit, index) => {
            const completed = habit.checkInDates.includes(selectedDate);
            const repeatText =
              habit.weekdays.length === 7
                ? '每天'
                : `周${habit.weekdays
                    .map(day => WEEKDAY_LABELS[day])
                    .join('、')}`;
            const checkInDisabled =
              !canEditDate || !habit.isActive || !habit.scheduledToday;

            return (
              <Card key={habit.id} style={styles.card} variant="outlined">
                <View style={styles.cardHeader}>
                  <View style={styles.icon}>
                    <MaterialIcons
                      name={(habit.icon || 'task-alt') as any}
                      size={24}
                      color={habit.isActive ? Colors.secondary : Colors.outline}
                    />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.meta}>
                      {repeatText} · 连续 {habit.currentStreak} 天
                      {habit.reminderTime
                        ? ` · ${habit.reminderTime} 提醒`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      completed && styles.checkedButton,
                    ]}
                    disabled={checkInDisabled}
                    onPress={() => onToggleCheckIn(habit)}
                  >
                    <MaterialIcons
                      name={completed ? 'check' : 'add-task'}
                      size={18}
                      color={
                        checkInDisabled
                          ? Colors.outlineVariant
                          : completed
                          ? Colors.onPrimary
                          : Colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.checkText,
                        completed && styles.checkedText,
                        checkInDisabled && styles.disabledText,
                      ]}
                    >
                      {completed
                        ? '撤销'
                        : habit.scheduledToday
                        ? '打卡'
                        : '非计划日'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentRow}>
                  {recentDates.map(date => {
                    const hit = habit.checkInDates.includes(date);
                    return (
                      <View key={date} style={styles.recentDay}>
                        <Text style={styles.recentLabel}>
                          {WEEKDAY_LABELS[parseLocalDate(date).getDay()]}
                        </Text>
                        <View
                          style={[
                            styles.recentDot,
                            hit && styles.recentDotDone,
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    disabled={index === 0}
                    onPress={() => onMove(index, index - 1)}
                  >
                    <MaterialIcons
                      name="arrow-upward"
                      size={18}
                      color={
                        index === 0
                          ? Colors.outlineVariant
                          : Colors.onSurfaceVariant
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={index === habits.length - 1}
                    onPress={() => onMove(index, index + 1)}
                  >
                    <MaterialIcons
                      name="arrow-downward"
                      size={18}
                      color={
                        index === habits.length - 1
                          ? Colors.outlineVariant
                          : Colors.onSurfaceVariant
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onEdit(habit)}>
                    <Text style={styles.actionText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onToggleActive(habit)}>
                    <Text style={styles.actionText}>
                      {habit.isActive ? '停用' : '启用'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(habit)}>
                    <Text style={styles.deleteText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.onSurface },
  subtitle: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  list: { gap: Spacing.sm },
  emptyCard: { padding: Spacing.lg },
  emptyText: { textAlign: 'center', color: Colors.onSurfaceVariant },
  card: { padding: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryContainer,
    marginRight: Spacing.sm,
  },
  info: { flex: 1 },
  habitTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  meta: { marginTop: 2, fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  checkedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkedText: { color: Colors.onPrimary },
  disabledText: { color: Colors.outlineVariant },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  recentDay: { alignItems: 'center', gap: 4 },
  recentLabel: { fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceDim,
  },
  recentDotDone: { backgroundColor: Colors.secondary },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.error },
});
