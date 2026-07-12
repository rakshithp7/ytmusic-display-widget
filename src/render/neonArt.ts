import { Dimensions } from './types';

export function renderNeonArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  accentColor: string
): string {
  const { artSize } = dimensions;
  const inset = 3;
  const borderSize = artSize - inset * 2;
  const artInset = inset + 2;
  const artInnerSize = artSize - artInset * 2;

  return `<filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <rect x="${inset}" y="${inset}" width="${borderSize}" height="${borderSize}" rx="10"
      fill="none" stroke="${accentColor}" stroke-width="2.5" filter="url(#neonGlow)" />
    <clipPath id="neonClip"><rect x="${artInset}" y="${artInset}" width="${artInnerSize}" height="${artInnerSize}" rx="8" /></clipPath>
    <image href="${thumbnailDataUri}" x="${artInset}" y="${artInset}" width="${artInnerSize}" height="${artInnerSize}"
      clip-path="url(#neonClip)" preserveAspectRatio="xMidYMid slice" />`;
}
