import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

export interface SettingItemProps {
  id: string;
  title: string;
  value?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  showArrow?: boolean;
  onPress: () => void;
  isLast?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  id,
  title,
  value,
  icon,
  iconColor,
  showArrow,
  onPress,
  isLast,
}) => {
  return (
    <TouchableOpacity
      style={[styles.settingItem, !isLast && styles.settingItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[styles.settingIcon, { backgroundColor: `${iconColor}10` }]}
        >
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <Text
          style={[styles.settingTitle, id === '9' && styles.settingTitleDanger]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={Colors.outlineVariant}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  settingTitleDanger: {
    color: Colors.error,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.xs,
  },
});
