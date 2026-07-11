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

export async function fetchTrackMetadata(url: string): Promise<TrackMetadata> {
  const videoId = extractVideoId(url);
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(oembedUrl);
  if (!response.ok) {
    throw new Error(`oEmbed request failed for ${url}: ${response.status}`);
  }
  const data = (await response.json()) as OEmbedResponse;
  const artist = data.author_name.replace(/\s*-\s*Topic$/, '');
  return { videoId, title: data.title, artist };
}
