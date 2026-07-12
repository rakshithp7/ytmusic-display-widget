import { CardData, RenderOptions } from './types';
import { getDimensions } from './dimensions';
import { renderArt } from './renderArt';
import { renderBackground } from './background';
import { renderEqualizerBars } from './equalizer';
import { renderWaveform } from './waveform';
import { renderBadge, getBadgeReservedWidth } from './badge';
import { renderScrollingText } from './marqueeText';

export function renderCard(data: CardData, options: RenderOptions): string {
  const dimensions = getDimensions(options.size);
  const { width, height, artSize } = dimensions;
  const isBanner = options.size === 'banner';
  const padding = isBanner ? 28 : 16;
  const gap = isBanner ? 18 : 12;
  const artX = padding;
  const artY = (height - artSize) / 2;
  const textX = artX + artSize + gap;

  const artMarkup = renderArt(data.thumbnailDataUri, dimensions, options);
  const backgroundMarkup = renderBackground(data.thumbnailDataUri, dimensions, options.artStyle);

  const titleSize = isBanner ? 19 : 14;
  const artistSize = isBanner ? 14 : 12;
  const availableTextWidth = width - textX - getBadgeReservedWidth(options.size) - 8;

  const titleY = isBanner ? 42 : height / 2 + 8;
  const artistY = titleY + artistSize + 6;

  const bottomMarkup = isBanner
    ? renderWaveform(textX, artistY + 14, availableTextWidth, height - 14 - (artistY + 14), options.accentColor)
    : `<g transform="translate(${textX}, ${height / 2 - 22})">
      ${renderEqualizerBars(0, 0, 10, options.accentColor)}
      <text x="32" y="9" font-family="Poppins, sans-serif" font-size="8"
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
    ${!isBanner ? bottomMarkup : ''}
    ${renderScrollingText(data.title, textX, titleY, availableTextWidth, titleSize, 700, '#fff', 'titleClip', 0)}
    ${renderScrollingText(data.artist, textX, artistY, availableTextWidth, artistSize, 500, 'rgba(255,255,255,0.75)', 'artistClip', 0.3)}
    ${isBanner ? bottomMarkup : ''}
    ${renderBadge(dimensions, options.size)}
  </svg>`;
}
