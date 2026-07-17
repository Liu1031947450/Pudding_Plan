import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';

interface PlanEmptyStateProps {
  onCreatePlan: () => void;
}

export const PlanEmptyState: React.FC<PlanEmptyStateProps> = ({
  onCreatePlan,
}) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyImageContainer}>
        <View style={styles.emptyImagePlaceholder}>
          <MaterialIcons
            name="spa"
            size={120}
            color={Colors.primaryContainer}
          />
        </View>
      </View>
      <Text style={styles.emptyTitle}>还没有计划？</Text>
      <Text style={styles.emptySubtitle}>
        开启你的第一个治愈计划，让成长自然发生。
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={onCreatePlan}>
        <MaterialIcons
          name="add-circle"
          size={24}
          color={Colors.onPrimaryContainer}
        />
        <Text style={styles.createButtonText}>创建治愈计划</Text>
      </TouchableOpacity>

      <View style={styles.templatesSection}>
        <Text style={styles.templatesSectionTitle}>从模板开始</Text>
        <View style={styles.templatesGrid}>
          <TouchableOpacity
            style={styles.templateCardWrapper}
            onPress={onCreatePlan}
          >
            <Card style={styles.templateCard}>
              <View
                style={[
                  styles.templateIcon,
                  { backgroundColor: Colors.secondaryContainer },
                ]}
              >
                <MaterialIcons name="spa" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.templateTitle}>晨间唤醒</Text>
              <Text style={styles.templateSubtitle}>21天习惯养成</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.templateCardWrapper}
            onPress={onCreatePlan}
          >
            <Card style={styles.templateCard}>
              <View
                style={[
                  styles.templateIcon,
                  { backgroundColor: Colors.tertiaryContainer },
                ]}
              >
                <MaterialIcons
                  name="menu-book"
                  size={24}
                  color={Colors.tertiary}
                />
              </View>
              <Text style={styles.templateTitle}>专注阅读</Text>
              <Text style={styles.templateSubtitle}>每周一本书</Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  emptyImageContainer: {
    marginBottom: Spacing.xl,
  },
  emptyImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 28,
    marginBottom: Spacing.xxl,
  },
  createButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    marginLeft: Spacing.sm,
  },
  templatesSection: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  templatesSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  templatesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  templateCardWrapper: {
    flex: 1,
  },
  templateCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  templateTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  templateSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
});
