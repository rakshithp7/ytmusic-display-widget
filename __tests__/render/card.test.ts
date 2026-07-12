import { renderCard } from '../../src/render/card';

const baseData = {
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  thumbnailDataUri: 'data:image/jpeg;base64,AAAA',
  sourceUrl: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
};

const baseOptions = {
  size: 'l' as const,
  artStyle: 'static' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  waveColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
  background: 'blurred' as const,
};

test('renders l dimensions', () => {
  const svg = renderCard(baseData, baseOptions);
  expect(svg).toContain('width="600" height="120"');
});

test('renders xl dimensions', () => {
  const svg = renderCard(baseData, { ...baseOptions, size: 'xl' });
  expect(svg).toContain('width="760" height="150"');
});

test('renders m dimensions', () => {
  const svg = renderCard(baseData, { ...baseOptions, size: 'm' });
  expect(svg).toContain('width="300" height="80"');
});

test('renders s dimensions', () => {
  const svg = renderCard(baseData, { ...baseOptions, size: 's' });
  expect(svg).toContain('width="260" height="68"');
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

test('wave color is applied to the waveform bars', () => {
  const svg = renderCard(baseData, { ...baseOptions, waveColor: '#ff00ff' });
  expect(svg).toContain('#ff00ff');
});

test('wave color is applied to the equalizer bars at m', () => {
  const svg = renderCard(baseData, { ...baseOptions, size: 'm', waveColor: '#22d3ee' });
  expect(svg).toContain('#22d3ee');
});

test('accent color alone does not color the waveform when wave color differs', () => {
  const svg = renderCard(baseData, { ...baseOptions, accentColor: '#ff00ff', waveColor: '#7dd3fc' });
  expect(svg).not.toContain('#ff00ff');
  expect(svg).toContain('#7dd3fc');
});

test('s and m include the "NOW PLAYING" label', () => {
  const s = renderCard(baseData, { ...baseOptions, size: 's' });
  const m = renderCard(baseData, { ...baseOptions, size: 'm' });
  expect(s).toContain('NOW PLAYING');
  expect(m).toContain('NOW PLAYING');
});

test('l and xl have no "NOW PLAYING" label and render a waveform instead', () => {
  const l = renderCard(baseData, baseOptions);
  const xl = renderCard(baseData, { ...baseOptions, size: 'xl' });
  expect(l).not.toContain('NOW PLAYING');
  expect(xl).not.toContain('NOW PLAYING');
  expect(l).toContain('<animate attributeName="height"');
  expect(xl).toContain('<animate attributeName="height"');
});

test('l and xl show the full "YT Music" badge text', () => {
  const l = renderCard(baseData, baseOptions);
  const xl = renderCard(baseData, { ...baseOptions, size: 'xl' });
  expect(l).toContain('YT Music');
  expect(xl).toContain('YT Music');
});

test('s and m show an icon-only badge, no "YT Music" text', () => {
  const s = renderCard(baseData, { ...baseOptions, size: 's' });
  const m = renderCard(baseData, { ...baseOptions, size: 'm' });
  expect(s).not.toContain('YT Music');
  expect(m).not.toContain('YT Music');
});

test('badge sits in the top-right corner, sized per tier', () => {
  const s = renderCard(baseData, { ...baseOptions, size: 's' });
  const m = renderCard(baseData, { ...baseOptions, size: 'm' });
  const l = renderCard(baseData, baseOptions);
  const xl = renderCard(baseData, { ...baseOptions, size: 'xl' });

  // s: width 260, icon 24*0.45=10.8, margin 12 -> x = 260 - 10.8 - 12 = 237.2
  expect(s).toContain('<g transform="translate(237.2, 12)" fill="rgba(255,255,255,0.35)">');
  // m: width 300, icon 24*0.55=13.2, margin 12 -> x = 300 - 13.2 - 12 = 274.8
  expect(m).toContain('<g transform="translate(274.8, 12)" fill="rgba(255,255,255,0.35)">');
  // l: width 600, badge width 78, margin 12 -> x = 600 - 78 - 12 = 510
  expect(l).toContain('<g transform="translate(510, 12)" fill="rgba(255,255,255,0.55)">');
  // xl: width 760, badge width 92, margin 12 -> x = 760 - 92 - 12 = 656
  expect(xl).toContain('<g transform="translate(656, 12)" fill="rgba(255,255,255,0.55)">');
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

test('xl uses a larger title/artist font than l', () => {
  const l = renderCard(baseData, baseOptions);
  const xl = renderCard(baseData, { ...baseOptions, size: 'xl' });
  expect(l).toContain('font-size="19"');
  expect(l).toContain('font-size="14"');
  expect(xl).toContain('font-size="23"');
  expect(xl).toContain('font-size="17"');
});

test('vinyl style renders groove circles and a rotating label', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl' });
  expect(svg).toContain('labelClip');
  expect(svg).toContain('animateTransform');
});

test('vinyl-speed changes the rotation duration', () => {
  const slow = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', vinylSpeed: 'slow' });
  const fast = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', vinylSpeed: 'fast' });
  expect(slow).toContain('dur="10s"');
  expect(fast).toContain('dur="2.5s"');
});

test('label-size changes the label radius', () => {
  const small = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', labelSize: 'small' });
  const large = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', labelSize: 'large' });
  const smallRadius = small.match(/labelClip"><circle cx="44" cy="44" r="([\d.]+)"/)?.[1];
  const largeRadius = large.match(/labelClip"><circle cx="44" cy="44" r="([\d.]+)"/)?.[1];
  expect(Number(largeRadius)).toBeGreaterThan(Number(smallRadius));
});

test('background=full has no blur filter reference, works with vinyl style', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'vinyl', background: 'full' });
  expect(svg).not.toContain('url(#bgBlur)');
  expect(svg).toContain('url(#bgScrim)');
});

test('neon ignores background=full and keeps its flat backdrop', () => {
  const svg = renderCard(baseData, { ...baseOptions, artStyle: 'neon', background: 'full' });
  expect(svg).toContain('fill="#08090d"');
  expect(svg).not.toContain('url(#bgScrim)');
});
