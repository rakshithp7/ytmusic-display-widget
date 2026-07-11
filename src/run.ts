import * as core from '@actions/core';
import * as fs from 'fs';
import { getActionConfig } from './inputs';
import { fetchTrackMetadata } from './metadata';
import { resolveThumbnailDataUri } from './thumbnail';
import { readState, writeState, selectTrack } from './trackSelection';
import { renderCard } from './render/card';
import { commitAndPush } from './commit';

export async function run(): Promise<void> {
  try {
    const config = getActionConfig();
    const state = readState(config.statePath);
    const { track, nextState } = selectTrack(config.tracks, config.mode, state);

    const metadata = await fetchTrackMetadata(track);
    const thumbnailDataUri = await resolveThumbnailDataUri(metadata.videoId);

    const svg = renderCard(
      {
        title: metadata.title,
        artist: metadata.artist,
        thumbnailDataUri,
        sourceUrl: track,
      },
      {
        size: config.size,
        artStyle: config.artStyle,
        artShape: config.artShape,
        accentColor: config.accentColor,
        vinylSpeed: config.vinylSpeed,
        labelSize: config.labelSize,
      }
    );

    fs.writeFileSync(config.outputPath, svg, 'utf-8');
    const filesToCommit = [config.outputPath];

    if (config.mode === 'sequential') {
      writeState(config.statePath, nextState);
      filesToCommit.push(config.statePath);
    }

    await commitAndPush(filesToCommit, 'chore: update now-playing card');
    core.setOutput('track-url', track);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}
