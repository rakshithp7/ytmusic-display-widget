import { renderArt } from '../../src/render/renderArt';
import { getDimensions } from '../../src/render/dimensions';

const dims = getDimensions('banner');
const baseOptions = {
  size: 'banner' as const,
  artStyle: 'static' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
  background: 'blurred' as const,
};

test('dispatches static to renderStaticArt', () => {
  const svg = renderArt('data:image/jpeg;base64,AAAA', dims, baseOptions);
  expect(svg).toContain('artClip');
});

test('dispatches vinyl to renderVinylArt', () => {
  const svg = renderArt('data:image/jpeg;base64,AAAA', dims, { ...baseOptions, artStyle: 'vinyl' });
  expect(svg).toContain('animateTransform');
});

test('dispatches cassette to renderCassetteArt', () => {
  const svg = renderArt('data:image/jpeg;base64,AAAA', dims, { ...baseOptions, artStyle: 'cassette' });
  expect(svg).toContain('cassetteFilm');
});

test('dispatches neon to renderNeonArt', () => {
  const svg = renderArt('data:image/jpeg;base64,AAAA', dims, { ...baseOptions, artStyle: 'neon' });
  expect(svg).toContain('neonGlow');
});

test('dispatches vinyl-sleeve to renderVinylSleeveArt', () => {
  const svg = renderArt('data:image/jpeg;base64,AAAA', dims, { ...baseOptions, artStyle: 'vinyl-sleeve' });
  expect(svg).toContain('sleeveClip');
});
