import { renderCard } from '../../src/render/card';

const baseData = {
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  thumbnailDataUri: 'data:image/jpeg;base64,AAAA',
  sourceUrl: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
};

const baseOptions = {
  size: 'compact' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
};

test('static style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'static' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test('vinyl style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test('cassette style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'cassette' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test('neon style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'neon' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test('vinyl-cover style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl-cover' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test('vinyl-sleeve style renders at compact size without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl-sleeve' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});
