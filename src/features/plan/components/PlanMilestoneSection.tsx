import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';

interface Milestone {
  times: number;
  title: string;
  description: string;
  status: boolean;
}

interface PlanMilestoneSectionProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (index: number) => void;
  onDeleteMilestone: (index: number) => void;
}

export const PlanMilestoneSection: React.FC<PlanMilestoneSectionProps> = ({
  milestones,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="emoji-events" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>阶段里程碑</Text>
      </View>

      <View style={styles.milestonesGrid}>
        {milestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneCardWrapper}>
            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneNumber}>
                <Text style={styles.milestoneNumberText}>
                  {milestone.times.toString().padStart(2, '0')}
                </Text>
              </View>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneReward}>
                奖励：{milestone.description}
              </Text>
              <View style={styles.milestoneActions}>
                <TouchableOpacity onPress={() => onEditMilestone(index)}>
                  <Text style={styles.milestoneEdit}>修改奖励</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteMilestone(index)}>
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color={Colors.error}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addMilestoneButton}
        onPress={onAddMilestone}
      >
        <MaterialIcons name="add" size={20} color={Colors.onSurfaceVariant} />
        <Text style={styles.addMilestoneText}>添加里程碑阶段</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  milestoneCardWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  milestoneCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  milestoneNumberText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  milestoneTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  milestoneReward: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  milestoneActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    paddingTop: Spacing.sm,
  },
  milestoneEdit: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  addMilestoneButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  addMilestoneText: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
