import * as core from '@actions/core';
import { getActionConfig } from '../src/inputs';

jest.mock('@actions/core');

function mockInputs(values: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((name: string) => values[name] ?? '');
}

afterEach(() => jest.clearAllMocks());

test('parses multiple tracks from newline-separated input', () => {
  mockInputs({ tracks: 'https://a\nhttps://b\n' });
  const config = getActionConfig();
  expect(config.tracks).toEqual(['https://a', 'https://b']);
});

test('applies defaults when optional inputs are omitted', () => {
  mockInputs({ tracks: 'https://a' });
  const config = getActionConfig();
  expect(config.mode).toBe('random');
  expect(config.size).toBe('l');
  expect(config.artStyle).toBe('static');
  expect(config.artShape).toBe('circle');
  expect(config.accentColor).toBe('#7dd3fc');
  expect(config.waveColor).toBe('#7dd3fc');
  expect(config.vinylSpeed).toBe('normal');
  expect(config.labelSize).toBe('small');
  expect(config.background).toBe('blurred');
  expect(config.outputPath).toBe('now-playing.svg');
  expect(config.statePath).toBe('.now-playing-state.json');
});

test('honors explicit overrides', () => {
  mockInputs({
    tracks: 'https://a',
    mode: 'sequential',
    size: 'm',
    'art-style': 'vinyl',
    'vinyl-speed': 'fast',
    'label-size': 'large',
    background: 'full',
    'output-path': 'card.svg',
  });
  const config = getActionConfig();
  expect(config.mode).toBe('sequential');
  expect(config.size).toBe('m');
  expect(config.artStyle).toBe('vinyl');
  expect(config.vinylSpeed).toBe('fast');
  expect(config.labelSize).toBe('large');
  expect(config.background).toBe('full');
  expect(config.outputPath).toBe('card.svg');
});

test('wave-color defaults to accent-color when omitted', () => {
  mockInputs({ tracks: 'https://a', 'accent-color': '#ff2ea6' });
  const config = getActionConfig();
  expect(config.accentColor).toBe('#ff2ea6');
  expect(config.waveColor).toBe('#ff2ea6');
});

test('wave-color can be set independently of accent-color', () => {
  mockInputs({ tracks: 'https://a', 'accent-color': '#ff2ea6', 'wave-color': '#22d3ee' });
  const config = getActionConfig();
  expect(config.accentColor).toBe('#ff2ea6');
  expect(config.waveColor).toBe('#22d3ee');
});

test('throws when tracks input is blank', () => {
  mockInputs({ tracks: '   \n  ' });
  expect(() => getActionConfig()).toThrow('at least one URL');
});
