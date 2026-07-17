import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface PlanGoalListProps {
  goals: string[];
}

export const PlanGoalList: React.FC<PlanGoalListProps> = ({ goals }) => {
  if (!goals || goals.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="flag" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>计划目标</Text>
      </View>
      <View style={styles.goalsList}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ))}
      </View>
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
  goalsList: {
    gap: Spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  goalText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    flex: 1,
  },
});
