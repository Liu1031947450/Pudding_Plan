import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';

interface PlanFormHeaderProps {
  planName: string;
  planIcon: string;
  planColor: string;
  isEditMode: boolean;
  categoryLabel?: string;
  description?: string;
}

export const PlanFormHeader: React.FC<PlanFormHeaderProps> = ({
  planName,
  planIcon,
  planColor,
  isEditMode,
  categoryLabel,
  description,
}) => {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroImage}>
        <View
          style={[
            styles.heroImagePlaceholder,
            { backgroundColor: `${planColor}20` },
          ]}
        >
          <MaterialIcons
            name={planIcon as any}
            size={48}
            color={Colors.primary}
          />
        </View>
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.heroLabel}>
          {categoryLabel || (isEditMode ? '编辑计划' : '开始新的旅程')}
        </Text>
        <Text style={styles.heroTitle}>{planName || '自定义计划'}</Text>
        {description && (
          <Text style={styles.heroDescription}>{description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroImage: {
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  heroImagePlaceholder: {
    flex: 1,
    backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {},
  heroLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  heroDescription: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
