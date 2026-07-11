import { Dimensions } from './types';

const YT_MUSIC_ICON_PATH =
  'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7l6.3 3.5-6.3 3.5Z';

const BADGE_WIDTH: Record<'banner' | 'compact', number> = {
  banner: 78,
  compact: 50,
};

export function getBadgeReservedWidth(size: 'banner' | 'compact'): number {
  const margin = size === 'banner' ? 22 : 10;
  return BADGE_WIDTH[size] + margin;
}

export function renderBadge(dimensions: Dimensions, size: 'banner' | 'compact'): string {
  const { width, height } = dimensions;
  const iconScale = size === 'banner' ? 0.55 : 0.38;
  const fontSize = size === 'banner' ? 11 : 8;
  const textX = size === 'banner' ? 15 : 11;
  const textY = size === 'banner' ? 10 : 7;
  const margin = size === 'banner' ? 22 : 10;
  const x = width - BADGE_WIDTH[size] - margin;
  const y = size === 'banner' ? height / 2 - 7 : height - 16;
  return `<g transform="translate(${x}, ${y})" fill="rgba(255,255,255,0.55)">
      <path d="${YT_MUSIC_ICON_PATH}" transform="scale(${iconScale})" />
      <text x="${textX}" y="${textY}" font-family="Poppins, sans-serif" font-size="${fontSize}" font-weight="600">YT Music</text>
    </g>`;
}
