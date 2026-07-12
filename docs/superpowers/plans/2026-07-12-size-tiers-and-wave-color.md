# Size Tiers (s/m/l/xl) and Wave Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `banner`/`compact` size input with four tiers (`s`/`m`/`l`/`xl`), add an independent `wave-color` input, and rework the "YT Music" badge to a top-right corner placement that stops reserving a full-height column.

**Architecture:** All layout math lives in `src/render/card.ts`, keyed off `RenderOptions.size` via a per-tier `LAYOUT` table. `src/render/dimensions.ts` maps each tier to pixel width/height/artSize. `src/render/badge.ts` renders either a full icon+text badge (l/xl) or an icon-only watermark (s/m), both top-right, and exposes how much width the title line must yield to it. `src/inputs.ts` reads the two new/changed action inputs (`size`, `wave-color`) and `src/run.ts` threads `waveColor` through to `renderCard`.

**Tech Stack:** TypeScript, Jest + ts-jest, `@actions/core`, `@vercel/ncc` (bundling into `dist/index.js`).

## Global Constraints

- Breaking change: `banner`/`compact` are removed outright, no aliasing to `l`/`m`. (Design doc: "Out of scope / explicit non-goals".)
- Exact pixel values, verbatim from the design doc:
  - `s`: 260×68, artSize 46
  - `m`: 300×80, artSize 56 (pixel-identical to today's `compact`)
  - `l`: 600×120, artSize 88 (pixel-identical to today's `banner`)
  - `xl`: 760×150, artSize 112
- `wave-color` defaults to whatever `accent-color` resolves to; `accent-color` keeps controlling only the neon art style's glow ring.
- Badge: `s`/`m` = icon-only, ~35% opacity, no reserved layout width. `l`/`xl` = full icon+"YT Music" text, ~55% opacity, top-right corner; only the **title** row yields width to it (artist and the waveform/equalizer row use the full card width).
- `xl` uses a larger title/artist font (23px/17px) than `l` (19px/14px) since the card is proportionally bigger.
- `docs/superpowers/specs/2026-07-12-size-tiers-and-wave-color-design.md` is the source of truth if this plan and the spec ever disagree.

**Starting state:** `src/render/types.ts`, `dimensions.ts`, `card.ts`, and `badge.ts` already have **uncommitted** prototype edits from the design phase (built to render real mockups). They match this plan except: `card.ts` does not yet give `xl` a bigger title/artist font or adjusted title Y — that's finished in Task 1. Run `git status --short` at the start to see them; do not discard them.

---

### Task 1: Finalize the render layer — sizes, wave color, badge, xl font bump

**Files:**
- Modify: `src/render/types.ts`
- Modify: `src/render/dimensions.ts`
- Modify: `src/render/card.ts`
- Modify: `src/render/badge.ts` (verify only — no functional change expected)
- Test: `src/render/../../__tests__/render/card.test.ts` (rewrite)
- Test: `__tests__/render/dimensions.test.ts` (new)

**Interfaces:**
- Produces: `getDimensions(size: 's' | 'm' | 'l' | 'xl'): Dimensions` where `Dimensions = { width: number; height: number; artSize: number }`
- Produces: `RenderOptions` gains `waveColor: string`; `size` is `'s' | 'm' | 'l' | 'xl'`
- Produces: `renderCard(data: CardData, options: RenderOptions): string` (signature unchanged, behavior changed)
- Produces: `getBadgeTitleReservedWidth(size: Size): number` from `badge.ts` (already implemented)
- Consumes (from existing, unmodified files): `renderArt`, `renderBackground`, `renderEqualizerBars(x, y, height, color)`, `renderWaveform(x, y, width, height, color)`, `renderScrollingText(text, x, y, availableWidth, fontSize, fontWeight, color, clipId, delay)`

- [ ] **Step 1: Confirm the current (uncommitted) state of the four files**

  Run: `git diff src/render/types.ts src/render/dimensions.ts src/render/card.ts src/render/badge.ts`

  Confirm `types.ts` has `size: 's' | 'm' | 'l' | 'xl'` and `waveColor: string`; `dimensions.ts` has the four tiers with the pixel values in Global Constraints; `card.ts` has a `LAYOUT` table keyed by size with `padding`/`gap`/`labelFontSize`; `badge.ts` has `FULL_BADGE` (l/xl) and `ICON_ONLY_SCALE` (s/m) tables plus `getBadgeTitleReservedWidth`. If any of this is missing, stop and re-read `docs/superpowers/specs/2026-07-12-size-tiers-and-wave-color-design.md` before continuing — something regressed.

- [ ] **Step 2: Replace `__tests__/render/card.test.ts` with the full new suite (will fail — xl font bump not implemented yet)**

  Overwrite the entire file:

  ```typescript
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
  ```

- [ ] **Step 3: Create `__tests__/render/dimensions.test.ts`**

  ```typescript
  import { getDimensions } from '../../src/render/dimensions';

  test('s', () => {
    expect(getDimensions('s')).toEqual({ width: 260, height: 68, artSize: 46 });
  });

  test('m', () => {
    expect(getDimensions('m')).toEqual({ width: 300, height: 80, artSize: 56 });
  });

  test('l', () => {
    expect(getDimensions('l')).toEqual({ width: 600, height: 120, artSize: 88 });
  });

  test('xl', () => {
    expect(getDimensions('xl')).toEqual({ width: 760, height: 150, artSize: 112 });
  });
  ```

- [ ] **Step 4: Run the new/changed tests and confirm the expected failures**

  Run: `npx jest __tests__/render/card.test.ts __tests__/render/dimensions.test.ts`

  Expected: `dimensions.test.ts` passes (4/4). `card.test.ts` fails only on `'xl uses a larger title/artist font than l'` (xl currently renders `font-size="19"`/`"14"`, same as l) — every other test should already pass because `dimensions.ts`/`badge.ts` already match spec. If other tests fail, stop and diff against Step 1's expectations before proceeding.

- [ ] **Step 5: Give `card.ts` a per-tier `titleSize`/`artistSize`/`titleY`, fixing the xl font bump**

  Replace the whole file:

  ```typescript
  import { CardData, RenderOptions } from './types';
  import { getDimensions } from './dimensions';
  import { renderArt } from './renderArt';
  import { renderBackground } from './background';
  import { renderEqualizerBars } from './equalizer';
  import { renderWaveform } from './waveform';
  import { renderBadge, getBadgeTitleReservedWidth } from './badge';
  import { renderScrollingText } from './marqueeText';

  const WAVEFORM_TIERS = new Set(['l', 'xl']);

  const LAYOUT: Record<
    RenderOptions['size'],
    {
      padding: number;
      gap: number;
      labelFontSize: number;
      titleSize: number;
      artistSize: number;
      /** Fixed Y for the title baseline; null means vertically centered on the card. */
      titleY: number | null;
    }
  > = {
    s: { padding: 14, gap: 10, labelFontSize: 7, titleSize: 14, artistSize: 12, titleY: null },
    m: { padding: 16, gap: 12, labelFontSize: 8, titleSize: 14, artistSize: 12, titleY: null },
    l: { padding: 28, gap: 18, labelFontSize: 8, titleSize: 19, artistSize: 14, titleY: 42 },
    xl: { padding: 28, gap: 18, labelFontSize: 8, titleSize: 23, artistSize: 17, titleY: 48 },
  };

  export function renderCard(data: CardData, options: RenderOptions): string {
    const dimensions = getDimensions(options.size);
    const { width, height, artSize } = dimensions;
    const useWaveform = WAVEFORM_TIERS.has(options.size);
    const { padding, gap, labelFontSize, titleSize, artistSize, titleY: fixedTitleY } = LAYOUT[options.size];
    const artX = padding;
    const artY = (height - artSize) / 2;
    const textX = artX + artSize + gap;

    const artMarkup = renderArt(data.thumbnailDataUri, dimensions, options);
    const backgroundMarkup = renderBackground(data.thumbnailDataUri, dimensions, options.artStyle, options.background);

    const availableTextWidth = width - textX - 20;
    const titleAvailableWidth = availableTextWidth - getBadgeTitleReservedWidth(options.size);

    const titleY = fixedTitleY ?? height / 2 + 8;
    const artistY = titleY + artistSize + 6;

    const bottomMarkup = useWaveform
      ? renderWaveform(textX, artistY + 14, availableTextWidth, height - 14 - (artistY + 14), options.waveColor)
      : `<g transform="translate(${textX}, ${height / 2 - 22})">
        ${renderEqualizerBars(0, 0, 10, options.waveColor)}
        <text x="32" y="9" font-family="Poppins, sans-serif" font-size="${labelFontSize}"
          font-weight="600" letter-spacing="1" fill="rgba(255,255,255,0.65)">NOW PLAYING</text>
      </g>`;

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bgBlur"><feGaussianBlur stdDeviation="18" /></filter>
        <clipPath id="cardClip"><rect x="0" y="0" width="${width}" height="${height}" rx="12" /></clipPath>
        <linearGradient id="bgScrim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.82" />
          <stop offset="45%" stop-color="#000" stop-opacity="0.55" />
          <stop offset="75%" stop-color="#000" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${backgroundMarkup}
      <g transform="translate(${artX}, ${artY})">${artMarkup}</g>
      ${!useWaveform ? bottomMarkup : ''}
      ${renderScrollingText(data.title, textX, titleY, titleAvailableWidth, titleSize, 700, '#fff', 'titleClip', 0)}
      ${renderScrollingText(data.artist, textX, artistY, availableTextWidth, artistSize, 500, 'rgba(255,255,255,0.75)', 'artistClip', 0.3)}
      ${useWaveform ? bottomMarkup : ''}
      ${renderBadge(dimensions, options.size)}
    </svg>`;
  }
  ```

- [ ] **Step 6: Run the full render test suite and confirm everything passes**

  Run: `npx jest __tests__/render/card.test.ts __tests__/render/dimensions.test.ts -v`

  Expected: all tests pass (dimensions.test.ts 4/4, card.test.ts all green including the xl font-size test).

- [ ] **Step 7: Commit**

  ```bash
  git add src/render/types.ts src/render/dimensions.ts src/render/card.ts src/render/badge.ts __tests__/render/card.test.ts __tests__/render/dimensions.test.ts
  git commit -m "Replace banner/compact with s/m/l/xl size tiers

Adds independent wave-color support and a top-right badge (full
text on l/xl, icon-only watermark on s/m). xl also gets a bumped
title/artist font size relative to l."
  ```

---

### Task 2: Update the other render tests that reference the old size API

**Files:**
- Modify: `__tests__/render/background.test.ts`
- Modify: `__tests__/render/renderArt.test.ts`
- Modify: `__tests__/render/neonArt.test.ts`
- Modify: `__tests__/render/cassetteArt.test.ts`
- Modify: `__tests__/render/vinylSleeveArt.test.ts`
- Delete: `__tests__/render/compactSizes.test.ts`
- Create: `__tests__/render/allSizesSmoke.test.ts`

**Interfaces:**
- Consumes: `getDimensions` and `renderArt`/`renderCard` from Task 1 (already committed).

- [ ] **Step 1: Update `__tests__/render/background.test.ts`'s dimension lookup**

  Change line 4 from:
  ```typescript
  const bannerDim = getDimensions('banner');
  ```
  to:
  ```typescript
  const lDim = getDimensions('l');
  ```
  Then replace every other use of `bannerDim` in the file with `lDim` (there are 4 occurrences, one per test).

- [ ] **Step 2: Update `__tests__/render/renderArt.test.ts`**

  Replace lines 4-13:
  ```typescript
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
  ```
  with:
  ```typescript
  const dims = getDimensions('l');
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
  ```

- [ ] **Step 3: Update `__tests__/render/neonArt.test.ts`, `cassetteArt.test.ts`, `vinylSleeveArt.test.ts`**

  In each file, replace every `getDimensions('banner')` with `getDimensions('l')` (each file has 2 occurrences — one inline in a test, one assigned to a `dims` const used by a second test).

- [ ] **Step 4: Run these five test files and confirm they pass**

  Run: `npx jest __tests__/render/background.test.ts __tests__/render/renderArt.test.ts __tests__/render/neonArt.test.ts __tests__/render/cassetteArt.test.ts __tests__/render/vinylSleeveArt.test.ts`

  Expected: all pass. These are mechanical renames — no behavior changed.

- [ ] **Step 5: Delete `__tests__/render/compactSizes.test.ts` and replace it with a size-tier smoke test**

  Delete `__tests__/render/compactSizes.test.ts`, then create `__tests__/render/allSizesSmoke.test.ts`:

  ```typescript
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
  ```

- [ ] **Step 6: Run the new smoke test file**

  Run: `npx jest __tests__/render/allSizesSmoke.test.ts -v`

  Expected: 9 tests pass (4 sizes + 4 art styles + 1 background=full case).

- [ ] **Step 7: Commit**

  ```bash
  git add __tests__/render/background.test.ts __tests__/render/renderArt.test.ts __tests__/render/neonArt.test.ts __tests__/render/cassetteArt.test.ts __tests__/render/vinylSleeveArt.test.ts __tests__/render/compactSizes.test.ts __tests__/render/allSizesSmoke.test.ts
  git commit -m "Update remaining render tests for the s/m/l/xl size tiers"
  ```

---

### Task 3: `wave-color` input and the `size` default/enum in `inputs.ts` + `action.yml`

**Files:**
- Modify: `src/inputs.ts`
- Modify: `action.yml`
- Modify: `__tests__/inputs.test.ts`

**Interfaces:**
- Consumes: `RenderOptions` from `src/render/types.ts` (Task 1) — `ActionConfig extends RenderOptions`.
- Produces: `getActionConfig(): ActionConfig` now returns `size: 's' | 'm' | 'l' | 'xl'` (default `'l'`) and `waveColor: string` (defaults to the resolved `accentColor`).

- [ ] **Step 1: Update `__tests__/inputs.test.ts`'s default-values test (will fail until Step 3)**

  Replace lines 18-31:
  ```typescript
  test('applies defaults when optional inputs are omitted', () => {
    mockInputs({ tracks: 'https://a' });
    const config = getActionConfig();
    expect(config.mode).toBe('random');
    expect(config.size).toBe('banner');
    expect(config.artStyle).toBe('static');
    expect(config.artShape).toBe('circle');
    expect(config.accentColor).toBe('#7dd3fc');
    expect(config.vinylSpeed).toBe('normal');
    expect(config.labelSize).toBe('small');
    expect(config.background).toBe('blurred');
    expect(config.outputPath).toBe('now-playing.svg');
    expect(config.statePath).toBe('.now-playing-state.json');
  });
  ```
  with:
  ```typescript
  test('applies defaults when optional inputs are omitted', () => {
    mockInputs({ tracks: 'https://a' });
    const config = getActionConfig();
    expect(config.mode).toBe('random');
    expect(config.size).toBe('l');
    expect(config.artStyle).toBe('static');
    expect(config.artShape).toBe('circle');
    expect(config.accentColor).toBe('#7dd3fc');
    expect(config.waveColor).toBe('#7dd3fc');
    expect(config.vinylSpeed).toBe('normal');
    expect(config.labelSize).toBe('small');
    expect(config.background).toBe('blurred');
    expect(config.outputPath).toBe('now-playing.svg');
    expect(config.statePath).toBe('.now-playing-state.json');
  });
  ```

- [ ] **Step 2: Update the "honors explicit overrides" test and add two wave-color tests**

  Replace lines 33-52 (the `'honors explicit overrides'` test) with:
  ```typescript
  test('honors explicit overrides', () => {
    mockInputs({
      tracks: 'https://a',
      mode: 'sequential',
      size: 'm',
      'art-style': 'vinyl',
      'vinyl-speed': 'fast',
      'label-size': 'large',
      background: 'full',
      'output-path': 'card.svg',
    });
    const config = getActionConfig();
    expect(config.mode).toBe('sequential');
    expect(config.size).toBe('m');
    expect(config.artStyle).toBe('vinyl');
    expect(config.vinylSpeed).toBe('fast');
    expect(config.labelSize).toBe('large');
    expect(config.background).toBe('full');
    expect(config.outputPath).toBe('card.svg');
  });

  test('wave-color defaults to accent-color when omitted', () => {
    mockInputs({ tracks: 'https://a', 'accent-color': '#ff2ea6' });
    const config = getActionConfig();
    expect(config.accentColor).toBe('#ff2ea6');
    expect(config.waveColor).toBe('#ff2ea6');
  });

  test('wave-color can be set independently of accent-color', () => {
    mockInputs({ tracks: 'https://a', 'accent-color': '#ff2ea6', 'wave-color': '#22d3ee' });
    const config = getActionConfig();
    expect(config.accentColor).toBe('#ff2ea6');
    expect(config.waveColor).toBe('#22d3ee');
  });
  ```

- [ ] **Step 3: Run the updated test file and confirm the expected failures**

  Run: `npx jest __tests__/inputs.test.ts -v`

  Expected: FAIL — `config.size` is `'banner'` not `'l'`, and `config.waveColor` is `undefined`.

- [ ] **Step 4: Update `src/inputs.ts`**

  Replace the `getActionConfig` function:
  ```typescript
  export function getActionConfig(): ActionConfig {
    const accentColor = core.getInput('accent-color') || '#7dd3fc';
    return {
      tracks: parseTracks(core.getInput('tracks', { required: true })),
      mode: (core.getInput('mode') || 'random') as ActionConfig['mode'],
      size: (core.getInput('size') || 'l') as ActionConfig['size'],
      artStyle: (core.getInput('art-style') || 'static') as ActionConfig['artStyle'],
      artShape: (core.getInput('art-shape') || 'circle') as ActionConfig['artShape'],
      accentColor,
      waveColor: core.getInput('wave-color') || accentColor,
      vinylSpeed: (core.getInput('vinyl-speed') || 'normal') as ActionConfig['vinylSpeed'],
      labelSize: (core.getInput('label-size') || 'small') as ActionConfig['labelSize'],
      background: (core.getInput('background') || 'blurred') as ActionConfig['background'],
      outputPath: core.getInput('output-path') || 'now-playing.svg',
      statePath: core.getInput('state-path') || '.now-playing-state.json',
    };
  }
  ```
  (The rest of the file — imports, `ActionConfig` interface, `parseTracks` — is unchanged.)

- [ ] **Step 5: Run the test file again and confirm it passes**

  Run: `npx jest __tests__/inputs.test.ts -v`

  Expected: all tests pass, including the two new wave-color tests.

- [ ] **Step 6: Update `action.yml`**

  Replace the `size` input block:
  ```yaml
  size:
    description: 'banner | compact'
    required: false
    default: 'banner'
  ```
  with:
  ```yaml
  size:
    description: 's | m | l | xl'
    required: false
    default: 'l'
  ```

  Replace the `accent-color` input block:
  ```yaml
  accent-color:
    description: 'Hex color for the equalizer bars and badge'
    required: false
    default: '#7dd3fc'
  ```
  with:
  ```yaml
  accent-color:
    description: 'Hex color for the neon art style glow ring. Also the default for wave-color if that is not set.'
    required: false
    default: '#7dd3fc'
  ```

  Add a new `wave-color` input directly after `accent-color`:
  ```yaml
  wave-color:
    description: 'Hex color for the waveform (l/xl) or equalizer bars (s/m). Defaults to accent-color.'
    required: false
    default: ''
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add src/inputs.ts action.yml __tests__/inputs.test.ts
  git commit -m "Add wave-color input; default size to l"
  ```

---

### Task 4: Thread `waveColor` through `run.ts`

**Files:**
- Modify: `src/run.ts`
- Modify: `__tests__/run.test.ts`

**Interfaces:**
- Consumes: `ActionConfig` from Task 3 (`config.size: 's'|'m'|'l'|'xl'`, `config.waveColor: string`).

- [ ] **Step 1: Update `__tests__/run.test.ts`'s `baseConfig` (will fail — `renderCard` mock isn't asserted on shape, but this keeps the fixture honest and matches `ActionConfig`)**

  Replace lines 22-33:
  ```typescript
  const baseConfig = {
    tracks: ['https://music.youtube.com/watch?v=4NRXx6U8ABQ'],
    mode: 'random' as const,
    size: 'banner' as const,
    artStyle: 'static' as const,
    artShape: 'circle' as const,
    accentColor: '#7dd3fc',
    vinylSpeed: 'normal' as const,
    labelSize: 'small' as const,
    outputPath: 'now-playing.svg',
    statePath: '.now-playing-state.json',
  };
  ```
  with:
  ```typescript
  const baseConfig = {
    tracks: ['https://music.youtube.com/watch?v=4NRXx6U8ABQ'],
    mode: 'random' as const,
    size: 'l' as const,
    artStyle: 'static' as const,
    artShape: 'circle' as const,
    accentColor: '#7dd3fc',
    waveColor: '#7dd3fc',
    vinylSpeed: 'normal' as const,
    labelSize: 'small' as const,
    background: 'blurred' as const,
    outputPath: 'now-playing.svg',
    statePath: '.now-playing-state.json',
  };
  ```
  (This also adds the previously-missing `background` field, which `ActionConfig`/`RenderOptions` already required — `run.test.ts` mocks `getActionConfig` directly so TypeScript wasn't catching the gap, but it should match the real shape.)

- [ ] **Step 2: Run `run.test.ts` — expect it still passes (it mocks `renderCard`, so a missing field in the *call* doesn't fail these assertions) then check `src/run.ts` directly**

  Run: `npx jest __tests__/run.test.ts -v`

  Expected: passes (this test suite doesn't assert on what `renderCard` was called with). The real bug is in `src/run.ts` itself — check it next.

- [ ] **Step 3: Add `waveColor` to the `renderCard` call in `src/run.ts`**

  In `src/run.ts`, the `renderCard` call currently omits `waveColor` entirely, which does not type-check against `RenderOptions` (from Task 1). Replace:
  ```typescript
      const svg = renderCard(
        {
          title: metadata.title,
          artist: metadata.artist,
          thumbnailDataUri,
          sourceUrl: track,
        },
        {
          size: config.size,
          artStyle: config.artStyle,
          artShape: config.artShape,
          accentColor: config.accentColor,
          vinylSpeed: config.vinylSpeed,
          labelSize: config.labelSize,
          background: config.background,
        }
      );
  ```
  with:
  ```typescript
      const svg = renderCard(
        {
          title: metadata.title,
          artist: metadata.artist,
          thumbnailDataUri,
          sourceUrl: track,
        },
        {
          size: config.size,
          artStyle: config.artStyle,
          artShape: config.artShape,
          accentColor: config.accentColor,
          waveColor: config.waveColor,
          vinylSpeed: config.vinylSpeed,
          labelSize: config.labelSize,
          background: config.background,
        }
      );
  ```

- [ ] **Step 4: Typecheck and run the full test suite to confirm nothing else broke**

  Run: `npx tsc --noEmit && npx jest`

  Expected: `tsc` reports no errors; all Jest suites pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/run.ts __tests__/run.test.ts
  git commit -m "Thread waveColor from config into renderCard"
  ```

---

### Task 5: Regenerate `examples/*.svg` and update the README

**Files:**
- Create/Delete: `examples/*.svg` (see mapping below)
- Modify: `README.md`

**Interfaces:**
- Consumes: `renderCard` from `src/render/card.ts` (Task 1), run through a temporary throwaway script (not committed).

- [ ] **Step 1: Write a temporary example-generation script**

  This project has no persisted example-generator (past example commits were produced ad hoc and only the output SVGs were committed) — follow that convention. Create `__tests__/gen-examples.test.ts` (temporary; deleted in Step 4):

  ```typescript
  import * as fs from 'fs';
  import * as path from 'path';
  import { renderCard } from '../src/render/card';
  import { RenderOptions } from '../src/render/types';

  interface Fixture {
    title: string;
    artist: string;
    thumbnailDataUri: string;
  }

  function extractFixture(existingSvgPath: string): Fixture {
    const svg = fs.readFileSync(existingSvgPath, 'utf8');
    const thumbnailDataUri = svg.match(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/)![0];
    const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    // First <text> is the title, second is the artist (see card.ts markup order).
    return { title: texts[0], artist: texts[1], thumbnailDataUri };
  }

  const outDir = path.join(__dirname, '..', 'examples');

  const STYLE_SOURCE: Array<{ artStyle: RenderOptions['artStyle']; sourceFile: string }> = [
    { artStyle: 'static', sourceFile: 'static-banner.svg' },
    { artStyle: 'vinyl', sourceFile: 'vinyl-banner.svg' },
    { artStyle: 'cassette', sourceFile: 'cassette-banner.svg' },
    { artStyle: 'neon', sourceFile: 'neon-banner.svg' },
    { artStyle: 'vinyl-sleeve', sourceFile: 'vinyl-sleeve-banner.svg' },
  ];

  const baseOptions = {
    artShape: 'circle' as const,
    accentColor: '#7dd3fc',
    waveColor: '#7dd3fc',
    vinylSpeed: 'normal' as const,
    labelSize: 'small' as const,
    background: 'blurred' as const,
  };

  test('regenerate art-style examples at size l', () => {
    for (const { artStyle, sourceFile } of STYLE_SOURCE) {
      const fixture = extractFixture(path.join(outDir, sourceFile));
      const svg = renderCard(fixture, { ...baseOptions, size: 'l', artStyle });
      fs.writeFileSync(path.join(outDir, `${artStyle}-l.svg`), svg);
    }
  });

  test('regenerate the background=full comparison example', () => {
    const fixture = extractFixture(path.join(outDir, 'vinyl-background-full-banner.svg'));
    const svg = renderCard(fixture, { ...baseOptions, size: 'l', artStyle: 'vinyl', background: 'full' });
    fs.writeFileSync(path.join(outDir, 'vinyl-background-full-l.svg'), svg);
  });

  test('regenerate the Sizes section examples (static style, all four tiers)', () => {
    const fixture = extractFixture(path.join(outDir, 'static-banner.svg'));
    for (const size of ['s', 'm', 'xl'] as const) {
      const svg = renderCard(fixture, { ...baseOptions, size, artStyle: 'static' });
      fs.writeFileSync(path.join(outDir, `static-${size}.svg`), svg);
    }
    // static-l.svg was already written by the first test above and is reused for both
    // the Examples table and the Sizes section.
  });
  ```

- [ ] **Step 2: Run the script**

  Run: `npx jest __tests__/gen-examples.test.ts -v`

  Expected: 3 tests pass. Confirm the new files exist:

  Run: `ls examples/*-l.svg examples/static-s.svg examples/static-m.svg examples/static-xl.svg examples/vinyl-background-full-l.svg`

  Expected: all 9 files listed (`static-l.svg`, `vinyl-l.svg`, `cassette-l.svg`, `neon-l.svg`, `vinyl-sleeve-l.svg`, `static-s.svg`, `static-m.svg`, `static-xl.svg`, `vinyl-background-full-l.svg`).

- [ ] **Step 3: Delete the old `-banner`/`-compact` example files**

  Run:
  ```bash
  rm examples/static-banner.svg examples/static-compact.svg \
     examples/vinyl-banner.svg examples/vinyl-compact.svg \
     examples/cassette-banner.svg examples/cassette-compact.svg \
     examples/neon-banner.svg examples/neon-compact.svg \
     examples/vinyl-sleeve-banner.svg examples/vinyl-sleeve-compact.svg \
     examples/vinyl-background-full-banner.svg examples/vinyl-background-full-compact.svg
  ```

- [ ] **Step 4: Delete the temporary generator script**

  Run: `rm __tests__/gen-examples.test.ts`

- [ ] **Step 5: Update `README.md`'s Examples section**

  Replace:
  ```markdown
  ## Examples

  Every `art-style` at both sizes:

  | Style | Banner (600×120) | Compact (300×80) |
  |---|---|---|
  | `static` | ![static banner](examples/static-banner.svg) | ![static compact](examples/static-compact.svg) |
  | `vinyl` | ![vinyl banner](examples/vinyl-banner.svg) | ![vinyl compact](examples/vinyl-compact.svg) |
  | `cassette` | ![cassette banner](examples/cassette-banner.svg) | ![cassette compact](examples/cassette-compact.svg) |
  | `neon` | ![neon banner](examples/neon-banner.svg) | ![neon compact](examples/neon-compact.svg) |
  | `vinyl-sleeve` | ![vinyl-sleeve banner](examples/vinyl-sleeve-banner.svg) | ![vinyl-sleeve compact](examples/vinyl-sleeve-compact.svg) |
  ```
  with:
  ```markdown
  ## Examples

  Every `art-style`, shown at size `l`:

  | Style | Example |
  |---|---|
  | `static` | ![static](examples/static-l.svg) |
  | `vinyl` | ![vinyl](examples/vinyl-l.svg) |
  | `cassette` | ![cassette](examples/cassette-l.svg) |
  | `neon` | ![neon](examples/neon-l.svg) |
  | `vinyl-sleeve` | ![vinyl-sleeve](examples/vinyl-sleeve-l.svg) |

  ## Sizes

  Four size tiers — `s`, `m`, `l`, `xl` — shown here with the `static` style:

  | Size | Dimensions | Example |
  |---|---|---|
  | `s` | 260×68 | ![size s](examples/static-s.svg) |
  | `m` | 300×80 | ![size m](examples/static-m.svg) |
  | `l` | 600×120 | ![size l](examples/static-l.svg) |
  | `xl` | 760×150 | ![size xl](examples/static-xl.svg) |
  ```

- [ ] **Step 6: Update the "Choosing a style" section's example**

  Replace:
  ```markdown
  Every option — `art-style`, `size`, colors, speeds — is just another key in the same `with:` block as `tracks`, added to the workflow step from Quick start above. For example, to switch to the spinning `vinyl-sleeve` look, render it `compact`, and use a custom accent color:

  ```yaml
  - uses: <your-username>/ytmusic-display-widget@v1
    with:
      tracks: |
        https://music.youtube.com/watch?v=JU9TouRnO84
      art-style: vinyl-sleeve
      size: compact
      accent-color: "#ff2ea6"
  ```
  ```
  with:
  ```markdown
  Every option — `art-style`, `size`, colors, speeds — is just another key in the same `with:` block as `tracks`, added to the workflow step from Quick start above. For example, to switch to the spinning `vinyl-sleeve` look, render it at size `m`, and use a custom accent and wave color:

  ```yaml
  - uses: <your-username>/ytmusic-display-widget@v1
    with:
      tracks: |
        https://music.youtube.com/watch?v=JU9TouRnO84
      art-style: vinyl-sleeve
      size: m
      accent-color: "#ff2ea6"
      wave-color: "#22d3ee"
  ```
  ```

- [ ] **Step 7: Update the "Background modes" section's example filenames**

  Replace:
  ```markdown
  | `background: blurred` (default) | `background: full` |
  |---|---|
  | ![vinyl blurred background](examples/vinyl-banner.svg) | ![vinyl full background](examples/vinyl-background-full-banner.svg) |
  ```
  with:
  ```markdown
  | `background: blurred` (default) | `background: full` |
  |---|---|
  | ![vinyl blurred background](examples/vinyl-l.svg) | ![vinyl full background](examples/vinyl-background-full-l.svg) |
  ```

- [ ] **Step 8: Update the Inputs table**

  Replace:
  ```markdown
  | `size` | `banner` | `banner` (600×120) \| `compact` (300×80) |
  | `art-style` | `static` | `static` \| `vinyl` \| `cassette` \| `neon` \| `vinyl-sleeve` |
  | `art-shape` | `circle` | `circle` \| `square` — `static` style only |
  | `accent-color` | `#7dd3fc` | Hex color for the equalizer bars and badge |
  ```
  with:
  ```markdown
  | `size` | `l` | `s` (260×68) \| `m` (300×80) \| `l` (600×120) \| `xl` (760×150) |
  | `art-style` | `static` | `static` \| `vinyl` \| `cassette` \| `neon` \| `vinyl-sleeve` |
  | `art-shape` | `circle` | `circle` \| `square` — `static` style only |
  | `accent-color` | `#7dd3fc` | Hex color for the neon art style's glow ring; also `wave-color`'s default |
  | `wave-color` | *(= accent-color)* | Hex color for the waveform (`l`/`xl`) or equalizer bars (`s`/`m`) |
  ```

  (Insert the `wave-color` row directly after `accent-color`, keeping the rest of the table — `vinyl-speed` through `state-path` — unchanged.)

- [ ] **Step 9: Verify all README image links resolve to real files**

  Run:
  ```bash
  for f in $(grep -oE 'examples/[a-zA-Z0-9_.-]+\.svg' README.md); do
    test -f "$f" && echo "OK   $f" || echo "MISSING $f"
  done
  ```
  Expected: every line printed is `OK` — no `MISSING` lines.

- [ ] **Step 10: Run the full test suite once more**

  Run: `npx jest`

  Expected: all suites pass (this step doesn't touch source, but confirms the example-generation script removal didn't leave anything broken).

- [ ] **Step 11: Commit**

  ```bash
  git add examples README.md
  git status --short
  git commit -m "Regenerate examples for s/m/l/xl; restructure README Examples/Sizes sections"
  ```

  Note: `git add examples` will stage both the new files and the deletions from Step 3 since they're the same directory.

---

### Task 6: Rebuild the bundle and do a final full verification

**Files:**
- Modify: `dist/index.js` (generated)

- [ ] **Step 1: Typecheck the whole project**

  Run: `npx tsc --noEmit`

  Expected: no errors.

- [ ] **Step 2: Run the full test suite**

  Run: `npx jest`

  Expected: all suites pass, no `banner`/`compact` references remain anywhere in `__tests__/` or `src/`. Confirm with:

  Run: `grep -rn "'banner'\|'compact'\|\"banner\"\|\"compact\"" src/ __tests__/`

  Expected: no output (empty).

- [ ] **Step 3: Rebuild the bundled action**

  Run: `npm run build`

  Expected: `dist/index.js` is rewritten (check with `git status --short dist/index.js` — should show `M`).

- [ ] **Step 4: Commit**

  ```bash
  git add dist/index.js
  git commit -m "Rebuild dist bundle"
  ```

- [ ] **Step 5: Final sanity check — confirm the bundle actually contains the new behavior**

  `dist/index.js` is the real GitHub Action entry point (it reads inputs from the environment via `@actions/core`), so it can't be invoked directly outside a workflow run. Instead, confirm the rebuilt bundle embeds the new tier/color logic rather than stale minified output:

  Run:
  ```bash
  grep -c "wave-color" dist/index.js
  grep -c "'xl'" dist/index.js
  ```
  Expected: both commands print a number greater than `0`.

  Then re-run the full test suite one last time as the end-to-end confirmation of `renderCard` itself (already exercises every size, wave-color, and badge case added in this plan):

  Run: `npx jest`

  Expected: all suites pass.
