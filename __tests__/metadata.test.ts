import { extractVideoId, fetchTrackMetadata } from '../src/metadata';

describe('extractVideoId', () => {
  test('extracts the ID from a youtube.com URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=4NRXx6U8ABQ')).toBe('4NRXx6U8ABQ');
  });

  test('extracts the ID from a music.youtube.com URL', () => {
    expect(extractVideoId('https://music.youtube.com/watch?v=4NRXx6U8ABQ&si=abc')).toBe('4NRXx6U8ABQ');
  });

  test('throws when no video ID is present', () => {
    expect(() => extractVideoId('https://example.com/not-youtube')).toThrow(
      'Could not extract a YouTube video ID'
    );
  });
});

describe('fetchTrackMetadata', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('strips the "- Topic" suffix from the artist name', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Blinding Lights', author_name: 'The Weeknd - Topic' }),
    }) as unknown as typeof fetch;

    const metadata = await fetchTrackMetadata('https://music.youtube.com/watch?v=4NRXx6U8ABQ');
    expect(metadata).toEqual({
      videoId: '4NRXx6U8ABQ',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
    });
  });

  test('leaves an artist name without the suffix unchanged', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Some Song', author_name: 'TheWeekndVEVO' }),
    }) as unknown as typeof fetch;

    const metadata = await fetchTrackMetadata('https://www.youtube.com/watch?v=4NRXx6U8ABQ');
    expect(metadata.artist).toBe('TheWeekndVEVO');
  });

  test('throws when the oEmbed request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(
      fetchTrackMetadata('https://www.youtube.com/watch?v=4NRXx6U8ABQ')
    ).rejects.toThrow('oEmbed request failed');
  });
});
