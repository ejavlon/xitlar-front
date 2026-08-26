/**
 * Formats a duration in seconds to a string (e.g. 3:45 or 1:12:30).
 */
export const formatDuration = (seconds: number, padMinutes: boolean = false): string => {
  if (isNaN(seconds) || seconds < 0) return padMinutes ? "00:00" : "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedSecs = secs < 10 ? `0${secs}` : secs;
  const formattedMins = padMinutes && mins < 10 ? `0${mins}` : mins;

  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : mins;
    return `${hrs}:${paddedMins}:${formattedSecs}`;
  }

  return `${formattedMins}:${formattedSecs}`;
};

/**
 * Formats large numbers into readable text (e.g., 1.2M, 45K).
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

/**
 * Formats a date string to a localized string (e.g., Oct 28, 2002).
 */
export const formatReleaseDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formats bitrate values (e.g., 320 kbps).
 */
export const formatBitrate = (bitrate?: number): string => {
  if (!bitrate) return "";
  return `${bitrate} kbps`;
};

/**
 * Formats sample rate values (e.g., 44.1 kHz).
 */
export const formatSampleRate = (sampleRate?: number): string => {
  if (!sampleRate) return "";
  return `${(sampleRate / 1000).toFixed(1)} kHz`;
};
