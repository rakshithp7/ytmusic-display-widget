// __tests__/trackSelection.test.ts
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readState, writeState, selectTrack } from '../src/trackSelection';

describe('readState / writeState', () => {
  let statePath: string;

  beforeEach(() => {
    statePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'state-')), 'state.json');
  });

  test('readState returns lastIndex -1 when the file does not exist', () => {
    expect(readState(statePath)).toEqual({ lastIndex: -1 });
  });

  test('writeState then readState round-trips the value', () => {
    writeState(statePath, { lastIndex: 2 });
    expect(readState(statePath)).toEqual({ lastIndex: 2 });
  });
});

describe('selectTrack', () => {
  test('sequential mode advances and wraps around', () => {
    const tracks = ['a', 'b', 'c'];
    let state = { lastIndex: -1 };

    let result = selectTrack(tracks, 'sequential', state);
    expect(result.track).toBe('a');
    state = result.nextState;

    result = selectTrack(tracks, 'sequential', state);
    expect(result.track).toBe('b');
    state = result.nextState;

    result = selectTrack(tracks, 'sequential', state);
    expect(result.track).toBe('c');
    state = result.nextState;

    result = selectTrack(tracks, 'sequential', state);
    expect(result.track).toBe('a');
  });

  test('random mode returns a track from the list', () => {
    const tracks = ['a', 'b', 'c'];
    const result = selectTrack(tracks, 'random', { lastIndex: -1 });
    expect(tracks).toContain(result.track);
  });

  test('throws when the track list is empty', () => {
    expect(() => selectTrack([], 'random', { lastIndex: -1 })).toThrow('No tracks configured');
  });
});
