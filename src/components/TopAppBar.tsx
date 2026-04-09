import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface TopAppBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  leftIcon?: string;
  onLeftPress?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>{'\uE5E4'}</Text>
          </TouchableOpacity>
        )}
        {leftIcon && !showBackButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onLeftPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>{leftIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(250, 249, 248, 0.95)',
    borderBottomWidth: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconText: {
    fontSize: 24,
    color: Colors.primary,
  },
});
