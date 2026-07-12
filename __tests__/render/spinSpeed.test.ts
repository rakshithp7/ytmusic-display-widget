import { getSpinSeconds } from '../../src/render/spinSpeed';

test('returns the correct duration for each speed', () => {
  expect(getSpinSeconds('slow')).toBe(10);
  expect(getSpinSeconds('normal')).toBe(6);
  expect(getSpinSeconds('fast')).toBe(2.5);
});
