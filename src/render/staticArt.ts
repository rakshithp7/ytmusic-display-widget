import { Dimensions, RenderOptions } from './types';

export function renderStaticArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  artShape: RenderOptions['artShape']
): string {
  const { artSize } = dimensions;
  const c = artSize / 2;

  if (artShape === 'square') {
    return `<image href="${thumbnailDataUri}" x="0" y="0" width="${artSize}" height="${artSize}"
        preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 12)" />`;
  }

  return `<clipPath id="artClip"><circle cx="${c}" cy="${c}" r="${c}" /></clipPath>
    <circle cx="${c}" cy="${c}" r="${c}" fill="#000" />
    <image href="${thumbnailDataUri}" x="0" y="0" width="${artSize}" height="${artSize}"
      clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice" />`;
}
