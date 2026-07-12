import { renderNeonArt } from '../../src/render/neonArt';
import { getDimensions } from '../../src/render/dimensions';

test('renders a glowing border colored by accentColor around the art', () => {
  const svg = renderNeonArt('data:image/jpeg;base64,AAAA', getDimensions('banner'), '#ff2ea6');
  expect(svg).toContain('#ff2ea6');
  expect(svg).toContain('neonGlow');
  expect(svg).toContain('data:image/jpeg;base64,AAAA');
});

test('changes the glow color when accentColor changes', () => {
  const dims = getDimensions('banner');
  const svg = renderNeonArt('data:image/jpeg;base64,AAAA', dims, '#00ff00');
  expect(svg).toContain('#00ff00');
  expect(svg).not.toContain('#ff2ea6');
});
