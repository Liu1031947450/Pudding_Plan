import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BuddyCard } from './BuddyCard';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import type { Buddy } from '../../../types/domain';

interface BuddyListProps {
  buddies: Buddy[];
  onViewAll?: () => void;
  onBuddyPress?: (buddy: Buddy) => void;
}

export const BuddyList: React.FC<BuddyListProps> = ({
  buddies,
  onViewAll,
  onBuddyPress,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>找个搭子</Text>
          <Text style={styles.sectionSubtitle}>连接志同道合的成长伙伴</Text>
        </View>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buddiesGrid}>
        {buddies.map((buddy, index) => (
          <BuddyCard
            key={buddy.id}
            buddy={buddy}
            variant={index === 0 ? 'primary' : 'secondary'}
            offset={index === 1}
            onPress={() => onBuddyPress?.(buddy)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  buddiesGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
