import { create } from "zustand";
import type { FontFamily, ReaderSettings, ReaderTheme } from "../types/book";
import { READER_SETTINGS_KEY, safeGetLocalStorage, safeSetLocalStorage } from "../utils/storage";

const fontFamilies: FontFamily[] = ["serif", "sans", "mono"];
const themes: ReaderTheme[] = ["light", "dark", "green", "paper"];

export const defaultReaderSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.9,
  contentWidth: 760,
  fontFamily: "serif",
  theme: "paper",
};

interface ReaderSettingsState {
  settings: ReaderSettings;
  updateSettings: (partialSettings: Partial<ReaderSettings>) => void;
  replaceSettings: (settings: ReaderSettings) => void;
  resetSettings: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeSettings(value: ReaderSettings): ReaderSettings {
  return {
    fontSize: clamp(Number(value.fontSize) || defaultReaderSettings.fontSize, 14, 28),
    lineHeight: clamp(Number(value.lineHeight) || defaultReaderSettings.lineHeight, 1.4, 2.4),
    contentWidth: clamp(Number(value.contentWidth) || defaultReaderSettings.contentWidth, 560, 960),
    fontFamily: fontFamilies.includes(value.fontFamily) ? value.fontFamily : defaultReaderSettings.fontFamily,
    theme: themes.includes(value.theme) ? value.theme : defaultReaderSettings.theme,
  };
}

function loadInitialSettings(): ReaderSettings {
  const storedSettings = safeGetLocalStorage<ReaderSettings>(
    READER_SETTINGS_KEY,
    defaultReaderSettings,
  );
  return normalizeSettings({ ...defaultReaderSettings, ...storedSettings });
}

export const useReaderSettingsStore = create<ReaderSettingsState>((set, get) => ({
  settings: loadInitialSettings(),
  updateSettings: (partialSettings) => {
    const nextSettings = normalizeSettings({ ...get().settings, ...partialSettings });
    safeSetLocalStorage(READER_SETTINGS_KEY, nextSettings);
    set({ settings: nextSettings });
  },
  replaceSettings: (settings) => {
    const nextSettings = normalizeSettings(settings);
    safeSetLocalStorage(READER_SETTINGS_KEY, nextSettings);
    set({ settings: nextSettings });
  },
  resetSettings: () => {
    safeSetLocalStorage(READER_SETTINGS_KEY, defaultReaderSettings);
    set({ settings: defaultReaderSettings });
  },
}));
