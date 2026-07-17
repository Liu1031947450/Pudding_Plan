jest.mock('expo-notifications', () => ({}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import { isTimeInDndRange } from '../src/services/notificationScheduler';
import { scaleTextStyle } from '../src/components/common/AppText';

describe('notification quiet hours', () => {
  it('handles an overnight quiet range', () => {
    expect(isTimeInDndRange('23:30', '22:00', '07:00')).toBe(true);
    expect(isTimeInDndRange('06:59', '22:00', '07:00')).toBe(true);
    expect(isTimeInDndRange('07:00', '22:00', '07:00')).toBe(false);
  });

  it('handles a same-day quiet range', () => {
    expect(isTimeInDndRange('12:00', '09:00', '17:00')).toBe(true);
    expect(isTimeInDndRange('18:00', '09:00', '17:00')).toBe(false);
  });
});

test('global text scaling preserves the existing typography ratio', () => {
  const scaled = scaleTextStyle({ fontSize: 16, lineHeight: 24 }, 1.15);
  expect(scaled?.fontSize).toBeCloseTo(18.4);
  expect(scaled?.lineHeight).toBeCloseTo(27.6);
});
