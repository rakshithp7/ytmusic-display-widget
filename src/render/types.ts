export interface CardData {
  title: string;
  artist: string;
  thumbnailDataUri: string;
  sourceUrl: string;
}

export interface RenderOptions {
  size: 's' | 'm' | 'l' | 'xl';
  artStyle: 'static' | 'vinyl' | 'cassette' | 'neon' | 'vinyl-sleeve';
  artShape: 'circle' | 'square';
  accentColor: string;
  waveColor: string;
  vinylSpeed: 'slow' | 'normal' | 'fast';
  labelSize: 'small' | 'large';
  background: 'blurred' | 'full';
}

export interface Dimensions {
  width: number;
  height: number;
  artSize: number;
}
