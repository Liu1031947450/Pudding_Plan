import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Button } from '../../../components/common';

interface NotificationSheetProps {
  initialEnabled: boolean;
  initialTime: string; // 'HH:mm'
  onSave: (enabled: boolean, time: string) => void;
}

export const NotificationSheet: React.FC<NotificationSheetProps> = ({
  initialEnabled,
  initialTime,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hour, setHour] = useState(parseInt(initialTime.split(':')[0], 10));
  const [minute, setMinute] = useState(parseInt(initialTime.split(':')[1], 10));

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const renderPickerItem = (
    item: number,
    selected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.pickerItem, selected && styles.pickerItemSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.pickerItemText,
          selected && styles.pickerItemTextSelected,
        ]}
      >
        {item.toString().padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {Platform.OS === 'web' && (
          <View style={styles.webNotice}>
            <MaterialIcons
              name="info-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.webNoticeText}>
              Web 演示版不支持系统通知，请在移动端配置提醒。
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>开启每日提醒</Text>
            <Text style={styles.rowSubtitle}>
              在指定时间提醒你开启今日治愈时刻
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            disabled={Platform.OS === 'web'}
            trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {enabled && (
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>提醒时间</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>时</Text>
                <FlatList
                  data={hours}
                  keyExtractor={item => `h-${item}`}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) =>
                    renderPickerItem(item, hour === item, () => setHour(item))
                  }
                  style={styles.pickerList}
                />
              </View>
              <View style={styles.pickerDivider}>
                <Text style={styles.dividerText}>:</Text>
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>分</Text>
                <FlatList
                  data={minutes}
                  keyExtractor={item => `m-${item}`}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) =>
                    renderPickerItem(item, minute === item, () =>
                      setMinute(item),
                    )
                  }
                  style={styles.pickerList}
                />
              </View>
            </View>
            <View style={styles.previewContainer}>
              <MaterialIcons
                name="access-time"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.previewText}>
                将于每天{' '}
                <Text style={styles.previewTime}>
                  {hour.toString().padStart(2, '0')}:
                  {minute.toString().padStart(2, '0')}
                </Text>{' '}
                提醒我
              </Text>
            </View>
          </View>
        )}

        <Button
          title={Platform.OS === 'web' ? 'Web 端不可用' : '保存设置'}
          onPress={() =>
            onSave(
              enabled,
              `${hour.toString().padStart(2, '0')}:${minute
                .toString()
                .padStart(2, '0')}`,
            )
          }
          style={styles.saveButton}
          disabled={Platform.OS === 'web'}
        />
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
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryContainer,
    marginBottom: Spacing.md,
  },
  webNoticeText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.onPrimaryContainer,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.xl,
  },
  rowInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    opacity: 0.7,
  },
  pickerSection: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}10`,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  columnLabel: {
    fontSize: FontSize.xs,
    color: Colors.outline,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pickerList: {
    width: '100%',
  },
  pickerItem: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primaryContainer,
  },
  pickerItemText: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.xl,
  },
  pickerDivider: {
    paddingHorizontal: Spacing.md,
  },
  dividerText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.outlineVariant,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  previewText: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginLeft: Spacing.xs,
  },
  previewTime: {
    color: Colors.primary,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
