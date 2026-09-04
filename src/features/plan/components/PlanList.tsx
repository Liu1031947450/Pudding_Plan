import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { PlanCard } from './PlanCard';
import type { Plan } from '../../../types/domain';

interface PlanListProps {
  title?: string;
  plans: Plan[];
  isManaging: boolean;
  selectedPlans: Set<string>;
  onToggleManage: () => void;
  onToggleSelect: (id: string) => void;
  onDeleteSelected: () => void;
  onMovePlan: (fromIndex: number, toIndex: number) => void;
  onCreatePlan: () => void;
  onPlanPress?: (plan: Plan) => void;
  onStatusChange?: (
    plan: Plan,
    status: 'active' | 'paused' | 'archived',
  ) => void;
  showManagement?: boolean;
  showCreate?: boolean;
}

export const PlanList: React.FC<PlanListProps> = ({
  title = '正在进行',
  plans,
  isManaging,
  selectedPlans,
  onToggleManage,
  onToggleSelect,
  onDeleteSelected,
  onMovePlan,
  onCreatePlan,
  onPlanPress,
  onStatusChange,
  showManagement = true,
  showCreate = true,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showManagement && (
          <TouchableOpacity onPress={onToggleManage}>
            <Text style={styles.manageText}>
              {isManaging ? '完成' : '管理计划'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isManaging && selectedPlans.size > 0 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeleteSelected}
        >
          <MaterialIcons name="delete" size={20} color={Colors.onError} />
          <Text style={styles.deleteButtonText}>
            删除 ({selectedPlans.size})
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.plansList}>
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isManaging={isManaging}
            isSelected={selectedPlans.has(plan.id)}
            onToggleSelect={() => onToggleSelect(plan.id)}
            onMoveUp={() => onMovePlan(index, index - 1)}
            onMoveDown={() => onMovePlan(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < plans.length - 1}
            onPress={() => onPlanPress?.(plan)}
            onStatusChange={status => onStatusChange?.(plan, status)}
          />
        ))}

        {showCreate && (
          <TouchableOpacity style={styles.addPlanCard} onPress={onCreatePlan}>
            <View style={styles.addIconWrapper}>
              <MaterialIcons name="add" size={24} color={Colors.outline} />
            </View>
            <Text style={styles.addText}>开启新计划</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  manageText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  deleteButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onError,
    marginLeft: Spacing.xs,
  },
  plansList: {
    gap: Spacing.sm,
  },
  addPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  addIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  addText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
