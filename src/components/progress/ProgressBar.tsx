import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primary,
  height = 8,
  style,
  showLabel = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate width change
    Animated.timing(widthAnim, {
      toValue: clampedProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Pulse animation when complete
    if (clampedProgress === 100) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [clampedProgress, widthAnim, pulseAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clampedProgress)}%</Text>
      )}
      <Animated.View style={[styles.track, { height, transform: [{ scaleX: pulseAnim }] }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  track: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
