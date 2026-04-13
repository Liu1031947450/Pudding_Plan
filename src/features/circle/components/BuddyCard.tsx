import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { Avatar } from '../../../components/common/Avatar';
import type { Buddy } from '../../../types/domain';

interface BuddyCardProps {
  buddy: Buddy;
  variant?: 'primary' | 'secondary';
  offset?: boolean;
  onPress?: () => void;
}

export const BuddyCard: React.FC<BuddyCardProps> = ({
  buddy,
  variant = 'primary',
  offset = false,
  onPress,
}) => {
  return (
    <Card style={[styles.buddyCard, offset && styles.buddyCardOffset]}>
      <Avatar
        uri={buddy.avatarUri}
        name={buddy.name}
        size="large"
        style={styles.buddyAvatar}
      />
      <Text style={styles.buddyName}>{buddy.name}</Text>
      <Text style={styles.buddyGoal}>{buddy.goal}</Text>
      <TouchableOpacity
        style={[
          styles.buddyButton,
          variant === 'primary'
            ? styles.buddyButtonPrimary
            : styles.buddyButtonSecondary,
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.buddyButtonText,
            variant === 'primary'
              ? styles.buddyButtonTextPrimary
              : styles.buddyButtonTextSecondary,
          ]}
        >
          {variant === 'primary' ? '打个招呼' : '发个鼓励'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  buddyCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  buddyCardOffset: {
    marginTop: Spacing.xl,
  },
  buddyAvatar: {
    marginBottom: Spacing.md,
  },
  buddyName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  buddyGoal: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buddyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
  },
  buddyButtonPrimary: {
    backgroundColor: Colors.primaryContainer,
  },
  buddyButtonSecondary: {
    backgroundColor: Colors.secondaryContainer,
  },
  buddyButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  buddyButtonTextPrimary: {
    color: Colors.onPrimaryContainer,
  },
  buddyButtonTextSecondary: {
    color: Colors.onSecondaryContainer,
  },
});
