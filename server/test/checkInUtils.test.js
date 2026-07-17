const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCurrentStreak,
  isValidDateString,
  validateCheckInDetails,
} = require('../src/utils/checkInUtils');

test('calculateCurrentStreak counts only consecutive dates', () => {
  const today = new Date('2026-07-16T12:00:00');
  assert.equal(
    calculateCurrentStreak(
      ['2026-07-10', '2026-07-14', '2026-07-15', '2026-07-16'],
      today,
    ),
    3,
  );
});

test('calculateCurrentStreak accepts a streak ending yesterday', () => {
  const today = new Date('2026-07-16T12:00:00');
  assert.equal(
    calculateCurrentStreak(['2026-07-13', '2026-07-14', '2026-07-15'], today),
    3,
  );
});

test('date validation rejects impossible calendar dates', () => {
  assert.equal(isValidDateString('2026-02-29'), false);
  assert.equal(isValidDateString('2026-07-16'), true);
});

test('check-in details must match the plan type', () => {
  assert.equal(validateCheckInDetails(0, {}), null);
  assert.match(validateCheckInDetails(0, { numericValue: 1 }), /盖章打卡/);
  assert.equal(validateCheckInDetails(1, { numericValue: 12.5 }), null);
  assert.match(validateCheckInDetails(1, {}), /请输入本次数值/);
  assert.equal(validateCheckInDetails(2, { note: '今天完成了' }), null);
  assert.match(validateCheckInDetails(2, { note: '  ' }), /请填写/);
  assert.match(
    validateCheckInDetails(2, { numericValue: 1, note: '错误组合' }),
    /不接受数值/,
  );
});
