import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../../constants/theme';
import { CircleWaterfallItem } from './CircleWaterfallItem';
import type { Circle } from '../../../types/domain';

interface CircleWaterfallProps {
  circles: Circle[];
  onCirclePress?: (circle: Circle) => void;
}

export const CircleWaterfall: React.FC<CircleWaterfallProps> = ({
  circles,
  onCirclePress,
}) => {
  // Split circles into two columns
  const leftColumn: Circle[] = [];
  const rightColumn: Circle[] = [];

  circles.forEach((circle, index) => {
    if (index % 2 === 0) {
      leftColumn.push(circle);
    } else {
      rightColumn.push(circle);
    }
  });

  // Assign different heights to images based on index for a true waterfall feel
  const getImageHeight = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 160 + (hash % 100); // Variations between 160 and 260
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        {leftColumn.map(circle => (
          <CircleWaterfallItem
            key={circle.id}
            circle={circle}
            onPress={() => onCirclePress?.(circle)}
            style={{ 
              height: circle.type === 'topic' ? undefined : undefined, // topic card handles its own height
            }}
          />
        ))}
      </View>
      <View style={styles.column}>
        {rightColumn.map(circle => (
          <CircleWaterfallItem
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
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
});
