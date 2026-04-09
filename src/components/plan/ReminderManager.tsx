import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Card } from '../common/Card';
import type { Reminder } from '../../types/domain';

interface ReminderManagerProps {
  reminders: Reminder[];
  showTimePicker: boolean;
  selectedTime: Date;
  onAddReminder: () => void;
  onToggleReminder: (id: string) => void;
  onTimeChange: (event: any, date?: Date) => void;
  onConfirmTime: () => void;
  onCloseTimePicker: () => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  showTimePicker,
  selectedTime,
  onAddReminder,
  onToggleReminder,
  onTimeChange,
  onConfirmTime,
  onCloseTimePicker,
}) => {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="notifications" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>提醒设置</Text>
      </View>

      <View style={styles.remindersList}>
        {reminders.map(reminder => (
          <Card key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
                <Text style={styles.reminderLabel}>{reminder.label}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.reminderToggle,
                  reminder.enabled && styles.reminderToggleActive,
                ]}
                onPress={() => onToggleReminder(reminder.id)}
              >
                <View
                  style={[
                    styles.reminderToggleThumb,
                    reminder.enabled && styles.reminderToggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <TouchableOpacity style={styles.addReminderButton} onPress={onAddReminder}>
          <MaterialIcons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.addReminderText}>添加提醒</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={onCloseTimePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择提醒时间</Text>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={onCloseTimePicker}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={onConfirmTime}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  确定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  remindersList: {
    gap: Spacing.sm,
  },
  reminderCard: {
    padding: Spacing.md,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  reminderLabel: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  reminderToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 2,
    justifyContent: 'center',
  },
  reminderToggleActive: {
    backgroundColor: Colors.primary,
  },
  reminderToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  reminderToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  addReminderText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  modalButtonTextPrimary: {
    color: Colors.onPrimary,
  },
});
