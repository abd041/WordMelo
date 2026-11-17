import { HIGHLIGHT_COLOR, paletteById } from "./palettes";
import type { LayoutResult, PaletteId } from "./types";

export interface SvgRenderOptions {
  palette: PaletteId;
  background: string;
  transparent: boolean;
  customColor: string | null;
  fontFamily: string;
  fontWeight: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function fillForWord(
  highlighted: boolean,
  colorIndex: number,
  options: Pick<SvgRenderOptions, "palette" | "customColor">,
): string {
  if (highlighted) return HIGHLIGHT_COLOR;
  if (options.customColor) return options.customColor;
  const colors = paletteById(options.palette).colors;
  return colors[colorIndex % colors.length] ?? colors[0]!;
}

export function buildWordCloudSvg(
  layout: LayoutResult,
  options: SvgRenderOptions,
): string {
  const background = options.transparent
    ? ""
    : `<rect width="100%" height="100%" fill="${escapeXml(options.background)}"/>`;
  const words = layout.words
    .map((word) => {
      const fill = escapeXml(
        fillForWord(word.highlighted, word.colorIndex, options),
      );
      const weight = word.highlighted
        ? Math.min(700, options.fontWeight + 100)
        : options.fontWeight;
      const rotation =
        word.rotation === 0
          ? ""
          : ` transform="rotate(${round(word.rotation)} ${round(word.x)} ${round(word.y)})"`;
      return `<text x="${round(word.x)}" y="${round(word.y)}" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-size="${round(word.fontSize)}" font-family="${escapeXml(options.fontFamily)}" font-weight="${weight}"${rotation}>${escapeXml(word.text)}</text>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img">${background}${words}</svg>`;
}

function round(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

export const MAX_PNG_PIXELS = 12_000_000;

export function resolvePngScale(
  width: number,
  height: number,
  requested: 1 | 2 | 3,
): { scale: 1 | 2 | 3; clamped: boolean } {
  let scale = requested;
  while (scale > 1 && width * height * scale * scale > MAX_PNG_PIXELS) {
    scale = (scale - 1) as 1 | 2 | 3;
  }
  return { scale, clamped: scale !== requested };
}

export function pngPixelSize(
  width: number,
  height: number,
  scale: number,
): { width: number; height: number } {
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function canCopyImage(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.write === "function" &&
    typeof globalThis.ClipboardItem === "function"
  );
}

export const PNG_FILENAME = "wordmelo-word-cloud.png";
export const SVG_FILENAME = "wordmelo-word-cloud.svg";
