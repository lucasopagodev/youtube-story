import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// 30 requests per minute per IP (up to ~10 exports, each uses 2-3 images)
const LIMIT = 30;
const WINDOW_MS = 60_000;

// Proxies external images (YouTube thumbnails, channel avatars) to avoid
// CORS restrictions that would taint the canvas used by html-to-image.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`proxy-image:${ip}`, LIMIT, WINDOW_MS);

  if (!rl.allowed) {
    return new NextResponse(
      `Too many requests. Retry in ${rl.retryAfter}s.`,
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfter) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Only allow known YouTube image domains
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  const allowedHosts = [
    "img.youtube.com",
    "i.ytimg.com",
    "yt3.ggpht.com",
    "yt3.googleusercontent.com",
  ];

  if (!allowedHosts.includes(parsed.hostname)) {
    return new NextResponse("Domain not allowed", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
