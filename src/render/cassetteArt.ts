import { Dimensions, RenderOptions } from './types';
import { getSpinSeconds } from './spinSpeed';

export function renderCassetteArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  vinylSpeed: RenderOptions['vinylSpeed']
): string {
  const { artSize } = dimensions;
  const seconds = getSpinSeconds(vinylSpeed);

  const shellWidth = artSize;
  const shellHeight = artSize * 0.66;
  const shellY = (artSize - shellHeight) / 2;
  const reelRadius = shellHeight * 0.24;
  const reelY = shellY + shellHeight * 0.42;
  const leftReelX = shellWidth * 0.32;
  const rightReelX = shellWidth * 0.68;
  const filmStripHeight = shellHeight * 0.2;
  const filmStripY = shellY + shellHeight - filmStripHeight - shellHeight * 0.06;
  const filmStripX = shellWidth * 0.1;
  const filmStripWidth = shellWidth * 0.8;

  const reel = (cx: number, clipId: string) => `
      <circle cx="${cx}" cy="${reelY}" r="${reelRadius}" fill="#c9a876" />
      <clipPath id="${clipId}"><circle cx="${cx}" cy="${reelY}" r="${reelRadius}" /></clipPath>
      <g clip-path="url(#${clipId})">
        <circle cx="${cx}" cy="${reelY}" r="${reelRadius}" fill="none" stroke="#8a6d47"
          stroke-width="${reelRadius}" stroke-dasharray="${reelRadius * 0.55} ${reelRadius * 0.55}">
          <animateTransform attributeName="transform" type="rotate"
            from="0 ${cx} ${reelY}" to="360 ${cx} ${reelY}" dur="${seconds}s" repeatCount="indefinite" />
        </circle>
      </g>
      <circle cx="${cx}" cy="${reelY}" r="${reelRadius * 0.35}" fill="#0d0908" />`;

  return `<rect x="0" y="${shellY}" width="${shellWidth}" height="${shellHeight}" rx="6" fill="#2a221c" />
    <rect x="${shellWidth * 0.08}" y="${shellY + shellHeight * 0.12}" width="${shellWidth * 0.84}" height="${shellHeight * 0.5}" rx="3" fill="#0d0908" />
    ${reel(leftReelX, 'cassetteReelClipLeft')}
    ${reel(rightReelX, 'cassetteReelClipRight')}
    <clipPath id="cassetteFilm"><rect x="${filmStripX}" y="${filmStripY}" width="${filmStripWidth}" height="${filmStripHeight}" rx="2" /></clipPath>
    <image href="${thumbnailDataUri}" x="${filmStripX}" y="${filmStripY}" width="${filmStripWidth}" height="${filmStripHeight}"
      clip-path="url(#cassetteFilm)" preserveAspectRatio="xMidYMid slice" />`;
}
