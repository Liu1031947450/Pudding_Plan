const toDateString = date => {
  const value = date instanceof Date ? date : new Date(`${date}T00:00:00`);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateString, amount) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateString(date);
};

const daysBetween = (from, to) => {
  const fromDate = new Date(`${from}T12:00:00`);
  const toDate = new Date(`${to}T12:00:00`);
  return Math.round((toDate - fromDate) / 86400000);
};

const getCheckInDateError = (dateString, today = new Date()) => {
  if (!isValidDateString(dateString)) return '打卡日期格式无效';
  const difference = daysBetween(dateString, toDateString(today));
  if (difference < 0) return '不能为未来日期打卡';
  if (difference > 6) return '仅支持今天及过去6个自然日内补签或修改';
  return null;
};

const isHabitScheduledForDate = (habit, dateString) => {
  if (!habit.isActive || dateString < String(habit.startDate)) return false;
  const weekday = new Date(`${dateString}T12:00:00`).getDay();
  return Array.isArray(habit.weekdays) && habit.weekdays.includes(weekday);
};

const calculateCurrentStreak = (dates, today = new Date()) => {
  const uniqueDates = new Set(dates.map(String));
  if (uniqueDates.size === 0) return 0;

  const todayString = toDateString(today);
  const yesterdayString = addDays(todayString, -1);
  let cursor = uniqueDates.has(todayString) ? todayString : yesterdayString;
  let streak = 0;

  while (uniqueDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

const calculateHabitStreak = (habit, dates, today = new Date()) => {
  if (
    !habit?.isActive ||
    !Array.isArray(habit.weekdays) ||
    !habit.weekdays.length
  ) {
    return 0;
  }
  const completed = new Set(dates.map(String));
  const startDate = String(habit.startDate);
  let cursor = toDateString(today);

  const previousScheduledDate = value => {
    let candidate = value;
    while (candidate >= startDate) {
      const weekday = new Date(`${candidate}T12:00:00`).getDay();
      if (habit.weekdays.includes(weekday)) return candidate;
      candidate = addDays(candidate, -1);
    }
    return null;
  };

  cursor = previousScheduledDate(cursor);
  if (!cursor) return 0;
  if (cursor === toDateString(today) && !completed.has(cursor)) {
    cursor = previousScheduledDate(addDays(cursor, -1));
  }

  let streak = 0;
  while (cursor && completed.has(cursor)) {
    streak += 1;
    cursor = previousScheduledDate(addDays(cursor, -1));
  }
  return streak;
};

const isValidDateString = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toDateString(value) === value;
};

const validateCheckInDetails = (planType, { numericValue, note }) => {
  if (planType === 0) {
    return numericValue === undefined && note === undefined
      ? null
      : '盖章打卡不接受数值或文字记录';
  }
  if (planType === 1) {
    if (note !== undefined) return '数值计划不接受文字记录';
    return numericValue === undefined ? '请输入本次数值' : null;
  }
  if (planType === 2) {
    if (numericValue !== undefined) return '日记计划不接受数值记录';
    return typeof note === 'string' && note.trim()
      ? null
      : '请填写本次打卡内容';
  }
  return '计划打卡类型无效';
};

module.exports = {
  calculateCurrentStreak,
  calculateHabitStreak,
  getCheckInDateError,
  isHabitScheduledForDate,
  isValidDateString,
  toDateString,
  validateCheckInDetails,
};
