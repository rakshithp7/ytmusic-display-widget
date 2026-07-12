import { CardData, RenderOptions } from './types';
import { getDimensions } from './dimensions';
import { renderArt } from './renderArt';
import { renderBackground } from './background';
import { renderEqualizerBars } from './equalizer';
import { renderBadge, getBadgeReservedWidth } from './badge';
import { renderScrollingText } from './marqueeText';

export function renderCard(data: CardData, options: RenderOptions): string {
  const dimensions = getDimensions(options.size);
  const { width, height, artSize } = dimensions;
  const padding = options.size === 'banner' ? 28 : 16;
  const gap = options.size === 'banner' ? 18 : 12;
  const artX = padding;
  const artY = (height - artSize) / 2;
  const textX = artX + artSize + gap;

  const artMarkup = renderArt(data.thumbnailDataUri, dimensions, options);
  const backgroundMarkup = renderBackground(data.thumbnailDataUri, dimensions, options.artStyle);

  const titleSize = options.size === 'banner' ? 19 : 14;
  const artistSize = options.size === 'banner' ? 14 : 12;
  const labelFontSize = options.size === 'banner' ? 10 : 8;
  const barHeight = options.size === 'banner' ? 14 : 10;
  const availableTextWidth = width - textX - getBadgeReservedWidth(options.size) - 8;

  const titleY = height / 2 + 8;
  const labelY = height / 2 - (options.size === 'banner' ? 28 : 22);
  const artistY = titleY + artistSize + 6;

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
    <g transform="translate(${textX}, ${labelY})">
      ${renderEqualizerBars(0, 0, barHeight, options.accentColor)}
      <text x="32" y="${barHeight - 1}" font-family="Poppins, sans-serif" font-size="${labelFontSize}"
        font-weight="600" letter-spacing="1" fill="rgba(255,255,255,0.65)">NOW PLAYING</text>
    </g>
    ${renderScrollingText(data.title, textX, titleY, availableTextWidth, titleSize, 700, '#fff', 'titleClip', 0)}
    ${renderScrollingText(data.artist, textX, artistY, availableTextWidth, artistSize, 500, 'rgba(255,255,255,0.75)', 'artistClip', 0.3)}
    ${renderBadge(dimensions, options.size)}
  </svg>`;
}
