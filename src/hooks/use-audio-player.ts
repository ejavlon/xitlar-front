import { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/player-store";
import { useEqualizerStore } from "../stores/equalizer-store";
import { EQUALIZER_FREQUENCIES } from "../types/equalizer";
import { resolveAudioSrc } from "../lib/audio-src";

// Global audio singleton in the client
let audio: HTMLAudioElement | null = null;

// Tracks which track URL is currently loaded to avoid redundant reloads
let loadedUrl: string | null = null;

// Web Audio API nodes — audio is routed through the same-origin /api/audio
// proxy, so the media element is never tainted and EQ processing works.
let audioContext: AudioContext | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let filters: BiquadFilterNode[] = [];
let preampGainNode: GainNode | null = null;
let isAudioContextInitialized = false;

if (typeof window !== "undefined") {
  audio = new Audio();
}

/**
 * Web Audio API equalizer processing.
 *
 * Audio sources are resolved via resolveAudioSrc() (same-origin proxy in mock
 * mode), which keeps the element CORS-clean so createMediaElementSource does
 * not silence playback. When the backend serves audio directly with proper
 * CORS headers, the proxy can be disabled without changes here.
 */
const ENABLE_WEB_AUDIO = true;

const setupWebAudio = () => {
  if (!ENABLE_WEB_AUDIO) return;
  if (isAudioContextInitialized || !audio || typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    audioContext = new AudioCtx();
    sourceNode = audioContext.createMediaElementSource(audio);
    preampGainNode = audioContext.createGain();

    filters = EQUALIZER_FREQUENCIES.map((freq, index) => {
      const filter = audioContext!.createBiquadFilter();
      if (index === 0) {
        filter.type = "lowshelf";
      } else if (index === EQUALIZER_FREQUENCIES.length - 1) {
        filter.type = "highshelf";
      } else {
        filter.type = "peaking";
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Chain: source -> preamp -> filter0 -> ... -> filter9 -> destination
    sourceNode.connect(preampGainNode);
    let prevNode: AudioNode = preampGainNode;
    for (const filter of filters) {
      prevNode.connect(filter);
      prevNode = filter;
    }
    prevNode.connect(audioContext.destination);

    isAudioContextInitialized = true;
    applyEqualizerSettings();
  } catch (err) {
    console.warn("Web Audio API equalizer setup failed:", err);
  }
};

/**
 * Pushes the current equalizer store values onto the Web Audio graph.
 * Uses setTargetAtTime for click-free transitions between presets.
 */
const applyEqualizerSettings = () => {
  if (!isAudioContextInitialized || !audioContext) return;

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  const { isEnabled, bands, preamp } = useEqualizerStore.getState();
  const now = audioContext.currentTime;

  if (preampGainNode) {
    const linearGain = isEnabled ? Math.pow(10, preamp / 20) : 1.0;
    preampGainNode.gain.setTargetAtTime(linearGain, now, 0.01);
  }

  filters.forEach((filter, idx) => {
    const gainValue = isEnabled ? bands[idx] || 0 : 0;
    filter.gain.setTargetAtTime(gainValue, now, 0.01);
  });
};

export const useAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    pause,
    next,
    setCurrentTime,
    setDuration
  } = usePlayerStore();

  const { isEnabled, bands, preamp } = useEqualizerStore();

  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const currentTrackRef = useRef(currentTrack);
  const repeatModeRef = useRef(repeatMode);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    currentTrackRef.current = currentTrack;
    repeatModeRef.current = repeatMode;
  }, [isPlaying, volume, isMuted, currentTrack, repeatMode]);

  // Volume sync
  useEffect(() => {
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Equalizer band/preamp sync (only when Web Audio API is active)
  useEffect(() => {
    applyEqualizerSettings();
  }, [isEnabled, bands, preamp]);

  // Source change sync
  useEffect(() => {
    if (!audio) return;

    if (currentTrack?.audioUrl) {
      if (loadedUrl !== currentTrack.audioUrl) {
        audio.src = resolveAudioSrc(currentTrack.audioUrl);
        audio.load();
        loadedUrl = currentTrack.audioUrl;
      }

      if (isPlaying) {
        if (!isAudioContextInitialized && ENABLE_WEB_AUDIO) {
          setupWebAudio();
        }
        if (audioContext && audioContext.state === "suspended") {
          audioContext.resume().catch(() => {});
        }

        audio.play().catch((err) => {
          console.warn("Audio autoplay blocked or interrupted:", err);
          pause();
        });
      }
    } else {
      audio.pause();
      audio.src = "";
      loadedUrl = null;
    }
  }, [currentTrack?.audioUrl]);

  // Play/Pause sync
  useEffect(() => {
    if (!audio) return;

    if (isPlaying) {
      if (!isAudioContextInitialized && ENABLE_WEB_AUDIO) {
        setupWebAudio();
      }
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
      if (audio.src) {
        audio.play().catch((err) => {
          console.warn("Playback error:", err);
          pause();
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio!.currentTime);
    };

    const handleDurationChange = () => {
      if (audio && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === "one") {
        audio!.currentTime = 0;
        audio!.play().catch((err) => console.warn(err));
      } else {
        next();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadedmetadata", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("loadedmetadata", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
      }
    };
  }, [next, setCurrentTime, setDuration]);

  const seekTo = (seconds: number) => {
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  return {
    audio,
    seekTo
  };
};
