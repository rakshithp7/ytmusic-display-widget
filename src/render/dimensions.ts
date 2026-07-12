import { Dimensions } from './types';

export function getDimensions(size: 's' | 'm' | 'l' | 'xl'): Dimensions {
  switch (size) {
    case 's':
      return { width: 260, height: 68, artSize: 46 };
    case 'm':
      return { width: 300, height: 80, artSize: 56 };
    case 'l':
      return { width: 600, height: 120, artSize: 88 };
    case 'xl':
      return { width: 760, height: 150, artSize: 112 };
  }
}
