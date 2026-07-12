import { Dimensions, RenderOptions } from './types';
import { renderStaticArt } from './staticArt';
import { renderVinylArt } from './vinylArt';
import { renderCassetteArt } from './cassetteArt';
import { renderCdArt } from './cdArt';
import { renderNeonArt } from './neonArt';

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
      return renderCassetteArt(thumbnailDataUri, dimensions, options.vinylSpeed);
    case 'cd':
      return renderCdArt(thumbnailDataUri, dimensions, options.vinylSpeed);
    case 'neon':
      return renderNeonArt(thumbnailDataUri, dimensions, options.accentColor);
    case 'vinyl-sleeve':
      throw new Error('renderArt: vinyl-sleeve style is not implemented yet');
    case 'static':
    default:
      return renderStaticArt(thumbnailDataUri, dimensions, options.artShape);
  }
}
