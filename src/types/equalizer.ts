export interface EqualizerPreset {
  id: string;
  name: string;
  bands: [number, number, number, number, number, number, number, number, number, number]; // 10 bands in dB (-12 to +12)
  preamp?: number; // dB (-12 to +12)
}

export const EQUALIZER_FREQUENCIES = [
  60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000
] as const;

export const EQUALIZER_BAND_LABELS = [
  "60", "170", "310", "600", "1k", "3k", "6k", "12k", "14k", "16k"
] as const;

export const CUSTOM_PRESET_NAME = "Custom";

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  {
    id: "custom",
    name: "Custom",
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0
  },
  {
    id: "default",
    name: "Default",
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0
  },
  {
    id: "club",
    name: "Club",
    bands: [3, 4, 3, 0, 1, 2, 3, 3, 2, 0],
    preamp: 0
  },
  {
    id: "dance",
    name: "Dance",
    bands: [6, 5, 2, 0, 1, 3, 5, 4, 3, 0],
    preamp: 0
  },
  {
    id: "party",
    name: "Party",
    bands: [4, 4, 0, 0, 0, 0, 0, 0, 4, 4],
    preamp: 0
  },
  {
    id: "full-bass",
    name: "Full Bass",
    bands: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0],
    preamp: 0
  },
  {
    id: "pop",
    name: "Pop",
    bands: [-1, 2, 4, 5, 4, 2, -1, -1, -1, -1],
    preamp: 0
  },
  {
    id: "reggae",
    name: "Reggae",
    bands: [0, 0, -1, -3, 0, 3, 3, 0, 0, 0],
    preamp: 0
  },
  {
    id: "rock",
    name: "Rock",
    bands: [5, 3, -2, -3, -1, 2, 5, 6, 6, 6],
    preamp: 0
  },
  {
    id: "jazz",
    name: "Jazz",
    bands: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
    preamp: 0
  },
  {
    id: "classical",
    name: "Classical",
    bands: [4, 3, 2, 2, -1, -1, 0, 2, 3, 3],
    preamp: 0
  },
  {
    id: "vocal",
    name: "Vocal",
    bands: [-2, -2, 0, 3, 4, 4, 3, 1, -1, -2],
    preamp: 0
  }
];

export interface EqualizerState {
  isEnabled: boolean;
  selectedPreset: string;
  preamp: number; // in dB (-12 to +12)
  bands: number[]; // 10 numbers in dB (-12 to +12)
  isEqualizerOpen: boolean;
}
