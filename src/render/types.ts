export interface CardData {
  title: string;
  artist: string;
  thumbnailDataUri: string;
  sourceUrl: string;
}

export interface RenderOptions {
  size: 'banner' | 'compact';
  artStyle: 'static' | 'vinyl' | 'cassette' | 'neon' | 'vinyl-cover' | 'vinyl-sleeve';
  artShape: 'circle' | 'square';
  accentColor: string;
  vinylSpeed: 'slow' | 'normal' | 'fast';
  labelSize: 'small' | 'large';
}

export interface Dimensions {
  width: number;
  height: number;
  artSize: number;
}
