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
const USE_AUDIO_PROXY = process.env.NEXT_PUBLIC_USE_AUDIO_PROXY !== "false";

export function resolveAudioSrc(audioUrl: string): string {
  if (!USE_AUDIO_PROXY || !audioUrl || !/^https?:\/\//i.test(audioUrl)) {
    return audioUrl;
  }
  return `/api/audio?url=${encodeURIComponent(audioUrl)}`;
}
