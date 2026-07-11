const RESOLUTIONS = ['maxresdefault', 'hq720', 'hqdefault'] as const;

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function resolveThumbnailDataUri(videoId: string): Promise<string> {
  for (const resolution of RESOLUTIONS) {
    const url = `https://i.ytimg.com/vi/${videoId}/${resolution}.jpg`;
    const buffer = await fetchImageBuffer(url);
    if (buffer) {
      return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }
  }
  throw new Error(`No thumbnail available for video ${videoId}`);
}
