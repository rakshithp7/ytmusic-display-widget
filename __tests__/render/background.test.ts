import { renderBackground } from '../../src/render/background';
import { getDimensions } from '../../src/render/dimensions';

const bannerDim = getDimensions('banner');

test('neon style renders a flat near-black background with no image', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', bannerDim, 'neon');
  expect(svg).toContain('fill="#08090d"');
  expect(svg).not.toContain('<image');
});

test('vinyl-cover style renders a crisp full-bleed image with a scrim, no blur filter', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', bannerDim, 'vinyl-cover');
  expect(svg).toContain('<image');
  expect(svg).toContain('url(#bgScrim)');
  expect(svg).not.toContain('url(#bgBlur)');
});

test('default styles render the blurred-glass background', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', bannerDim, 'static');
  expect(svg).toContain('url(#bgBlur)');
  expect(svg).toContain('opacity="0.45"');
});
