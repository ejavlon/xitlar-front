import { NextRequest } from "next/server";

/**
 * Same-origin audio proxy for mock playback.
 *
 * Mock audio is hosted on third-party domains that do not send CORS headers.
 * Routing it through this proxy keeps the media element untainted, which is
 * required for the Web Audio API equalizer to process the output. Range
 * requests are passed through so seeking remains supported.
 *
 * When the Spring Boot backend serves audio with proper CORS headers,
 * disable the proxy via NEXT_PUBLIC_USE_AUDIO_PROXY=false.
 */

const ALLOWED_HOSTS = new Set(["soundhelix.com", "www.soundhelix.com"]);

const PASSTHROUGH_HEADERS = ["content-type", "content-length", "content-range"] as const;

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return new Response("Invalid 'url' query parameter", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const range = request.headers.get("range");

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: range ? { Range: range } : undefined,
      cache: "no-store"
    });
  } catch {
    return new Response("Failed to fetch audio source", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Audio source unavailable", { status: 502 });
  }

  const headers = new Headers();
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");

  return new Response(upstream.body, {
    status: upstream.status,
    headers
  });
}
