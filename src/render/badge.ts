import { Dimensions } from './types';

const YT_MUSIC_ICON_PATH =
  'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7l6.3 3.5-6.3 3.5Z';

type Size = 's' | 'm' | 'l' | 'xl';

const ICON_VIEWBOX_SIZE = 24;
const CORNER_MARGIN = 12;

const ICON_ONLY_SCALE: Record<'s' | 'm', number> = {
  s: 0.45,
  m: 0.55,
};

const FULL_BADGE: Record<'l' | 'xl', { iconScale: number; fontSize: number; textX: number; textY: number; width: number }> = {
  l: { iconScale: 0.55, fontSize: 11, textX: 15, textY: 10, width: 78 },
  xl: { iconScale: 0.65, fontSize: 13, textX: 17, textY: 12, width: 92 },
};

function isFullBadgeSize(size: Size): size is 'l' | 'xl' {
  return size === 'l' || size === 'xl';
}

// Title text needs to steer clear of the top-right badge on l/xl (it sits at the same
// height); artist and the waveform/equalizer row sit lower and never overlap it.
export function getBadgeTitleReservedWidth(size: Size): number {
  return isFullBadgeSize(size) ? FULL_BADGE[size].width + CORNER_MARGIN : 0;
}

export function renderBadge(dimensions: Dimensions, size: Size): string {
  const { width } = dimensions;
  const y = CORNER_MARGIN;

  if (isFullBadgeSize(size)) {
    const cfg = FULL_BADGE[size];
    const x = width - cfg.width - CORNER_MARGIN;
    return `<g transform="translate(${x}, ${y})" fill="rgba(255,255,255,0.55)">
      <path d="${YT_MUSIC_ICON_PATH}" transform="scale(${cfg.iconScale})" />
      <text x="${cfg.textX}" y="${cfg.textY}" font-family="Poppins, sans-serif" font-size="${cfg.fontSize}" font-weight="600">YT Music</text>
    </g>`;
  }

  const scale = ICON_ONLY_SCALE[size];
  const iconSize = ICON_VIEWBOX_SIZE * scale;
  const x = width - iconSize - CORNER_MARGIN;
  return `<g transform="translate(${x}, ${y})" fill="rgba(255,255,255,0.35)">
      <path d="${YT_MUSIC_ICON_PATH}" transform="scale(${scale})" />
    </g>`;
}
