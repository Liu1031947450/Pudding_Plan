import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface MilestoneEditorDrawerContentProps {
  milestoneDay: string;
  milestoneTitle: string;
  milestoneReward: string;
  onDayChange: (day: string) => void;
  onTitleChange: (title: string) => void;
  onRewardChange: (reward: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const MilestoneEditorDrawerContent: React.FC<
  MilestoneEditorDrawerContentProps
> = ({
  milestoneDay,
  milestoneTitle,
  milestoneReward,
  onDayChange,
  onTitleChange,
  onRewardChange,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.drawerContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>天数</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={milestoneDay}
            onChangeText={onDayChange}
            placeholder="输入天数"
            placeholderTextColor={Colors.onSurfaceVariant}
            keyboardType="number-pad"
          />
          <Text style={styles.inputSuffix}>天</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>里程碑名称</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={milestoneTitle}
            onChangeText={onTitleChange}
            placeholder="例如：小有所成"
            placeholderTextColor={Colors.onSurfaceVariant}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>奖励内容</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={milestoneReward}
            onChangeText={onRewardChange}
            placeholder="例如：奖励一顿丰盛早餐"
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
          />
        </View>
      </View>

      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
          <Text style={styles.modalCancelText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalConfirmButton} onPress={onSave}>
          <Text style={styles.modalConfirmText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    padding: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  inputSuffix: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    marginLeft: Spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
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
