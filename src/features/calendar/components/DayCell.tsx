import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Colors, FontSize } from '../../../constants/theme';
import type { DayData } from '../../../types/domain';

interface DayCellProps {
  dayData: DayData;
  isSelected: boolean;
  onPress: (day: number) => void;
  activityColor: string;
}

export const DayCell: React.FC<DayCellProps> = ({
  dayData,
  isSelected,
  onPress,
  activityColor,
}) => {
  return (
    <View style={styles.dayCellContainer}>
      <TouchableOpacity
        style={[
          styles.dayCell,
          isSelected && styles.selectedDay,
          dayData.isToday && !isSelected && styles.todayCell,
        ]}
        onPress={() => onPress(dayData.day)}
      >
        <Text
          style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            dayData.isToday && !isSelected && styles.todayText,
          ]}
        >
          {dayData.day}
        </Text>
        {dayData.hasActivity && (
          <View
            style={[styles.activityDot, { backgroundColor: activityColor }]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dayCellContainer: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    position: 'relative',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: Colors.primaryContainer,
  },
  todayCell: {
    backgroundColor: `${Colors.primaryContainer}40`,
  },
  dayText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  selectedDayText: {
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  todayText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
