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
  expect(config.size).toBe('banner');
  expect(config.artStyle).toBe('static');
  expect(config.artShape).toBe('circle');
  expect(config.accentColor).toBe('#7dd3fc');
  expect(config.vinylSpeed).toBe('normal');
  expect(config.labelSize).toBe('small');
  expect(config.outputPath).toBe('now-playing.svg');
  expect(config.statePath).toBe('.now-playing-state.json');
});

test('honors explicit overrides', () => {
  mockInputs({
    tracks: 'https://a',
    mode: 'sequential',
    size: 'compact',
    'art-style': 'vinyl',
    'vinyl-speed': 'fast',
    'label-size': 'large',
    'output-path': 'card.svg',
  });
  const config = getActionConfig();
  expect(config.mode).toBe('sequential');
  expect(config.size).toBe('compact');
  expect(config.artStyle).toBe('vinyl');
  expect(config.vinylSpeed).toBe('fast');
  expect(config.labelSize).toBe('large');
  expect(config.outputPath).toBe('card.svg');
});

test('throws when tracks input is blank', () => {
  mockInputs({ tracks: '   \n  ' });
  expect(() => getActionConfig()).toThrow('at least one URL');
});
