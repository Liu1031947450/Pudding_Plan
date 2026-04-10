import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { Button } from '../common';

interface DNDSheetProps {
  initialStartTime: string;
  initialEndTime: string;
  onSave: (startTime: string, endTime: string) => void;
}

export const DNDSheet: React.FC<DNDSheetProps> = ({
  initialStartTime,
  initialEndTime,
  onSave,
}) => {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(
    null,
  );

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const renderTimePreview = (
    label: string,
    time: string,
    isActive: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.timeBox, isActive && styles.timeBoxActive]}
      onPress={onPress}
    >
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={[styles.timeValue, isActive && styles.timeValueActive]}>
        {time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoBox}>
          <MaterialIcons name="nights-stay" size={24} color={Colors.tertiary} />
          <Text style={styles.infoText}>
            在静谧时间段内，应用将不会向你发送任何推送通知，享受属于你的安静时刻。
          </Text>
        </View>

        <View style={styles.timeSelectionRow}>
          {renderTimePreview(
            '开始时间',
            startTime,
            activePicker === 'start',
            () => setActivePicker('start'),
          )}
          <MaterialIcons
            name="arrow-forward"
            size={24}
            color={Colors.outlineVariant}
          />
          {renderTimePreview('结束时间', endTime, activePicker === 'end', () =>
            setActivePicker('end'),
          )}
        </View>

        {activePicker && (
          <View style={styles.quickPickerContainer}>
            <Text style={styles.quickPickerTitle}>
              选择{activePicker === 'start' ? '开始' : '结束'}小时
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPickerContent}
            >
              {hours.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.quickHourItem,
                    (activePicker === 'start' ? startTime : endTime).startsWith(
                      h,
                    ) && styles.quickHourItemSelected,
                  ]}
                  onPress={() => {
                    const newTime = `${h}:00`;
                    if (activePicker === 'start') setStartTime(newTime);
                    else setEndTime(newTime);
                  }}
                >
                  <Text
                    style={[
                      styles.quickHourText,
                      (activePicker === 'start'
                        ? startTime
                        : endTime
                      ).startsWith(h) && styles.quickHourTextSelected,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title="确认更新"
            onPress={() => onSave(startTime, endTime)}
            style={styles.saveButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.tertiary}10`,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  timeSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  timeBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: Spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeBoxActive: {
    borderColor: Colors.tertiary,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  timeLabel: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  timeValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  timeValueActive: {
    color: Colors.tertiary,
  },
  quickPickerContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    borderRadius: 24,
    marginBottom: Spacing.xl,
  },
  quickPickerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  quickPickerContent: {
    gap: Spacing.sm,
  },
  quickHourItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickHourItemSelected: {
    backgroundColor: Colors.tertiary,
  },
  quickHourText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  quickHourTextSelected: {
    color: Colors.white,
  },
  footer: {
    marginTop: 'auto',
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
