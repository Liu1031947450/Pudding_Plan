import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Spacing } from '../../constants/theme';

interface BentoGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface BentoItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4;
  style?: ViewStyle;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, style }) => {
  return <View style={[styles.grid, style]}>{children}</View>;
};

export const BentoItem: React.FC<BentoItemProps> = ({ children, span = 1, style }) => {
  const itemStyle = [
    styles.item,
    span === 2 && styles.span2,
    span === 3 && styles.span3,
    span === 4 && styles.span4,
    style,
  ];

  return <View style={itemStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  item: {
    width: '50%',
    padding: Spacing.sm,
  },
  span2: {
    width: '100%',
  },
  span3: {
    width: '75%',
  },
  span4: {
    width: '100%',
  },
});
