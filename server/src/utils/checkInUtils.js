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
  isValidDateString,
  toDateString,
  validateCheckInDetails,
};
