// Manual mock for the Node "fs" core module.
//
// Jest's automatic automock (triggered by a bare `jest.mock('fs')` in a test
// file) does not preserve the `fs.promises` getter. `@actions/core`'s
// `summary.ts` destructures `fs.promises` at module load time, so any test
// that auto-mocks both `fs` and `@actions/core` in the same file crashes with
// "Cannot destructure property 'access' of 'fs_1.promises' as it is
// undefined" before any test code runs.
//
// This manual mock keeps the real `fs` module intact (including the real
// `promises` object) and only replaces `writeFileSync` with a jest mock, since
// that's the only function `__tests__/run.test.ts` needs to observe.
const actualFs = jest.requireActual('fs');

module.exports = {
  ...actualFs,
  writeFileSync: jest.fn(),
};
