import { Dimensions } from './types';

export function getDimensions(size: 'banner' | 'compact'): Dimensions {
  if (size === 'banner') {
    return { width: 600, height: 120, artSize: 88 };
  }
  return { width: 300, height: 80, artSize: 56 };
}
