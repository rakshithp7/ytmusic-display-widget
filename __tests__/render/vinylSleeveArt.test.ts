import { renderVinylSleeveArt } from '../../src/render/vinylSleeveArt';
import { getDimensions } from '../../src/render/dimensions';

test('renders a square sleeve behind a smaller spinning record', () => {
  const svg = renderVinylSleeveArt('data:image/jpeg;base64,AAAA', getDimensions('l'), 'normal', 'small');
  expect(svg).toContain('sleeveClip');
  expect(svg).toContain('sleeveDiscClip');
  expect(svg).toContain('sleeveLabelClip');
  expect(svg).toContain('animateTransform');
});

test('vinyl-speed changes the label rotation duration', () => {
  const dims = getDimensions('l');
  const slow = renderVinylSleeveArt('data:image/jpeg;base64,AAAA', dims, 'slow', 'small');
  const fast = renderVinylSleeveArt('data:image/jpeg;base64,AAAA', dims, 'fast', 'small');
  expect(slow).toContain('dur="10s"');
  expect(fast).toContain('dur="2.5s"');
});

test('label-size changes the label radius', () => {
  const dims = getDimensions('l');
  const small = renderVinylSleeveArt('data:image/jpeg;base64,AAAA', dims, 'normal', 'small');
  const large = renderVinylSleeveArt('data:image/jpeg;base64,AAAA', dims, 'normal', 'large');
  const smallRadius = small.match(/sleeveLabelClip"><circle cx="[\d.]+" cy="[\d.]+" r="([\d.]+)"/)?.[1];
  const largeRadius = large.match(/sleeveLabelClip"><circle cx="[\d.]+" cy="[\d.]+" r="([\d.]+)"/)?.[1];
  expect(Number(largeRadius)).toBeGreaterThan(Number(smallRadius));
});
