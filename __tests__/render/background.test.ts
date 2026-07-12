import { renderBackground } from '../../src/render/background';
import { getDimensions } from '../../src/render/dimensions';

const lDim = getDimensions('l');

test('neon style renders a flat near-black background with no image, even with background=full', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', lDim, 'neon', 'full');
  expect(svg).toContain('fill="#08090d"');
  expect(svg).not.toContain('<image');
});

test('background=full renders a crisp full-bleed image with a scrim, no blur filter', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', lDim, 'static', 'full');
  expect(svg).toContain('<image');
  expect(svg).toContain('url(#bgScrim)');
  expect(svg).not.toContain('url(#bgBlur)');
});

test('background=full works with any non-neon art style, e.g. vinyl', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', lDim, 'vinyl', 'full');
  expect(svg).toContain('<image');
  expect(svg).toContain('url(#bgScrim)');
});

test('background=blurred renders the blurred-glass background', () => {
  const svg = renderBackground('data:image/jpeg;base64,AAAA', lDim, 'static', 'blurred');
  expect(svg).toContain('url(#bgBlur)');
  expect(svg).toContain('opacity="0.45"');
});
