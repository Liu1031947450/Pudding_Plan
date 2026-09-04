import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { BloomProgress } from '../../../components/progress/BloomProgress';
import type { Plan } from '../../../types/domain';
import { getPlanDisplayData } from '../../../utils/planUtils';

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
  onStatusChange?: (status: 'active' | 'paused' | 'archived') => void;
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
  onStatusChange,
}) => {
  // 从服务端打卡记录的 completedDate 投影派生展示数据
  const { progress, streakBroken, subtitle } = getPlanDisplayData(plan);
  const color = plan.color ?? Colors.primaryContainer;
  const icon = plan.icon || 'stars';
  const status = plan.status || 'active';

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
            <MaterialIcons
              name={icon as any}
              size={24}
              color={Colors.onSurface}
            />
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
        color={
          streakBroken
            ? Colors.error
            : progress >= 100
            ? Colors.primary
            : Colors.tertiary
        }
        height={8}
      />
      {!isManaging && onStatusChange && (
        <View style={styles.statusActions}>
          {status === 'active' && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => onStatusChange('paused')}
            >
              <MaterialIcons
                name="pause"
                size={16}
                color={Colors.onSurfaceVariant}
              />
              <Text style={styles.statusButtonText}>暂停</Text>
            </TouchableOpacity>
          )}
          {status !== 'active' && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => onStatusChange('active')}
            >
              <MaterialIcons
                name="play-arrow"
                size={16}
                color={Colors.primary}
              />
              <Text style={[styles.statusButtonText, styles.resumeText]}>
                恢复
              </Text>
            </TouchableOpacity>
          )}
          {status !== 'archived' && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => onStatusChange('archived')}
            >
              <MaterialIcons
                name="archive"
                size={16}
                color={Colors.onSurfaceVariant}
              />
              <Text style={styles.statusButtonText}>归档</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  statusButtonText: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  resumeText: {
    color: Colors.primary,
  },
});
