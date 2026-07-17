import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) => {
  return (
    <View style={styles.monthHeader}>
      <View>
        <Text style={styles.monthLabel}>{year}年</Text>
        <Text style={styles.monthTitle}>{month}月</Text>
      </View>
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navButton} onPress={onGoToToday}>
          <MaterialIcons name="today" style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onPrevMonth}>
          <MaterialIcons name="chevron-left" style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onNextMonth}>
          <MaterialIcons name="chevron-right" style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  monthLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  monthTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  monthNav: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },
});
