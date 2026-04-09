import type { DayData, Habit } from '../types/domain';
import { mockCalendarData, mockHabits } from '../data/mockData';

// Calendar Service - handles calendar and habit operations
class CalendarService {
  private calendarData: DayData[] = [...mockCalendarData];
  private habits: Habit[] = [...mockHabits];

  // Get calendar data
  getCalendarData(): DayData[] {
    return this.calendarData;
  }

  // Get habits
  getHabits(): Habit[] {
    return this.habits;
  }

  // Toggle habit completion
  toggleHabit(habitId: string): boolean {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return false;

    habit.completed = !habit.completed;
    return true;
  }

  // Update day activity
  updateDayActivity(day: number, hasActivity: boolean, activityType?: 'primary' | 'secondary' | 'tertiary'): boolean {
    const dayData = this.calendarData.find(d => d.day === day);
    if (!dayData) return false;

    dayData.hasActivity = hasActivity;
    dayData.activityType = activityType;
    return true;
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
