// __tests__/run.test.ts
import * as core from '@actions/core';
import { run } from '../src/run';
import { getActionConfig } from '../src/inputs';
import { fetchTrackMetadata } from '../src/metadata';
import { resolveThumbnailDataUri } from '../src/thumbnail';
import { readState, selectTrack, writeState } from '../src/trackSelection';
import { renderCard } from '../src/render/card';
import { commitAndPush } from '../src/commit';

jest.mock('@actions/core');
jest.mock('../src/inputs');
jest.mock('../src/metadata');
jest.mock('../src/thumbnail');
jest.mock('../src/trackSelection');
jest.mock('../src/render/card');
jest.mock('../src/commit');
jest.mock('fs');

const fs = require('fs');

const baseConfig = {
  tracks: ['https://music.youtube.com/watch?v=4NRXx6U8ABQ'],
  mode: 'random' as const,
  size: 'banner' as const,
  artStyle: 'static' as const,
  artShape: 'circle' as const,
  accentColor: '#7dd3fc',
  vinylSpeed: 'normal' as const,
  labelSize: 'small' as const,
  outputPath: 'now-playing.svg',
  statePath: '.now-playing-state.json',
};

beforeEach(() => {
  jest.clearAllMocks();
  (getActionConfig as jest.Mock).mockReturnValue(baseConfig);
  (readState as jest.Mock).mockReturnValue({ lastIndex: -1 });
  (selectTrack as jest.Mock).mockReturnValue({
    track: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
    nextState: { lastIndex: 0 },
  });
  (fetchTrackMetadata as jest.Mock).mockResolvedValue({
    videoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
  });
  (resolveThumbnailDataUri as jest.Mock).mockResolvedValue('data:image/jpeg;base64,AAAA');
  (renderCard as jest.Mock).mockReturnValue('<svg></svg>');
});

test('writes the rendered SVG and commits it', async () => {
  await run();
  expect(fs.writeFileSync).toHaveBeenCalledWith('now-playing.svg', '<svg></svg>', 'utf-8');
  expect(commitAndPush).toHaveBeenCalledWith(['now-playing.svg'], expect.any(String));
});

test('also commits the state file in sequential mode', async () => {
  (getActionConfig as jest.Mock).mockReturnValue({ ...baseConfig, mode: 'sequential' });
  await run();
  expect(writeState).toHaveBeenCalledWith('.now-playing-state.json', { lastIndex: 0 });
  expect(commitAndPush).toHaveBeenCalledWith(
    ['now-playing.svg', '.now-playing-state.json'],
    expect.any(String)
  );
});

test('does not write state file in random mode', async () => {
  await run();
  expect(writeState).not.toHaveBeenCalled();
});

test('reports failure via core.setFailed when a step throws', async () => {
  (fetchTrackMetadata as jest.Mock).mockRejectedValue(new Error('oEmbed down'));
  await run();
  expect(core.setFailed).toHaveBeenCalledWith('oEmbed down');
  expect(commitAndPush).not.toHaveBeenCalled();
});
