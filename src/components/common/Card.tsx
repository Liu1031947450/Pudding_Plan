import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  gradient?: boolean;
  gradientColors?: [string, string, ...string[]];
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  variant = 'default',
  gradient = false,
  gradientColors = [Colors.primary, Colors.primaryContainer],
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'ghost' && styles.ghost,
    !gradient && style,
  ];

  const content = gradient ? (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.26, y: 1 }}
      style={styles.gradientContainer}
    >
      {children}
    </LinearGradient>
  ) : (
    children
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  elevated: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  outlined: {
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}26`,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}26`,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  gradientContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
});
