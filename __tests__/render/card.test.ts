import { renderCard } from '../../src/render/card';

const baseData = {
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  thumbnailDataUri: 'data:image/jpeg;base64,AAAA',
  sourceUrl: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
};

const baseOptions = {
  size: 'banner' as const,
  artStyle: 'static' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
};

test('renders banner dimensions', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).toContain('width="600" height="120"');
});

test('renders compact dimensions', () => {
  const svg = renderCard(baseData, { ...baseOptions, size: 'compact' });
  expect(svg).toContain('width="300" height="80"');
});

test('escapes title and artist text', () => {
  const svg = renderCard({ ...baseData, title: 'A & B <script>' }, baseOptions);
  expect(svg).toContain('A &amp; B &lt;script&gt;');
  expect(svg).not.toContain('<script>');
});

test('static circle style renders a circular clip path', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).toContain('artClip');
  expect(svg).toContain('<circle');
});

test('static square style does not render a circular art clip', () => {
  const svg = renderCard(baseData, { ...baseOptions, artShape: 'square' });
  expect(svg).not.toContain('artClip');
});

test('accent color is applied to the equalizer bars', () => {
  const svg = renderCard(baseData, { ...baseOptions, accentColor: '#ff00ff' });
  expect(svg).toContain('#ff00ff');
});

test('includes the "NOW PLAYING" label', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).toContain('NOW PLAYING');
});

test('includes a YT Music badge', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).toContain('YT Music');
});

test('short title/artist render statically without a scrolling animation', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).not.toContain('animateTransform');
});

test('a long title scrolls via animateTransform when it overflows the available width', () => {
  const longTitle = 'A very long song title that will not fit on one line at all';
  const svg = renderCard({ ...baseData, title: longTitle }, baseOptions);
  expect(svg).toContain('titleClip');
  expect(svg).toContain('animateTransform');
});

test('compact badge is sized down, not just repositioned', () => {
  const banner = renderCard(baseData, baseOptions);
  const compact = renderCard(baseData, { ...baseOptions, size: 'compact' });
  expect(banner).toContain('font-size="11" font-weight="600">YT Music');
  expect(compact).toContain('font-size="8" font-weight="600">YT Music');
});
