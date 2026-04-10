import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { Button } from '../common';

interface ConfirmSheetProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isDestructive
                ? `${Colors.error}10`
                : `${Colors.primary}10`,
            },
          ]}
        >
          <MaterialIcons
            name={isDestructive ? 'warning' : 'help-outline'}
            size={40}
            color={isDestructive ? Colors.error : Colors.primary}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            style={[styles.button, isDestructive && styles.destructiveButton]}
            variant={isDestructive ? 'primary' : 'primary'}
          />
          <Button
            title="取消"
            onPress={onCancel}
            style={styles.button}
            variant="outline"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
});
