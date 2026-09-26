export interface ParsedTrackInfo {
  title: string;
  artist: string;
}

/**
 * Checks if a string contains known website, channel or bot advertisements
 */
export function isAdvertisement(str: string): boolean {
  if (!str) return true;
  const lower = str.toLowerCase();
  return (
    lower.includes("t.me/") ||
    lower.includes("@") ||
    lower.includes(".net") ||
    lower.includes(".uz") ||
    lower.includes(".ru") ||
    lower.includes(".com") ||
    lower.includes("www.") ||
    lower.includes("http")
  );
}

/**
 * Cleans advertisement strings, site prefixes, bracketed tags, and excessive spaces.
 */
export function cleanTitleString(str: string): string {
  if (!str) return "";
  let clean = str;
  clean = clean.replace(/\[[^\]]*\]/g, " ");
  clean = clean.replace(/\([^)]*(?:telegram|@|www|\.uz|\.ru|\.net|\.com)[^)]*\)/gi, " ");
  clean = clean.replace(/@\S+/g, " ");
  clean = clean.replace(/https?:\/\/\S+/g, " ");
  clean = clean.replace(/www\.\S+/g, " ");
  clean = clean.replace(/^\d{1,3}[\.\s\-_]+/, " ");
  clean = clean.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
  return clean;
}

/**
 * Parses an audio file name into separated Artist and Title.
 * Examples:
 *  - "01. Ozodbek Nazarbekov - Meni kuchliroq sev [xitlar.net].mp3" -> { artist: "Ozodbek Nazarbekov", title: "Meni kuchliroq sev" }
 *  - "Rayhon – Aldamagin.mp3" -> { artist: "Rayhon", title: "Aldamagin" }
 *  - "Track01.mp3" -> { artist: "", title: "Track01" }
 */
export function parseAudioFilename(fileName: string): ParsedTrackInfo {
  if (!fileName) {
    return { title: "Untitled", artist: "" };
  }

  // Strip extension
  let clean = fileName.replace(/\.[^/.]+$/, "");

  // Remove ads and tags
  clean = clean.replace(/\[[^\]]*\]/g, " ");
  clean = clean.replace(/\([^)]*(?:telegram|@|www|\.uz|\.ru|\.net|\.com)[^)]*\)/gi, " ");
  clean = clean.replace(/@\S+/g, " ");
  clean = clean.replace(/https?:\/\/\S+/g, " ");
  clean = clean.replace(/www\.\S+/g, " ");

  // Strip leading track numbers (e.g. "01. ", "02 - ")
  clean = clean.replace(/^\d{1,3}[\.\s\-_]+/, " ");

  // Normalize delimiters & spaces
  clean = clean.replace(/_+/g, " ").replace(/\s+/g, " ").trim();

  // Pattern: "Artist - Title" or "Artist – Title" or "Artist — Title"
  const separatorMatch = clean.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (separatorMatch) {
    const rawArtist = separatorMatch[1].trim();
    const rawTitle = separatorMatch[2].trim();
    return {
      artist: isAdvertisement(rawArtist) ? "" : rawArtist,
      title: rawTitle || clean || "Untitled"
    };
  }

  return {
    artist: "",
    title: clean || "Untitled"
  };
}
