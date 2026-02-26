"use client";

import { forwardRef, useEffect, useState } from "react";
import type { StoryConfig } from "@/types";

interface StoryPreviewProps extends StoryConfig {
  fullResolution?: boolean;
  /** When true, images are served via /api/proxy-image to avoid CORS issues on export */
  useProxy?: boolean;
  /** Show or hide the gradient accent line at the top (default: true) */
  showAccentLine?: boolean;
  onReady?: () => void;
}

const SCALE = 2.5;
const FULL_W = 1080;
const FULL_H = 1920;

function proxyUrl(url: string | null | undefined, useProxy: boolean): string | null {
  if (!url) return null;
  if (!useProxy) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

const StoryPreview = forwardRef<HTMLDivElement, StoryPreviewProps>(
  function StoryPreview(
    {
      videoInfo,
      customMessage,
      accentColor,
      fullResolution = false,
      useProxy = false,
      showAccentLine = true,
      onReady,
    },
    ref
  ) {
    const [avatarError, setAvatarError] = useState(false);
    const [thumbError, setThumbError] = useState(false);

    const scale = fullResolution ? 1 : 1 / SCALE;

    const title = videoInfo?.title || "Título do vídeo aqui";
    const channel = videoInfo?.channelTitle || "Nome do Canal";
    const thumbSrc = proxyUrl(videoInfo?.thumbnail, useProxy);
    const thumb = thumbError ? null : thumbSrc;
    const avatarSrc = proxyUrl(videoInfo?.channelAvatar, useProxy);
    const avatar = avatarError ? null : avatarSrc;
    const channelInitial = channel.charAt(0).toUpperCase();

    useEffect(() => {
      setAvatarError(false);
      setThumbError(false);
    }, [videoInfo]);

    useEffect(() => {
      if (onReady) {
        const timer = setTimeout(onReady, 600);
        return () => clearTimeout(timer);
      }
    }, [onReady]);

    const px = (v: number) => `${v * scale}px`;

    return (
      <div
        ref={ref}
        style={{
          width: px(FULL_W),
          height: px(FULL_H),
          background: "#0a0a0a",
          borderRadius: fullResolution ? 0 : px(20),
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: fullResolution ? "none" : "0 25px 60px rgba(0,0,0,0.6)",
          flexShrink: 0,
        }}
      >
        {/* Accent line top */}
        {showAccentLine && (
          <div
            style={{
              height: px(8),
              background: `linear-gradient(90deg, ${accentColor}, transparent)`,
              width: "60%",
              flexShrink: 0,
            }}
          />
        )}

        {/* Custom message */}
        <div
          style={{
            padding: `${px(350)} ${px(70)} ${px(36)}`,
            fontSize: px(38),
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.01em",
            lineHeight: 1.3,
            flexShrink: 0,
          }}
        >
          {customMessage || "Saiu vídeo novo no canal!"}
        </div>

        {/* Thumbnail */}
        <div style={{ padding: `0 ${px(70)}`, flexShrink: 0 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: px(28),
              overflow: "hidden",
              background: "#1a1a1a",
            }}
          >
            {thumb ? (
              <img
                src={thumb}
                alt="thumbnail"
                crossOrigin={useProxy ? "anonymous" : undefined}
                onError={() => setThumbError(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#333",
                  fontSize: px(28),
                }}
              >
                {videoInfo ? "Imagem indisponível" : "Thumbnail"}
              </div>
            )}
          </div>
        </div>

        {/* Avatar + title side by side */}
        <div
          style={{
            padding: `${px(44)} ${px(70)} 0`,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: px(24),
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: px(80),
              height: px(80),
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              marginTop: px(4),
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={channel}
                crossOrigin={useProxy ? "anonymous" : undefined}
                onError={() => setAvatarError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${accentColor}, #2a2a2a)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: px(32),
                  fontWeight: 700,
                }}
              >
                {channelInitial}
              </div>
            )}
          </div>

          {/* Video title */}
          <h2
            style={{
              fontSize: px(42),
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.35,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />
      </div>
    );
  }
);

export default StoryPreview;
