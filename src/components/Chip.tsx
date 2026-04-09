import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface ChipProps {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'medium';
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  variant = 'primary',
  size = 'medium',
  selected = false,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const chipStyles = [
    styles.chip,
    styles[size],
    selected ? styles[`${variant}Selected`] : styles[variant],
    style,
  ];

  const textStyles = [
    styles.text,
    selected ? styles[`${variant}SelectedText`] : styles[`${variant}Text`],
  ];

  const content = (
    <>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={textStyles}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={chipStyles}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <View style={chipStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  small: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  medium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  primary: {
    backgroundColor: `${Colors.primaryContainer}50`,
  },
  primarySelected: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondaryContainer,
  },
  secondarySelected: {
    backgroundColor: Colors.secondary,
  },
  tertiary: {
    backgroundColor: Colors.tertiaryContainer,
  },
  tertiarySelected: {
    backgroundColor: Colors.tertiary,
  },
  surface: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  surfaceSelected: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  text: {
    fontWeight: '500',
    fontSize: FontSize.sm,
  },
  primaryText: {
    color: Colors.onPrimaryFixedVariant,
  },
  primarySelectedText: {
    color: Colors.onPrimary,
  },
  secondaryText: {
    color: Colors.onSecondaryContainer,
  },
  secondarySelectedText: {
    color: Colors.onSecondary,
  },
  tertiaryText: {
    color: Colors.onTertiaryFixedVariant,
  },
  tertiarySelectedText: {
    color: Colors.onTertiary,
  },
  surfaceText: {
    color: Colors.onSurfaceVariant,
  },
  surfaceSelectedText: {
    color: Colors.onSurfaceVariant,
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
});
