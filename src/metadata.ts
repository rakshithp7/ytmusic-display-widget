export interface TrackMetadata {
  videoId: string;
  title: string;
  artist: string;
}

interface OEmbedResponse {
  title: string;
  author_name: string;
}

export function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/);
  if (!match) {
    throw new Error(`Could not extract a YouTube video ID from URL: ${url}`);
  }
  return match[1];
}

const CRUFT_WORDS = new Set([
  'official',
  'video',
  'audio',
  'music',
  'lyric',
  'lyrics',
  'visualizer',
  'remaster',
  'remastered',
  '4k',
  'hd',
  'hq',
]);

function isCruftBracket(content: string): boolean {
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => CRUFT_WORDS.has(word));
}

export function cleanTitle(rawTitle: string): string {
  let title = rawTitle.trim();
  let match = title.match(/[([]([^()[\]]*)[)\]]\s*$/);
  while (match && isCruftBracket(match[1])) {
    title = title.slice(0, match.index).trim();
    match = title.match(/[([]([^()[\]]*)[)\]]\s*$/);
  }
  return title;
}

export async function fetchTrackMetadata(url: string): Promise<TrackMetadata> {
  const videoId = extractVideoId(url);
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(oembedUrl);
  if (!response.ok) {
    throw new Error(`oEmbed request failed for ${url}: ${response.status}`);
  }
  const data = (await response.json()) as OEmbedResponse;
  const artist = data.author_name.replace(/\s*-\s*Topic$/, '');
  return { videoId, title: cleanTitle(data.title), artist };
}
