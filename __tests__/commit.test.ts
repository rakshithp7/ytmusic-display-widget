// __tests__/commit.test.ts
import * as exec from '@actions/exec';
import { commitAndPush } from '../src/commit';

jest.mock('@actions/exec');

afterEach(() => jest.clearAllMocks());

test('commits and pushes when there are staged changes', async () => {
  (exec.exec as jest.Mock).mockImplementation(async (_cmd: string, args?: string[]) => {
    if (args?.[0] === 'diff') return 1;
    return 0;
  });
  await commitAndPush(['now-playing.svg'], 'chore: update now-playing card');
  expect(exec.exec).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update now-playing card']);
  expect(exec.exec).toHaveBeenCalledWith('git', ['push']);
});

test('skips commit and push when there is nothing staged', async () => {
  (exec.exec as jest.Mock).mockImplementation(async (_cmd: string, args?: string[]) => {
    if (args?.[0] === 'diff') return 0;
    return 0;
  });
  await commitAndPush(['now-playing.svg'], 'chore: update now-playing card');
  expect(exec.exec).not.toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update now-playing card']);
  expect(exec.exec).not.toHaveBeenCalledWith('git', ['push']);
});
