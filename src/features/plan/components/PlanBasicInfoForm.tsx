import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface PlanBasicInfoFormProps {
  planName: string;
  planDays: string;
  onNameChange: (name: string) => void;
  onDaysChange: (days: string) => void;
}

export const PlanBasicInfoForm: React.FC<PlanBasicInfoFormProps> = ({
  planName,
  planDays,
  onNameChange,
  onDaysChange,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="info" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>基础信息</Text>
      </View>

      <View style={styles.inputGrid}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>计划名称</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={planName}
              onChangeText={onNameChange}
              placeholderTextColor={Colors.outline}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>打卡周期</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={planDays}
              onChangeText={onDaysChange}
              keyboardType="number-pad"
              placeholderTextColor={Colors.outline}
            />
            <Text style={styles.inputSuffix}>天</Text>
          </View>
        </View>
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
  inputGrid: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
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
});
