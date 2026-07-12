import { Dimensions, RenderOptions } from './types';

export function renderBackground(
  thumbnailDataUri: string | undefined,
  dimensions: Dimensions,
  artStyle: RenderOptions['artStyle']
): string {
  const { width, height } = dimensions;

  if (artStyle === 'minimal') {
    return `<rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#0d1117" stroke="#21262d" stroke-width="1" />`;
  }

  if (artStyle === 'neon') {
    return `<rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#08090d" />`;
  }

  if (artStyle === 'vinyl-cover') {
    return `<g clip-path="url(#cardClip)">
      <image href="${thumbnailDataUri}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgScrim)" />
    </g>`;
  }

  return `<g clip-path="url(#cardClip)">
    <image href="${thumbnailDataUri}" x="-20" y="-20" width="${width + 40}" height="${height + 40}"
      preserveAspectRatio="xMidYMid slice" filter="url(#bgBlur)" />
    <rect x="0" y="0" width="${width}" height="${height}" fill="#000" opacity="0.45" />
  </g>`;
}
