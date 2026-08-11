import { NextRequest, NextResponse } from "next/server";
import {
  fetchVideoDataWithApiKey,
  fetchVideoDataWithNoembed,
  parseYouTubeUrl,
} from "@/lib/youtube";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// 10 requests per minute per IP
const LIMIT = 10;
const WINDOW_MS = 60_000;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`youtube:${ip}`, LIMIT, WINDOW_MS);

  if (rl.error) {
    return NextResponse.json(
      { error: "Serviço temporariamente indisponível." },
      { status: 503 }
    );
  }

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

  const parsed = parseYouTubeUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: "URL do YouTube inválida. Formatos aceitos: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/" },
      { status: 400 }
    );
  }

  const { videoId, canonicalUrl } = parsed;
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  try {
    if (apiKey) {
      const data = await fetchVideoDataWithApiKey(videoId, apiKey);
      return NextResponse.json(data);
    } else {
      const data = await fetchVideoDataWithNoembed(canonicalUrl, videoId);
      return NextResponse.json(data);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (process.env.NODE_ENV !== "production") {
      console.error("[youtube] error:", message);
    }

    // Try fallback if API key failed
    if (apiKey) {
      try {
        const data = await fetchVideoDataWithNoembed(canonicalUrl, videoId);
        return NextResponse.json(data);
      } catch {
        // Both failed
      }
    }

    return NextResponse.json(
      { error: "Não foi possível buscar os dados do vídeo." },
      { status: 500 }
    );
  }
}
