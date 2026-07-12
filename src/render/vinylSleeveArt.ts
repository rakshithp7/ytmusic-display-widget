import { Dimensions, RenderOptions } from './types';
import { getSpinSeconds } from './spinSpeed';
import { getLabelRatio } from './labelRatio';

export function renderVinylSleeveArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  vinylSpeed: RenderOptions['vinylSpeed'],
  labelSize: RenderOptions['labelSize']
): string {
  const { artSize } = dimensions;
  const seconds = getSpinSeconds(vinylSpeed);
  const labelRatio = getLabelRatio(labelSize);

  const sleeveSize = artSize * 1.05;
  const sleeveOffsetX = -artSize * 0.2;
  const sleeveOffsetY = artSize * 0.02;

  const discSize = artSize * 0.8;
  const discOffsetX = (artSize - discSize) / 2 + artSize * 0.1;
  const discOffsetY = (artSize - discSize) / 2 + artSize * 0.05;
  const c = discSize / 2;
  const discRadius = c - 1;
  const labelRadius = discRadius * labelRatio;
  const labelSpan = labelRadius * 2;
  const spindleRadius = discRadius * 0.05;
  const grooveRadii = [0.93, 0.86, 0.79, 0.72]
    .map((ratio) => discRadius * ratio)
    .filter((r) => r > labelRadius + 2);

  return `<g transform="translate(${sleeveOffsetX}, ${sleeveOffsetY}) rotate(-6, ${sleeveSize / 2}, ${sleeveSize / 2})">
      <clipPath id="sleeveClip"><rect x="0" y="0" width="${sleeveSize}" height="${sleeveSize}" rx="6" /></clipPath>
      <image href="${thumbnailDataUri}" x="0" y="0" width="${sleeveSize}" height="${sleeveSize}"
        clip-path="url(#sleeveClip)" preserveAspectRatio="xMidYMid slice" opacity="0.85" />
    </g>
    <g transform="translate(${discOffsetX}, ${discOffsetY})">
      <clipPath id="sleeveDiscClip"><circle cx="${c}" cy="${c}" r="${discRadius}" /></clipPath>
      <radialGradient id="sleeveDiscGrad" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#2c2c2c" /><stop offset="100%" stop-color="#040404" />
      </radialGradient>
      <g clip-path="url(#sleeveDiscClip)">
        <circle cx="${c}" cy="${c}" r="${discRadius}" fill="url(#sleeveDiscGrad)" />
        <g fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="0.6">
          ${grooveRadii.map((r) => `<circle cx="${c}" cy="${c}" r="${r}" />`).join('\n')}
        </g>
      </g>
      <clipPath id="sleeveLabelClip"><circle cx="${c}" cy="${c}" r="${labelRadius}" /></clipPath>
      <image href="${thumbnailDataUri}" x="${c - labelRadius}" y="${c - labelRadius}"
        width="${labelSpan}" height="${labelSpan}" clip-path="url(#sleeveLabelClip)"
        preserveAspectRatio="xMidYMid slice">
        <animateTransform attributeName="transform" type="rotate"
          from="0 ${c} ${c}" to="360 ${c} ${c}" dur="${seconds}s" repeatCount="indefinite" />
      </image>
      <circle cx="${c}" cy="${c}" r="${labelRadius}" fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="1.5" />
      <circle cx="${c}" cy="${c}" r="${spindleRadius}" fill="#05070a" />
    </g>`;
}
