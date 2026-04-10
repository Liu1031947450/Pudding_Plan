import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface PlanHeroSectionProps {
  planIcon: string;
  planColor: string;
  planName: string;
  category?: string;
  description?: string;
}

export const PlanHeroSection: React.FC<PlanHeroSectionProps> = ({
  planIcon,
  planColor,
  planName,
  category,
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
            size={64}
            color={Colors.primary}
          />
        </View>
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.heroLabel}>{category || '开始新的旅程'}</Text>
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroImage: {
    marginBottom: Spacing.lg,
  },
  heroImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageText: {
    fontSize: 64,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
});
