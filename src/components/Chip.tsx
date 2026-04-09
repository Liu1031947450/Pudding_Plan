import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
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
      <TouchableOpacity style={chipStyles} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
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
