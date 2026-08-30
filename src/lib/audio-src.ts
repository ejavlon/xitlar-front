import { buildMediaUrl } from "./api/client";

/**
 * Resolves a track's audioUrl into a playable URL.
 *
 * Mock audio lives on third-party hosts without CORS headers, so it is routed
 * through the same-origin /api/audio proxy to keep the media element
 * untainted — a requirement for the Web Audio API equalizer to work.
 *
 * Once the backend serves audio with proper CORS headers, set
 * NEXT_PUBLIC_USE_AUDIO_PROXY=false to use direct URLs again.
 */
export function resolveAudioSrc(audioUrl: string): string {
  if (!audioUrl) return "";

  // If the audio URL is a relative backend endpoint, starts with /api/v1, or contains /api/v1/ (like absolute backend URLs),
  // resolve it using our dynamic API base URL.
  if (audioUrl.startsWith("/api/v1") || audioUrl.includes("/api/v1/") || !/^https?:\/\//i.test(audioUrl)) {
    return buildMediaUrl(audioUrl);
  }

  const USE_AUDIO_PROXY = process.env.NEXT_PUBLIC_USE_AUDIO_PROXY !== "false";
  if (!USE_AUDIO_PROXY || !/^https?:\/\//i.test(audioUrl)) {
    return audioUrl;
  }
  
  return `/api/audio?url=${encodeURIComponent(audioUrl)}`;
}

