import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../constants/theme';

interface BloomProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const BloomProgress: React.FC<BloomProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  showPercentage = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    // Bloom animation: scale grows as progress increases
    Animated.spring(scaleAnim, {
      toValue: 1 + (progress / 100) * 0.1, // Scale from 1.0 to 1.1
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();

    // Color transition animation
    Animated.timing(colorAnim, {
      toValue: progress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Interpolate color from tertiaryContainer to secondaryContainer
  const strokeColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.tertiaryContainer, Colors.secondaryContainer],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceContainerHigh}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    fontWeight: '700',
  },
});
