import { Dimensions, RenderOptions } from './types';
import { renderStaticArt } from './staticArt';
import { renderVinylArt } from './vinylArt';

export function renderArt(
  thumbnailDataUri: string,
  dimensions: Dimensions,
  options: RenderOptions
): string {
  switch (options.artStyle) {
    case 'vinyl':
    case 'vinyl-cover':
      return renderVinylArt(thumbnailDataUri, dimensions, options.vinylSpeed, options.labelSize);
    case 'cassette':
      throw new Error('renderArt: cassette style is not implemented yet');
    case 'cd':
      throw new Error('renderArt: cd style is not implemented yet');
    case 'neon':
      throw new Error('renderArt: neon style is not implemented yet');
    case 'vinyl-sleeve':
      throw new Error('renderArt: vinyl-sleeve style is not implemented yet');
    case 'static':
    default:
      return renderStaticArt(thumbnailDataUri, dimensions, options.artShape);
  }
}
