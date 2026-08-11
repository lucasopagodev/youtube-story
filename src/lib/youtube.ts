import type { VideoInfo } from "@/types";

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

export interface ParsedYouTubeUrl {
  videoId: string;
  canonicalUrl: string;
}

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else {
      const [kind, id] = parsed.pathname.split("/").filter(Boolean);
      if (kind === "shorts" || kind === "embed") {
        videoId = id ?? null;
      }
    }
  }

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function extractVideoId(url: string): string | null {
  return parseYouTubeUrl(url)?.videoId ?? null;
}

export async function fetchVideoDataWithApiKey(
  videoId: string,
  apiKey: string
): Promise<VideoInfo> {
  const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videoUrl.search = new URLSearchParams({
    part: "snippet",
    id: videoId,
    key: apiKey,
  }).toString();

  // Fetch video details
  const videoRes = await fetch(videoUrl);
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
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.search = new URLSearchParams({
      part: "snippet",
      id: channelId,
      key: apiKey,
    }).toString();

    const channelRes = await fetch(channelUrl);
    const channelData = await channelRes.json();
    if (!channelRes.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[youtube] channels API error:", channelData);
      }
    } else {
      const channelItem = channelData.items?.[0];
      channelAvatar =
        channelItem?.snippet?.thumbnails?.medium?.url ||
        channelItem?.snippet?.thumbnails?.default?.url ||
        null;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[youtube] failed to fetch channel avatar:", err);
    }
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
