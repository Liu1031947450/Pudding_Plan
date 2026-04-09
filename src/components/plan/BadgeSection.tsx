import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Card } from '../common/Card';
import type { Badge } from '../../types/domain';

interface BadgeSectionProps {
  badges: Badge[];
  onBadgePress?: (badge: Badge) => void;
}

export const BadgeSection: React.FC<BadgeSectionProps> = ({
  badges,
  onBadgePress,
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { marginBottom: Spacing.lg }]}>
        已获成就
      </Text>
      <View style={styles.badgesGrid}>
        {badges.slice(0, 6).map(badge => (
          <Card
            key={badge.id}
            style={styles.badgeCard}
            onPress={onBadgePress ? () => onBadgePress(badge) : undefined}
          >
            <View
              style={[
                styles.badgeIcon,
                { backgroundColor: badge.color },
              ]}
            >
              <MaterialIcons
                name={badge.icon}
                size={32}
                color={Colors.onSurface}
              />
            </View>
            <Text style={styles.badgeTitle}>{badge.title}</Text>
            <Text style={styles.badgeDesc}>{badge.description}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl * 1.5,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  badgeTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
