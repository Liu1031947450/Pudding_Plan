const mockCalendarData = [
  { day: 26, hasActivity: false, isToday: false, isSelected: false },
  { day: 27, hasActivity: false, isToday: false, isSelected: false },
  { day: 28, hasActivity: false, isToday: false, isSelected: false },
  { day: 29, hasActivity: false, isToday: false, isSelected: false },
  { day: 1, hasActivity: false, isToday: false, isSelected: false },
  { day: 2, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 3,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 4,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 5, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 6,
    hasActivity: true,
    activityType: 'primary',
    isToday: false,
    isSelected: false,
  },
  { day: 7, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 8,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 9, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 10,
    hasActivity: true,
    activityType: 'tertiary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 11,
    hasActivity: true,
    activityType: 'primary',
    isToday: true,
    isSelected: true,
  },
  { day: 12, hasActivity: false, isToday: false, isSelected: false },
  { day: 13, hasActivity: false, isToday: false, isSelected: false },
  { day: 14, hasActivity: false, isToday: false, isSelected: false },
  { day: 15, hasActivity: false, isToday: false, isSelected: false },
  { day: 16, hasActivity: false, isToday: false, isSelected: false },
  { day: 17, hasActivity: false, isToday: false, isSelected: false },
];

const mockWeekRhythmData = [
  { date: '周一', value: 100 },
  { date: '周二', value: 85 },
  { date: '周三', value: 100 },
  { date: '周四', value: 70 },
  { date: '周五', value: 95 },
  { date: '周六', value: 60 },
  { date: '周日', value: 80 },
];

const mockMonthRhythmData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  value: Math.max(
    40,
    Math.min(100, 65 + Math.sin(i / 4) * 25 + (Math.random() - 0.5) * 15),
  ),
}));

module.exports = { mockCalendarData, mockWeekRhythmData, mockMonthRhythmData };
