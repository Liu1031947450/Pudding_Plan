import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius } from '../../constants/theme';

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
}) => {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
