import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../../constants/theme';
import { CircleWaterfallItem } from './CircleWaterfallItem';
import { CircleTopicCard } from './CircleTopicCard';
import type { CircleListItem } from '../types';

interface CircleWaterfallProps {
  circles: CircleListItem[];
  onCirclePress?: (circleId: string) => void;
  onCircleLongPress?: (circleId: string) => void;
}

export const CircleWaterfall: React.FC<CircleWaterfallProps> = ({
  circles,
  onCirclePress,
  onCircleLongPress,
}) => {
  const leftColumn: CircleListItem[] = [];
  const rightColumn: CircleListItem[] = [];

  circles.forEach((circle, index) => {
    if (index % 2 === 0) {
      leftColumn.push(circle);
    } else {
      rightColumn.push(circle);
    }
  });

  const renderItem = (circle: CircleListItem) => {
    if (circle.type === 'topic') {
      return (
        <CircleTopicCard
          key={circle.id}
          circle={circle}
          onPress={() => onCirclePress?.(circle.id)}
          onLongPress={() => onCircleLongPress?.(circle.id)}
        />
      );
    }

    return (
      <CircleWaterfallItem
        key={circle.id}
        circle={circle}
        onPress={() => onCirclePress?.(circle.id)}
        onLongPress={() => onCircleLongPress?.(circle.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>{leftColumn.map(renderItem)}</View>
      <View style={styles.column}>{rightColumn.map(renderItem)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
});
