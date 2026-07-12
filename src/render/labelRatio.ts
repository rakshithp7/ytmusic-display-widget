import { RenderOptions } from './types';

export const LABEL_RATIO: Record<RenderOptions['labelSize'], number> = {
  small: 0.62,
  large: 0.78,
};

export function getLabelRatio(labelSize: RenderOptions['labelSize']): number {
  return LABEL_RATIO[labelSize];
}
