import { renderCdArt } from '../../src/render/cdArt';
import { getDimensions } from '../../src/render/dimensions';

test('renders the art filling the whole disc with a sheen overlay and rotation', () => {
  const svg = renderCdArt('data:image/jpeg;base64,AAAA', getDimensions('banner'), 'normal');
  expect(svg).toContain('cdSheen');
  expect(svg).toContain('animateTransform');
  expect(svg).toContain('data:image/jpeg;base64,AAAA');
});

test('vinyl-speed changes the rotation duration', () => {
  const dims = getDimensions('banner');
  const slow = renderCdArt('data:image/jpeg;base64,AAAA', dims, 'slow');
  const fast = renderCdArt('data:image/jpeg;base64,AAAA', dims, 'fast');
  expect(slow).toContain('dur="10s"');
  expect(fast).toContain('dur="2.5s"');
});
