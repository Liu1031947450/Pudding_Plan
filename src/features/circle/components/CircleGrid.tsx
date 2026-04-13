import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCard } from './CircleCard';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

type LegacyCircleCardData = {
  id: string;
  title: string;
  members: string;
  type: 'large' | 'small' | 'medium';
  imageUri?: string;
  category?: string;
};

interface CircleGridProps {
  circles: LegacyCircleCardData[];
  onCirclePress?: (circle: LegacyCircleCardData) => void;
}

export const CircleGrid: React.FC<CircleGridProps> = ({
  circles,
  onCirclePress,
}) => {
  const largeCircle = circles.find(c => c.type === 'large');
  const smallCircles = circles.filter(c => c.type === 'small');
  const mediumCircles = circles.filter(c => c.type === 'medium');

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>加入圈子</Text>
          <Text style={styles.sectionSubtitle}>静心独处的共享空间</Text>
        </View>
      </View>

      <View style={styles.circlesGrid}>
        {largeCircle && (
          <CircleCard
            circle={largeCircle}
            onPress={() => onCirclePress?.(largeCircle)}
          />
        )}

        {smallCircles.length > 0 && (
          <View style={styles.smallCirclesRow}>
            {smallCircles.map(circle => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onPress={() => onCirclePress?.(circle)}
              />
            ))}
          </View>
        )}

        {mediumCircles.map(circle => (
          <CircleCard
            key={circle.id}
            circle={circle}
            onPress={() => onCirclePress?.(circle)}
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
  circlesGrid: {
    gap: Spacing.md,
  },
  smallCirclesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
