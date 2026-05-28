import { create } from "zustand";
import type {
  FontFamily,
  ReaderFontWeight,
  ReaderPageTurnMode,
  ReaderSettings,
  ReaderTextAlign,
  ReaderTheme,
} from "../types/book";
import { READER_SETTINGS_KEY, safeGetLocalStorage, safeSetLocalStorage } from "../utils/storage";

const fontFamilies: FontFamily[] = ["system", "sans", "serif", "kai", "mono"];
const themes: ReaderTheme[] = ["light", "paper", "green", "warm", "blue", "dark", "night"];
const fontWeights: ReaderFontWeight[] = ["light", "regular", "medium", "bold"];
const pageTurnModes: ReaderPageTurnMode[] = ["cover", "slide", "simulation", "scroll", "none"];
const textAligns: ReaderTextAlign[] = ["start", "justify"];

export const defaultReaderSettings: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.9,
  contentWidth: 760,
  fontFamily: "system",
  theme: "paper",
  fontWeight: "regular",
  letterSpacing: 0,
  paragraphSpacing: 1.05,
  textAlign: "justify",
  textBottomAlign: false,
  pageTurnMode: "cover",
  keepScreenOn: false,
  edgeToEdge: true,
  hideStatusBar: false,
  hideNavigationBar: false,
  volumeKeyPageTurn: false,
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
    fontWeight: fontWeights.includes(value.fontWeight) ? value.fontWeight : defaultReaderSettings.fontWeight,
    letterSpacing: clamp(Number(value.letterSpacing) || 0, 0, 4),
    paragraphSpacing: clamp(Number(value.paragraphSpacing) || defaultReaderSettings.paragraphSpacing, 0.5, 2.2),
    textAlign: textAligns.includes(value.textAlign) ? value.textAlign : defaultReaderSettings.textAlign,
    textBottomAlign: Boolean(value.textBottomAlign),
    pageTurnMode: pageTurnModes.includes(value.pageTurnMode) ? value.pageTurnMode : defaultReaderSettings.pageTurnMode,
    keepScreenOn: Boolean(value.keepScreenOn),
    edgeToEdge: value.edgeToEdge === undefined ? defaultReaderSettings.edgeToEdge : Boolean(value.edgeToEdge),
    hideStatusBar: Boolean(value.hideStatusBar),
    hideNavigationBar: Boolean(value.hideNavigationBar),
    volumeKeyPageTurn: Boolean(value.volumeKeyPageTurn),
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
