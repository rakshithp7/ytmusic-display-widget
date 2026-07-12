import { renderCard } from '../../src/render/card';

const baseData = {
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  thumbnailDataUri: 'data:image/jpeg;base64,AAAA',
  sourceUrl: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
};

const baseOptions = {
  size: 's' as const,
  artStyle: 'static' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  waveColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
  background: 'blurred' as const,
};

test.each(['s', 'm', 'l', 'xl'] as const)('static style renders at size %s without throwing', (size) => {
  const svg = renderCard(baseData, { ...baseOptions, size });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});

test.each(['vinyl', 'cassette', 'neon', 'vinyl-sleeve'] as const)(
  'art-style %s renders at the smallest size (s) without throwing',
  (artStyle) => {
    const svg = renderCard(baseData, { ...baseOptions, artStyle });
    expect(svg).toContain('<svg');
    expect(svg.length).toBeGreaterThan(0);
  }
);

test('vinyl style with background=full renders at size s without throwing', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', background: 'full' });
  expect(svg).toContain('<svg');
  expect(svg.length).toBeGreaterThan(0);
});
