import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

type CheckInMethod = 'stamp' | 'number' | 'diary';

interface CheckInMethodSelectorProps {
  selectedMethod: CheckInMethod;
  onMethodChange: (method: CheckInMethod) => void;
}

export const CheckInMethodSelector: React.FC<CheckInMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>打卡方式</Text>
      </View>

      <View style={styles.methodGrid}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'stamp' && styles.methodButtonActive,
          ]}
          onPress={() => onMethodChange('stamp')}
        >
          <MaterialIcons
            name="verified"
            size={24}
            color={
              selectedMethod === 'stamp'
                ? Colors.onPrimary
                : Colors.onSurfaceVariant
            }
          />
          <Text
            style={[
              styles.methodText,
              selectedMethod === 'stamp' && styles.methodTextActive,
            ]}
          >
            盖章打卡
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'number' && styles.methodButtonActive,
          ]}
          onPress={() => onMethodChange('number')}
        >
          <MaterialIcons
            name="show-chart"
            size={24}
            color={
              selectedMethod === 'number'
                ? Colors.onPrimary
                : Colors.onSurfaceVariant
            }
          />
          <Text
            style={[
              styles.methodText,
              selectedMethod === 'number' && styles.methodTextActive,
            ]}
          >
            数值记录
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'diary' && styles.methodButtonActive,
          ]}
          onPress={() => onMethodChange('diary')}
        >
          <MaterialIcons
            name="edit-note"
            size={24}
            color={
              selectedMethod === 'diary'
                ? Colors.onPrimary
                : Colors.onSurfaceVariant
            }
          />
          <Text
            style={[
              styles.methodText,
              selectedMethod === 'diary' && styles.methodTextActive,
            ]}
          >
            文字日记
          </Text>
        </TouchableOpacity>
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
  methodGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    gap: Spacing.xs,
  },
  methodButtonActive: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  methodTextActive: {
    color: Colors.onPrimary,
  },
});
