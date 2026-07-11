import * as exec from '@actions/exec';

export async function commitAndPush(files: string[], message: string): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
  await exec.exec('git', ['add', ...files]);

  const diffExitCode = await exec.exec('git', ['diff', '--cached', '--quiet'], {
    ignoreReturnCode: true,
  });
  if (diffExitCode === 0) {
    return;
  }

  await exec.exec('git', ['commit', '-m', message]);
  await exec.exec('git', ['push']);
}
