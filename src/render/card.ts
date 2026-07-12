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
