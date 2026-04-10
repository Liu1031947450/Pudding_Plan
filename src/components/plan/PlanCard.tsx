import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Card } from '../common/Card';
import { ProgressBar } from '../progress/ProgressBar';
import { BloomProgress } from '../progress/BloomProgress';
import type { Plan } from '../../types/domain';
import { getPlanDisplayData } from '../../utils/planUtils';

interface PlanCardProps {
  plan: Plan;
  onPress?: () => void;
  isManaging?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onPress,
  isManaging = false,
  isSelected = false,
  onToggleSelect,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}) => {
  // 从 completedDate 派生所有展示数据（completedDate 是唯一事实源）
  const { days, progress, streakBroken, subtitle } = getPlanDisplayData(plan);
  const color = plan.color ?? Colors.primaryContainer;
  const icon = plan.icon || '✨';

  return (
    <Card
      style={styles.planCard}
      gradient
      gradientColors={[Colors.primary, Colors.primaryContainer]}
      onPress={!isManaging ? onPress : undefined}
    >
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          {isManaging && (
            <TouchableOpacity style={styles.checkbox} onPress={onToggleSelect}>
              <View
                style={[
                  styles.checkboxInner,
                  isSelected && styles.checkboxChecked,
                ]}
              >
                {isSelected && (
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={Colors.onPrimary}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
          <View style={[styles.planIcon, { backgroundColor: color }]}>
            {/* 判断是 emoji 还是 MaterialIcon */}
            {icon.length <= 2 ? (
              <Text style={styles.planIconEmoji}>{icon}</Text>
            ) : (
              <MaterialIcons
                name={icon as any}
                size={24}
                color={Colors.onSurface}
              />
            )}
          </View>
          <View style={styles.planText}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.planActions}>
          {isManaging && (
            <View style={styles.dragHandle}>
              <TouchableOpacity disabled={!canMoveUp} onPress={onMoveUp}>
                <MaterialIcons
                  name="keyboard-arrow-up"
                  size={24}
                  color={!canMoveUp ? Colors.outlineVariant : Colors.onSurface}
                />
              </TouchableOpacity>
              <TouchableOpacity disabled={!canMoveDown} onPress={onMoveDown}>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color={
                    !canMoveDown ? Colors.outlineVariant : Colors.onSurface
                  }
                />
              </TouchableOpacity>
            </View>
          )}
          <BloomProgress progress={progress} size={56} strokeWidth={6} />
        </View>
      </View>
      <ProgressBar
        progress={progress}
        color={streakBroken ? Colors.error : progress >= 100 ? Colors.primary : Colors.tertiary}
        height={8}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  planCard: {
    padding: Spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkbox: {
    marginRight: Spacing.sm,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  planIconEmoji: {
    fontSize: 24,
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dragHandle: {
    flexDirection: 'column',
    marginRight: Spacing.xs,
  },
});
