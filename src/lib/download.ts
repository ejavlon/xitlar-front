import { Track } from "../types/track";
import { resolveAudioSrc } from "./audio-src";

/**
 * Downloads a track.
 * If the track is a real backend track (using /api/v1/musics/.../audio), it utilizes the
 * backend's download endpoint which serves the file with proper Content-Disposition.
 * If it's a mock track (external URL), it fetches the track as a blob to trigger saving
 * with a formatted filename, falling back to direct navigation if blocked by CORS.
 */
export async function downloadTrack(track: Track) {
  if (!track || !track.audioUrl) {
    alert("Audio track is not available");
    return;
  }

  // Resolve the source URL (it handles same-origin proxy or direct backend URLs)
  const src = resolveAudioSrc(track.audioUrl);

  // Check if it's a backend track
  if (src.includes("/api/v1/musics/") && src.includes("/audio")) {
    const downloadUrl = src.replace("/audio", "/download");
    
    // Trigger native browser download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // For mock tracks, download via blob fetch to control the target filename
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = blobUrl;
      const extension = track.format || "mp3";
      a.download = `${track.artist.name} - ${track.title}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Blob download failed, opening in a new tab as fallback:", err);
      window.open(src, "_blank");
    }
  }
}
