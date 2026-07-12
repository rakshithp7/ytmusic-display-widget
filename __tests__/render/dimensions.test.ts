import { getDimensions } from '../../src/render/dimensions';

test('s', () => {
  expect(getDimensions('s')).toEqual({ width: 260, height: 68, artSize: 46 });
});

test('m', () => {
  expect(getDimensions('m')).toEqual({ width: 300, height: 80, artSize: 56 });
});

test('l', () => {
  expect(getDimensions('l')).toEqual({ width: 600, height: 120, artSize: 88 });
});

test('xl', () => {
  expect(getDimensions('xl')).toEqual({ width: 760, height: 150, artSize: 112 });
});
