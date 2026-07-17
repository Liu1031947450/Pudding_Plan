import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedHour: number;
  selectedMinute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onConfirm: () => void;
  title?: string;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onConfirm,
  title = '选择提醒时间',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.timePickerModal}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.customPickerContainer}>
            <View style={styles.pickerRow}>
              <ScrollView
                style={styles.pickerColumn}
                showsVerticalScrollIndicator={false}
              >
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemSelected,
                    ]}
                    onPress={() => onHourChange(hour)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === hour && styles.pickerItemTextSelected,
                      ]}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.pickerSeparator}>:</Text>

              <ScrollView
                style={styles.pickerColumn}
                showsVerticalScrollIndicator={false}
              >
                {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemSelected,
                    ]}
                    onPress={() => onMinuteChange(minute)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === minute &&
                          styles.pickerItemTextSelected,
                      ]}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={onConfirm}
            >
              <Text style={styles.modalConfirmText}>确定</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  customPickerContainer: {
    height: 200,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primaryContainer,
  },
  pickerItemText: {
    fontSize: FontSize.xl,
    color: Colors.onSurfaceVariant,
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  pickerSeparator: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    marginHorizontal: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  modalCancelText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  modalConfirmButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  modalConfirmText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
});
