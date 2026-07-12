import { extractVideoId, fetchTrackMetadata, cleanTitle, cleanArtist } from '../src/metadata';

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

describe('cleanTitle', () => {
  test('strips a trailing "(Official Video)" tag', () => {
    expect(cleanTitle('Adele - Rolling in the Deep (Official Music Video)')).toBe(
      'Adele - Rolling in the Deep'
    );
  });

  test('strips stacked tags one at a time', () => {
    expect(cleanTitle('Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)')).toBe(
      'Rick Astley - Never Gonna Give You Up'
    );
  });

  test('strips a mixed-word cruft bracket regardless of word order', () => {
    expect(cleanTitle('Queen – Bohemian Rhapsody (Official Video Remastered)')).toBe(
      'Queen – Bohemian Rhapsody'
    );
  });

  test('strips square-bracket cruft tags too', () => {
    expect(cleanTitle('Wiz Khalifa - See You Again [Official Video]')).toBe(
      'Wiz Khalifa - See You Again'
    );
  });

  test('leaves a title with no cruft tags unchanged', () => {
    expect(cleanTitle('Alan Walker - Faded')).toBe('Alan Walker - Faded');
  });

  test('does not strip a meaningful trailing tag like "(feat. Artist)" or "(Remix)"', () => {
    expect(cleanTitle('Song Title (feat. Someone)')).toBe('Song Title (feat. Someone)');
    expect(cleanTitle('Song Title (Remix)')).toBe('Song Title (Remix)');
    expect(cleanTitle('Song Title (Live)')).toBe('Song Title (Live)');
  });
});

describe('cleanArtist', () => {
  test('strips the "- Topic" suffix', () => {
    expect(cleanArtist('The Weeknd - Topic')).toBe('The Weeknd');
  });

  test('strips a trailing "Official" tag', () => {
    expect(cleanArtist('Queen Official')).toBe('Queen');
  });

  test('leaves an artist name with no cruft unchanged', () => {
    expect(cleanArtist('Rick Astley')).toBe('Rick Astley');
  });

  test('leaves a glued-together channel name like "TheWeekndVEVO" unchanged', () => {
    expect(cleanArtist('TheWeekndVEVO')).toBe('TheWeekndVEVO');
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
