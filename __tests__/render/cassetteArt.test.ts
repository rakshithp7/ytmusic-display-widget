import { renderCassetteArt } from '../../src/render/cassetteArt';
import { getDimensions } from '../../src/render/dimensions';

test('renders two spinning reels and an album-art filmstrip', () => {
  const svg = renderCassetteArt('data:image/jpeg;base64,AAAA', getDimensions('l'), 'normal');
  const reelCount = (svg.match(/<circle[^>]*fill="#c9a876"/g) || []).length;
  expect(reelCount).toBe(2);
  expect(svg).toContain('animateTransform');
  expect(svg).toContain('data:image/jpeg;base64,AAAA');
});

test('vinyl-speed changes the reel rotation duration', () => {
  const dims = getDimensions('l');
  const slow = renderCassetteArt('data:image/jpeg;base64,AAAA', dims, 'slow');
  const fast = renderCassetteArt('data:image/jpeg;base64,AAAA', dims, 'fast');
  expect(slow).toContain('dur="10s"');
  expect(fast).toContain('dur="2.5s"');
});
