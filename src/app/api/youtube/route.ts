import { NextRequest, NextResponse } from "next/server";
import {
  extractVideoId,
  fetchVideoDataWithApiKey,
  fetchVideoDataWithNoembed,
} from "@/lib/youtube";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// 10 requests per minute per IP
const LIMIT = 10;
const WINDOW_MS = 60_000;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`youtube:${ip}`, LIMIT, WINDOW_MS);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas requisições. Tente novamente em ${rl.retryAfter}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfter) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "URL do YouTube inválida. Formatos aceitos: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/" },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  console.log(`[youtube] videoId=${videoId} apiKey=${apiKey ? "set ✓" : "not set — using noembed fallback"}`);

  try {
    if (apiKey) {
      const data = await fetchVideoDataWithApiKey(videoId, apiKey);
      console.log(`[youtube] channelAvatar=${data.channelAvatar ?? "null (not returned by API)"}`);
      return NextResponse.json(data);
    } else {
      const data = await fetchVideoDataWithNoembed(url, videoId);
      return NextResponse.json(data);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[youtube] error:", message);

    // Try fallback if API key failed
    if (apiKey) {
      try {
        const data = await fetchVideoDataWithNoembed(url, videoId);
        return NextResponse.json(data);
      } catch {
        // Both failed
      }
    }

    return NextResponse.json(
      { error: `Não foi possível buscar os dados do vídeo: ${message}` },
      { status: 500 }
    );
  }
}
