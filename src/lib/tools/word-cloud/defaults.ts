import type { CloudSettings } from "./types";

export const DEFAULT_SETTINGS: CloudSettings = {
  ignoreCase: true,
  excludeCommon: true,
  minLength: 3,
  minFrequency: 1,
  maxWords: 50,
  excludedWords: "",
  highlightedWords: "",
  shape: "circle",
  aspect: "square",
  font: "sans",
  minFont: 16,
  maxFont: 72,
  fontWeight: 600,
  rotation: "horizontal",
  spacing: 8,
  align: "center",
  palette: "editorial",
  randomizeColors: true,
  background: "#ffffff",
  transparent: false,
  customColor: null,
};

export const DEFAULT_SEED = 1;

export function settingsEqual(a: CloudSettings, b: CloudSettings): boolean {
  return (Object.keys(DEFAULT_SETTINGS) as (keyof CloudSettings)[]).every(
    (key) => a[key] === b[key],
  );
}

/** Fields that move words. Color and background do not. */
export function layoutSignature(text: string, settings: CloudSettings, seed: number): string {
  return JSON.stringify({
    text: text.slice(0, 80_000),
    seed,
    ignoreCase: settings.ignoreCase,
    excludeCommon: settings.excludeCommon,
    minLength: settings.minLength,
    minFrequency: settings.minFrequency,
    maxWords: settings.maxWords,
    excludedWords: settings.excludedWords,
    highlightedWords: settings.highlightedWords,
    shape: settings.shape,
    aspect: settings.aspect,
    font: settings.font,
    minFont: settings.minFont,
    maxFont: settings.maxFont,
    fontWeight: settings.fontWeight,
    rotation: settings.rotation,
    spacing: settings.spacing,
    align: settings.align,
  });
}
