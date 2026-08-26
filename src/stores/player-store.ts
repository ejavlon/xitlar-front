import { create } from "zustand";
import { Track } from "../types/track";
import { RepeatMode, AudioQuality } from "../types/player";

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[]; // to restore order when turning off shuffle
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  quality: AudioQuality;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQuality: (quality: AudioQuality) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number, autoplay?: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}

// Helper to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isMuted: false,
  repeatMode: "off",
  isShuffled: false,
  quality: "HQ",

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        // Repeat is off or one, and we reached the end. Stop playback.
        set({ isPlaying: false, currentTime: 0 });
        return;
      }
    }

    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
      currentTime: 0
    });
  },

  previous: () => {
    const { queue, currentIndex, currentTime } = get();
    if (queue.length === 0) return;

    // Check if we should restart the current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      // Loop back to end or restart first track
      prevIndex = queue.length - 1;
    }

    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      isPlaying: true,
      currentTime: 0
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  toggleShuffle: () => {
    const { isShuffled, queue, currentTrack, originalQueue } = get();
    const nextShuffled = !isShuffled;

    if (nextShuffled) {
      // Shuffling: keep current track at the beginning, shuffle the rest
      const remainingTracks = queue.filter((t) => t.id !== currentTrack?.id);
      const shuffled = shuffleArray(remainingTracks);
      const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
      
      set({
        isShuffled: true,
        originalQueue: [...queue], // store original order
        queue: newQueue,
        currentIndex: currentTrack ? 0 : -1
      });
    } else {
      // Restoring original order
      const newIndex = originalQueue.findIndex((t) => t.id === currentTrack?.id);
      set({
        isShuffled: false,
        queue: [...originalQueue],
        currentIndex: newIndex !== -1 ? newIndex : 0
      });
    }
  },

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ["off", "one", "all"];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      return { repeatMode: modes[nextIdx] };
    }),

  setQuality: (quality) => set({ quality }),

  playTrack: (track, newQueue) => {
    const { queue, isShuffled } = get();
    
    // If a new queue is provided, use it
    const activeQueue = newQueue ? [...newQueue] : [...queue];
    
    // Ensure the track is in the queue
    let index = activeQueue.findIndex((t) => t.id === track.id);
    if (index === -1) {
      activeQueue.push(track);
      index = activeQueue.length - 1;
    }

    if (isShuffled && !newQueue) {
      // If shuffled, keep original queue as is, but set active queue
      // (Wait, usually clicking a track in shuffle mode restarts the shuffled queue sequence)
    }

    set({
      currentTrack: track,
      queue: activeQueue,
      originalQueue: newQueue ? [...newQueue] : activeQueue,
      currentIndex: index,
      isPlaying: true,
      currentTime: 0
    });
  },

  playQueue: (tracks, startIndex = 0, autoplay = true) => {
    if (tracks.length === 0) return;
    
    let activeTracks = [...tracks];
    let index = startIndex;

    const { isShuffled } = get();
    if (isShuffled) {
      const selectedTrack = activeTracks[startIndex];
      const remaining = activeTracks.filter((t) => t.id !== selectedTrack.id);
      activeTracks = [selectedTrack, ...shuffleArray(remaining)];
      index = 0;
    }

    set({
      queue: activeTracks,
      originalQueue: [...tracks],
      currentIndex: index,
      currentTrack: activeTracks[index],
      isPlaying: autoplay,
      currentTime: 0
    });
  },

  addToQueue: (track) => {
    const { queue, originalQueue } = get();
    if (queue.some((t) => t.id === track.id)) return; // already in queue

    set({
      queue: [...queue, track],
      originalQueue: [...originalQueue, track]
    });
  },

  removeFromQueue: (trackId) => {
    const { queue, originalQueue, currentIndex, currentTrack } = get();
    const newQueue = queue.filter((t) => t.id !== trackId);
    const newOrigQueue = originalQueue.filter((t) => t.id !== trackId);
    
    let newIndex = newQueue.findIndex((t) => t.id === currentTrack?.id);
    if (newIndex === -1 && newQueue.length > 0) {
      newIndex = Math.min(currentIndex, newQueue.length - 1);
    }

    set({
      queue: newQueue,
      originalQueue: newOrigQueue,
      currentIndex: newIndex,
      currentTrack: newIndex !== -1 ? newQueue[newIndex] : null,
      isPlaying: newQueue.length > 0 ? get().isPlaying : false
    });
  },

  clearQueue: () =>
    set({
      queue: [],
      originalQueue: [],
      currentIndex: -1,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    })
}));
