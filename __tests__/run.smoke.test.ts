import { run } from '../src/run';

test('run() resolves without throwing', async () => {
  await expect(run()).resolves.toBeUndefined();
});
