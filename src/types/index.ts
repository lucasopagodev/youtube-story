export interface VideoInfo {
  title: string;
  channelTitle: string;
  thumbnail: string;
  channelAvatar: string | null;
  videoId: string;
}

export interface StoryConfig {
  videoInfo: VideoInfo | null;
  customMessage: string;
  accentColor: string;
}

export interface AccentColor {
  name: string;
  value: string;
}

export interface YouTubeApiResponse {
  title: string;
  channelTitle: string;
  thumbnail: string;
  channelAvatar: string | null;
  videoId: string;
  error?: string;
}
