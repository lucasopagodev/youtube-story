import type { VideoInfo } from "@/types";

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchVideoDataWithApiKey(
  videoId: string,
  apiKey: string
): Promise<VideoInfo> {
  // Fetch video details
  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  );
  if (!videoRes.ok) throw new Error("YouTube API request failed");

  const videoData = await videoRes.json();
  const item = videoData.items?.[0];
  if (!item) throw new Error("Video not found");

  const snippet = item.snippet;
  const channelId = snippet.channelId;

  // Best quality thumbnail available
  const thumbnail =
    snippet.thumbnails?.maxres?.url ||
    snippet.thumbnails?.standard?.url ||
    snippet.thumbnails?.high?.url ||
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Fetch channel avatar
  let channelAvatar: string | null = null;
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();
    if (!channelRes.ok) {
      console.error("[youtube] channels API error:", channelData);
    } else {
      const channelItem = channelData.items?.[0];
      channelAvatar =
        channelItem?.snippet?.thumbnails?.medium?.url ||
        channelItem?.snippet?.thumbnails?.default?.url ||
        null;
    }
  } catch (err) {
    console.error("[youtube] failed to fetch channel avatar:", err);
  }

  return {
    title: snippet.title,
    channelTitle: snippet.channelTitle,
    thumbnail,
    channelAvatar,
    videoId,
  };
}

export async function fetchVideoDataWithNoembed(
  url: string,
  videoId: string
): Promise<VideoInfo> {
  const res = await fetch(
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) throw new Error("noembed request failed");

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return {
    title: data.title || "Título não encontrado",
    channelTitle: data.author_name || "Canal",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    channelAvatar: null,
    videoId,
  };
}
