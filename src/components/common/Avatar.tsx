import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  badge?: string;
  badgeColor?: string;
}

const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  xl: 20,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
  style,
  badge,
  badgeColor = Colors.secondary,
}) => {
  const sizeValue = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  }[size];

  const fontSizeValue = {
    small: FontSize.xs,
    medium: FontSize.sm,
    large: FontSize.md,
    xlarge: FontSize.xl,
  }[size];

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map(char => char[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[styles.container, { width: sizeValue, height: sizeValue }, style]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: Colors.primaryContainer,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: fontSizeValue }]}>
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              width: sizeValue * 0.3,
              height: sizeValue * 0.3,
              borderRadius: (sizeValue * 0.3) / 2,
            },
          ]}
        >
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLow,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
  badgeText: {
    color: Colors.onSecondary,
    fontSize: 8,
    fontWeight: '700',
  },
});
