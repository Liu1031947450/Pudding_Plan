import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { SettingItem, type SettingItemProps } from './SettingItem';

interface SettingSectionProps {
  title: string;
  items: Omit<SettingItemProps, 'onPress' | 'isLast'>[];
  onItemPress: (id: string) => void;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  items,
  onItemPress,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard}>
        {items.map((item, index) => (
          <SettingItem
            key={item.id}
            {...item}
            onPress={() => onItemPress(item.id)}
            isLast={index === items.length - 1}
          />
        ))}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
});
