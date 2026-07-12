import { getLabelRatio } from '../../src/render/labelRatio';

test('returns the correct ratio for each label size', () => {
  expect(getLabelRatio('small')).toBeCloseTo(0.62);
  expect(getLabelRatio('large')).toBeCloseTo(0.78);
});
