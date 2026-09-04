import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import type { Plan } from '../../../types/domain';

interface TodayFocusSectionProps {
  plans: Plan[];
  selectedDay: number;
  month: number;
  year: number;
  canEditDate: boolean;
  onCheckIn: (planId: string) => void;
  onRemoveCheckIn: (planId: string) => void;
}

export const TodayFocusSection: React.FC<TodayFocusSectionProps> = ({
  plans,
  selectedDay,
  month,
  year,
  canEditDate,
  onCheckIn,
  onRemoveCheckIn,
}) => {
  const activePlans = plans.filter(
    plan => (plan.status || 'active') === 'active',
  );
  const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(
    selectedDay,
  ).padStart(2, '0')}`;

  return (
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
        {activePlans.length === 0 && (
          <Text style={styles.emptyText}>暂无进行中的计划</Text>
        )}
        {activePlans.map(plan => {
          const isCompleted = plan.completedDate.includes(selectedDate);
          const record = plan.checkInRecords?.find(
            item => item.date === selectedDate,
          );
          const recordSummary =
            record?.numericValue !== null && record?.numericValue !== undefined
              ? `已记录：${record.numericValue}`
              : record?.note
              ? `记录：${record.note}`
              : null;

          let buttonTitle =
            plan.type === 1
              ? '记录数值'
              : plan.type === 2
              ? '写下日记'
              : '点击盖章';
          if (isCompleted) {
            buttonTitle =
              canEditDate && plan.type === 1
                ? '编辑数值'
                : canEditDate && plan.type === 2
                ? '编辑日记'
                : '撤销打卡';
          } else if (!canEditDate) {
            buttonTitle = '不可补签';
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
                        : (plan.color || Colors.surfaceContainerHigh) + '20',
                    },
                  ]}
                >
                  <MaterialIcons
                    name={(plan.icon || 'stars') as any}
                    size={28}
                    color={
                      isCompleted
                        ? Colors.tertiary
                        : plan.color || Colors.primary
                    }
                  />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{plan.title}</Text>
                  <Text style={styles.habitSubtitle} numberOfLines={1}>
                    {recordSummary ||
                      (plan.totalDays
                        ? `目标: ${plan.totalDays}天`
                        : '通用计划')}
                  </Text>
                </View>
              </View>
              <View style={styles.actionGroup}>
                <Button
                  title={buttonTitle}
                  onPress={() =>
                    isCompleted && plan.type === 0
                      ? onRemoveCheckIn(plan.id)
                      : onCheckIn(plan.id)
                  }
                  variant={
                    isCompleted
                      ? 'outline'
                      : canEditDate
                      ? 'primary'
                      : 'outline'
                  }
                  size="small"
                  disabled={!canEditDate}
                />
                {isCompleted && plan.type !== 0 && canEditDate && (
                  <TouchableOpacity onPress={() => onRemoveCheckIn(plan.id)}>
                    <Text style={styles.undoText}>撤销</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: `${Colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  habitsList: {
    gap: Spacing.md,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  habitSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  actionGroup: {
    alignItems: 'center',
    gap: 4,
  },
  undoText: {
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  emptyText: {
    paddingVertical: Spacing.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
