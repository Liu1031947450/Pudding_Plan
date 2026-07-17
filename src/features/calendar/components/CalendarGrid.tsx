import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { DayCell } from './DayCell';
import type { DayData } from '../../../types/domain';

interface CalendarGridProps {
  year: number;
  month: number;
  calendarDays: DayData[];
  selectedDay: number;
  onDayPress: (day: number) => void;
  getActivityColor: (type?: string) => string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  calendarDays,
  selectedDay,
  onDayPress,
  getActivityColor,
}) => {
  const getEmptyDaysBefore = () => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    // getDay() returns 0 for Sunday, 1-6 for Mon-Sat
    // We want Monday (1) to be start, so firstDay === 0 -> 6, else firstDay - 1
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getDaysInMonth = () => {
    return new Date(year, month, 0).getDate();
  };

  return (
    <Card style={styles.calendarCard}>
      <View style={styles.weekDays}>
        {['一', '二', '三', '四', '五', '六', '日'].map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {Array.from({ length: getEmptyDaysBefore() }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCellPlaceholder} />
        ))}

        {Array.from({ length: getDaysInMonth() }).map((_, index) => {
          const dayStr = index + 1;
          const dayObj = calendarDays.find(d => d.day === dayStr) || {
            day: dayStr,
            hasActivity: false,
            isToday: false,
            isSelected: false,
          };

          return (
            <DayCell
              key={`day-${dayStr}`}
              dayData={dayObj}
              isSelected={selectedDay === dayStr}
              onPress={onDayPress}
              activityColor={getActivityColor(dayObj.activityType)}
            />
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    padding: Spacing.md,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: `${Colors.onSurfaceVariant}80`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellPlaceholder: {
    width: '14.28%',
    height: 48,
  },
});
