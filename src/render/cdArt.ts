import { Dimensions, RenderOptions } from './types';
import { getSpinSeconds } from './spinSpeed';

export function renderCdArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  vinylSpeed: RenderOptions['vinylSpeed']
): string {
  const { artSize } = dimensions;
  const c = artSize / 2;
  const r = c - 1;
  const seconds = getSpinSeconds(vinylSpeed);

  return `<clipPath id="cdClip"><circle cx="${c}" cy="${c}" r="${r}" /></clipPath>
    <radialGradient id="cdSheen" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="35%" stop-color="#ff2ea6" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#7dd3fc" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#ffd23f" stop-opacity="0" />
    </radialGradient>
    <g clip-path="url(#cdClip)">
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="0 ${c} ${c}" to="360 ${c} ${c}" dur="${seconds}s" repeatCount="indefinite" />
        <image href="${thumbnailDataUri}" x="0" y="0" width="${artSize}" height="${artSize}" preserveAspectRatio="xMidYMid slice" />
      </g>
      <rect x="0" y="0" width="${artSize}" height="${artSize}" fill="url(#cdSheen)" style="mix-blend-mode:screen" />
    </g>
    <circle cx="${c}" cy="${c}" r="${r * 0.14}" fill="#0d1117" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;
}
