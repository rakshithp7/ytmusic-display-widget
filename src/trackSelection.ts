// src/trackSelection.ts
import * as fs from 'fs';

export interface SelectionState {
  lastIndex: number;
}

export function readState(statePath: string): SelectionState {
  if (!fs.existsSync(statePath)) {
    return { lastIndex: -1 };
  }
  return JSON.parse(fs.readFileSync(statePath, 'utf-8')) as SelectionState;
}

export function writeState(statePath: string, state: SelectionState): void {
  fs.writeFileSync(statePath, JSON.stringify(state), 'utf-8');
}

export function selectTrack(
  tracks: string[],
  mode: 'random' | 'sequential',
  state: SelectionState
): { track: string; nextState: SelectionState } {
  if (tracks.length === 0) {
    throw new Error('No tracks configured');
  }
  if (mode === 'random') {
    const index = Math.floor(Math.random() * tracks.length);
    return { track: tracks[index], nextState: { lastIndex: index } };
  }
  const nextIndex = (state.lastIndex + 1) % tracks.length;
  return { track: tracks[nextIndex], nextState: { lastIndex: nextIndex } };
}
