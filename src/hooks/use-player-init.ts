import { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/player-store";
import { musicService } from "../services/music.service";

/**
 * Seeds the global player with a default queue (popular tracks) on first load
 * so the player bar always shows a track. Playback is NOT started
 * automatically — browsers block autoplay and the user should opt in.
 */
export const usePlayerInit = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { currentTrack, playQueue } = usePlayerStore.getState();
    if (currentTrack) return;

    musicService
      .getPopularTracks()
      .then((tracks) => {
        // Only seed if the user has not already started playback meanwhile
        if (usePlayerStore.getState().currentTrack) return;
        playQueue(tracks, 0, false);
      })
      .catch(() => {
        // Player simply stays empty; UI already handles the no-track state
      });
  }, []);
};
