import { resolveThumbnailDataUri } from '../src/thumbnail';

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

function mockFetchSequence(responses: Array<{ ok: boolean; bytes?: number[] }>) {
  let call = 0;
  global.fetch = jest.fn().mockImplementation(async () => {
    const response = responses[call++];
    return {
      ok: response.ok,
      arrayBuffer: async () => new Uint8Array(response.bytes ?? []).buffer,
    };
  }) as unknown as typeof fetch;
}

test('uses maxresdefault.jpg when it is available', async () => {
  mockFetchSequence([{ ok: true, bytes: [1, 2, 3] }]);
  const dataUri = await resolveThumbnailDataUri('4NRXx6U8ABQ');
  expect(dataUri).toBe(`data:image/jpeg;base64,${Buffer.from([1, 2, 3]).toString('base64')}`);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg');
});

test('falls back to hq720.jpg then hqdefault.jpg', async () => {
  mockFetchSequence([{ ok: false }, { ok: false }, { ok: true, bytes: [9, 9] }]);
  const dataUri = await resolveThumbnailDataUri('4NRXx6U8ABQ');
  expect(dataUri).toBe(`data:image/jpeg;base64,${Buffer.from([9, 9]).toString('base64')}`);
  expect(global.fetch).toHaveBeenCalledTimes(3);
  expect(global.fetch).toHaveBeenNthCalledWith(3, 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg');
});

test('throws when no resolution is available', async () => {
  mockFetchSequence([{ ok: false }, { ok: false }, { ok: false }]);
  await expect(resolveThumbnailDataUri('4NRXx6U8ABQ')).rejects.toThrow('No thumbnail available');
});
