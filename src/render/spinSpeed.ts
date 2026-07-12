import { RenderOptions } from './types';

export const SPEED_SECONDS: Record<RenderOptions['vinylSpeed'], number> = {
  slow: 10,
  normal: 6,
  fast: 2.5,
};

export function getSpinSeconds(speed: RenderOptions['vinylSpeed']): number {
  return SPEED_SECONDS[speed];
}
