import * as core from '@actions/core';
import { RenderOptions } from './render/types';

export interface ActionConfig extends RenderOptions {
  tracks: string[];
  mode: 'random' | 'sequential';
  outputPath: string;
  statePath: string;
}

function parseTracks(raw: string): string[] {
  const tracks = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (tracks.length === 0) {
    throw new Error('The "tracks" input must contain at least one URL');
  }
  return tracks;
}

export function getActionConfig(): ActionConfig {
  return {
    tracks: parseTracks(core.getInput('tracks', { required: true })),
    mode: (core.getInput('mode') || 'random') as ActionConfig['mode'],
    size: (core.getInput('size') || 'banner') as ActionConfig['size'],
    artStyle: (core.getInput('art-style') || 'static') as ActionConfig['artStyle'],
    artShape: (core.getInput('art-shape') || 'circle') as ActionConfig['artShape'],
    accentColor: core.getInput('accent-color') || '#7dd3fc',
    vinylSpeed: (core.getInput('vinyl-speed') || 'normal') as ActionConfig['vinylSpeed'],
    labelSize: (core.getInput('label-size') || 'small') as ActionConfig['labelSize'],
    outputPath: core.getInput('output-path') || 'now-playing.svg',
    statePath: core.getInput('state-path') || '.now-playing-state.json',
  };
}
