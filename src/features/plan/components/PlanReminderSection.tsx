import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { formatTime } from '../../../utils';
import type { Reminder } from '../../../types/domain';

interface PlanReminderSectionProps {
  reminders: Reminder[];
  onAddReminder: () => void;
  onEditReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
}

export const PlanReminderSection: React.FC<PlanReminderSectionProps> = ({
  reminders,
  onAddReminder,
  onEditReminder,
  onToggleReminder,
}) => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getSortedReminders = () => {
    const enabled = reminders
      .filter(r => r.enabled)
      .sort((a, b) => {
        const timeA = parseTime(formatTime(a.time));
        const timeB = parseTime(formatTime(b.time));
        return timeA - timeB;
      });

    const disabled = reminders
      .filter(r => !r.enabled)
      .sort((a, b) => {
        const timeA = parseTime(formatTime(a.time));
        const timeB = parseTime(formatTime(b.time));
        return timeA - timeB;
      });

    return [...enabled, ...disabled];
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="notifications" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>提醒设置</Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            reminders.length >= 5 && styles.addButtonDisabled,
          ]}
          onPress={onAddReminder}
          disabled={reminders.length >= 5}
        >
          <MaterialIcons
            name="add"
            size={16}
            color={
              reminders.length >= 5 ? Colors.outlineVariant : Colors.tertiary
            }
          />
          <Text
            style={[
              styles.addButtonText,
              reminders.length >= 5 && styles.addButtonTextDisabled,
            ]}
          >
            添加 ({reminders.length}/5)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.remindersList}>
        {getSortedReminders().map(reminder => (
          <Card key={reminder.id} style={styles.reminderCard}>
            <TouchableOpacity
              style={styles.reminderLeft}
              onPress={() => onEditReminder(reminder)}
            >
              <MaterialIcons
                name="alarm"
                size={20}
                color={
                  reminder.enabled ? Colors.primary : Colors.onSurfaceVariant
                }
              />
              <Text style={styles.reminderTime}>
                {formatTime(reminder.time)}
              </Text>
              <View
                style={[
                  styles.reminderBadge,
                  !reminder.enabled && styles.reminderBadgeGray,
                ]}
              >
                <Text
                  style={[
                    styles.reminderBadgeText,
                    !reminder.enabled && styles.reminderBadgeTextGray,
                  ]}
                >
                  {reminder.label}
                </Text>
              </View>
            </TouchableOpacity>
            <Switch
              value={reminder.enabled}
              onValueChange={() => onToggleReminder(reminder.id)}
              trackColor={{
                false: Colors.surfaceContainerHigh,
                true: Colors.primaryContainer,
              }}
              thumbColor={reminder.enabled ? Colors.primary : Colors.outline}
            />
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.tertiaryContainer}20`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
    gap: 4,
    marginLeft: 'auto',
  },
  addButtonDisabled: {
    backgroundColor: `${Colors.outlineVariant}10`,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  addButtonTextDisabled: {
    color: Colors.outlineVariant,
  },
  remindersList: {
    gap: Spacing.sm,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reminderTime: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  reminderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${Colors.primary}15`,
  },
  reminderBadgeGray: {
    backgroundColor: `${Colors.outline}15`,
  },
  reminderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  reminderBadgeTextGray: {
    color: Colors.onSurfaceVariant,
  },
});
