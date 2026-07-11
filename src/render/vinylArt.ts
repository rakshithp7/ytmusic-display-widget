import { Dimensions, RenderOptions } from './types';

const SPEED_SECONDS: Record<RenderOptions['vinylSpeed'], number> = {
  slow: 10,
  normal: 6,
  fast: 2.5,
};

const LABEL_RATIO: Record<RenderOptions['labelSize'], number> = {
  small: 0.62,
  large: 0.78,
};

export function renderVinylArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  vinylSpeed: RenderOptions['vinylSpeed'],
  labelSize: RenderOptions['labelSize']
): string {
  const { artSize } = dimensions;
  const c = artSize / 2;
  const discRadius = c - 1;
  const labelRadius = discRadius * LABEL_RATIO[labelSize];
  const labelSpan = labelRadius * 2;
  const spindleRadius = discRadius * 0.05;
  const seconds = SPEED_SECONDS[vinylSpeed];
  const grooveRadii = [0.93, 0.86, 0.79, 0.72, 0.65, 0.58]
    .map((ratio) => discRadius * ratio)
    .filter((r) => r > labelRadius + 2);

  return `<clipPath id="discClip"><circle cx="${c}" cy="${c}" r="${discRadius}" /></clipPath>
    <radialGradient id="discGradient" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#2c2c2c" />
      <stop offset="100%" stop-color="#040404" />
    </radialGradient>
    <g clip-path="url(#discClip)">
      <circle cx="${c}" cy="${c}" r="${discRadius}" fill="url(#discGradient)" />
      <g fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="0.6">
        ${grooveRadii.map((r) => `<circle cx="${c}" cy="${c}" r="${r}" />`).join('\n')}
      </g>
    </g>
    <clipPath id="labelClip"><circle cx="${c}" cy="${c}" r="${labelRadius}" /></clipPath>
    <image href="${thumbnailDataUri}" x="${c - labelRadius}" y="${c - labelRadius}"
      width="${labelSpan}" height="${labelSpan}" clip-path="url(#labelClip)"
      preserveAspectRatio="xMidYMid slice">
      <animateTransform attributeName="transform" type="rotate"
        from="0 ${c} ${c}" to="360 ${c} ${c}" dur="${seconds}s" repeatCount="indefinite" />
    </image>
    <circle cx="${c}" cy="${c}" r="${labelRadius}" fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="1.5" />
    <circle cx="${c}" cy="${c}" r="${spindleRadius}" fill="#05070a" />`;
}
