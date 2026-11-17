import { effectiveFontWeight, FONT_PRESETS, weightWidthScale } from "./fonts";
import { createSeededRandom } from "./rng";
import {
  canvasFor,
  shapeInnerLimit,
  wordFitsShape,
} from "./shapes";
import type {
  CloudAlign,
  CloudAspect,
  CloudFont,
  CloudRotation,
  CloudShape,
  LayoutResult,
  OmittedWord,
  PlacedWord,
  RankedWord,
} from "./types";

export interface LayoutOptions {
  shape: CloudShape;
  width: number;
  height: number;
  font: CloudFont;
  minFont: number;
  maxFont: number;
  fontWeight: 400 | 600 | 700;
  rotation: CloudRotation;
  spacing: number;
  align: CloudAlign;
  seed: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CELL = 56;

export function fontSizeFor(
  count: number,
  minCount: number,
  maxCount: number,
  minFont: number,
  maxFont: number,
): number {
  const low = Math.min(minFont, maxFont);
  const high = Math.max(minFont, maxFont);
  if (maxCount <= minCount || count <= minCount) return low;
  const span = Math.log(maxCount) - Math.log(minCount);
  if (span <= 0) return (low + high) / 2;
  const t = (Math.log(count) - Math.log(minCount)) / span;
  return low + Math.min(1, Math.max(0, t)) * (high - low);
}

export function measureWord(
  text: string,
  fontSize: number,
  font: CloudFont,
  fontWeight: number,
): { width: number; height: number } {
  const factor = FONT_PRESETS[font].widthFactor * weightWidthScale(fontWeight);
  const width = Math.max(fontSize * 0.45, text.length * fontSize * factor);
  const height = fontSize * 1.18;
  return { width, height };
}

export function collisionBoxFor(
  word: Pick<PlacedWord, "x" | "y" | "width" | "height" | "rotation">,
  spacing: number,
): Box {
  return rotatedAabb(word.x, word.y, word.width, word.height, word.rotation, spacing);
}

function rotatedAabb(
  cx: number,
  cy: number,
  wordWidth: number,
  wordHeight: number,
  rotation: number,
  spacing: number,
): Box {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const w = wordWidth * cos + wordHeight * sin + spacing;
  const h = wordWidth * sin + wordHeight * cos + spacing;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function cellKey(x: number, y: number): string {
  return `${x}:${y}`;
}

class CollisionGrid {
  private cells = new Map<string, Box[]>();

  insert(box: Box): void {
    for (const key of this.keys(box)) {
      const list = this.cells.get(key);
      if (list) list.push(box);
      else this.cells.set(key, [box]);
    }
  }

  hits(box: Box): boolean {
    const seen = new Set<Box>();
    for (const key of this.keys(box)) {
      const list = this.cells.get(key);
      if (!list) continue;
      for (const other of list) {
        if (seen.has(other)) continue;
        seen.add(other);
        if (boxesOverlap(box, other)) return true;
      }
    }
    return false;
  }

  private keys(box: Box): string[] {
    const x0 = Math.floor(box.x / CELL);
    const y0 = Math.floor(box.y / CELL);
    const x1 = Math.floor((box.x + box.w) / CELL);
    const y1 = Math.floor((box.y + box.h) / CELL);
    const keys: string[] = [];
    for (let x = x0; x <= x1; x += 1) {
      for (let y = y0; y <= y1; y += 1) keys.push(cellKey(x, y));
    }
    return keys;
  }
}

function pickRotation(
  preset: CloudRotation,
  text: string,
  random: (max: number) => number,
): number {
  if (preset === "horizontal") return 0;
  if (preset === "mixed") {
    if (text.length > 14) return 0;
    return random(5) === 0 ? 90 : 0;
  }
  const steps = [-16, -8, 0, 8, 16];
  return steps[random(steps.length)] ?? 0;
}

function originFor(
  align: CloudAlign,
  width: number,
  height: number,
): { x: number; y: number } {
  if (align === "top") return { x: width / 2, y: height * 0.34 };
  if (align === "left") return { x: width * 0.34, y: height / 2 };
  return { x: width / 2, y: height / 2 };
}

function shrinkToLimit(
  text: string,
  desired: number,
  minFont: number,
  font: CloudFont,
  fontWeight: number,
  limit: { maxWidth: number; maxHeight: number },
): { fontSize: number; width: number; height: number; scaled: boolean } {
  let fontSize = desired;
  let measured = measureWord(text, fontSize, font, fontWeight);
  let scaled = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (measured.width <= limit.maxWidth && measured.height <= limit.maxHeight) break;
    const next = Math.max(minFont, fontSize * 0.84);
    if (next === fontSize) break;
    fontSize = next;
    measured = measureWord(text, fontSize, font, fontWeight);
    scaled = true;
  }
  return { fontSize, ...measured, scaled };
}

function tryPlace(
  cx: number,
  cy: number,
  wordWidth: number,
  wordHeight: number,
  rotation: number,
  options: LayoutOptions,
  grid: CollisionGrid,
): Box | null {
  if (
    !wordFitsShape(
      options.shape,
      cx,
      cy,
      wordWidth,
      wordHeight,
      rotation,
      options.width,
      options.height,
    )
  ) {
    return null;
  }
  const box = rotatedAabb(cx, cy, wordWidth, wordHeight, rotation, options.spacing);
  if (grid.hits(box)) return null;
  return box;
}

export function layoutWords(words: RankedWord[], options: LayoutOptions): LayoutResult {
  const width = options.width;
  const height = options.height;
  const weight = effectiveFontWeight(options.font, options.fontWeight);
  const minFont = Math.min(options.minFont, options.maxFont);
  const maxFont = Math.max(options.minFont, options.maxFont);
  const counts = words.map((word) => word.count);
  const minCount = counts.length > 0 ? Math.min(...counts) : 1;
  const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
  const random = createSeededRandom(options.seed);
  const phase = ((options.seed % 628) / 100) * 1;
  const origin = originFor(options.align, width, height);
  const grid = new CollisionGrid();
  const placed: PlacedWord[] = [];
  const omitted: OmittedWord[] = [];
  let scaled = false;
  const limit = shapeInnerLimit(options.shape, width, height);

  words.forEach((word, index) => {
    const desired = fontSizeFor(word.count, minCount, maxCount, minFont, maxFont);
    const fitted = shrinkToLimit(word.text, desired, minFont, options.font, weight, limit);
    if (fitted.scaled) scaled = true;
    const rotation = pickRotation(options.rotation, word.text, random);
    let box = tryPlace(
      origin.x,
      origin.y,
      fitted.width,
      fitted.height,
      rotation,
      options,
      grid,
    );
    let foundX = origin.x;
    let foundY = origin.y;
    if (!box) {
      const maxRadius = Math.hypot(width, height);
      for (let step = 1; step < 1700; step += 1) {
        const radius = step * 2.35;
        if (radius > maxRadius) break;
        const theta = phase + step * 0.42;
        const x = origin.x + Math.cos(theta) * radius;
        const y = origin.y + Math.sin(theta) * radius;
        box = tryPlace(x, y, fitted.width, fitted.height, rotation, options, grid);
        if (box) {
          foundX = x;
          foundY = y;
          break;
        }
      }
    }
    if (!box) {
      omitted.push({ text: word.text, count: word.count });
      return;
    }
    grid.insert(box);
    const colorIndex = index % 6;
    placed.push({
      text: word.text,
      count: word.count,
      highlighted: word.highlighted,
      x: foundX,
      y: foundY,
      fontSize: fitted.fontSize,
      rotation,
      width: fitted.width,
      height: fitted.height,
      colorIndex,
    });
  });

  return { width, height, words: placed, omitted, scaled, seed: options.seed };
}

export function assignColorIndexes(
  words: PlacedWord[],
  paletteSize: number,
  seed: number,
  randomize: boolean,
): PlacedWord[] {
  const size = Math.max(1, paletteSize);
  if (!randomize) {
    return words.map((word, index) => ({ ...word, colorIndex: index % size }));
  }
  const random = createSeededRandom((seed ^ 0x51ed5eed) >>> 0);
  return words.map((word) => ({ ...word, colorIndex: random(size) }));
}

export function layoutFromSettings(
  words: RankedWord[],
  settings: {
    shape: CloudShape;
    aspect: CloudAspect;
    font: CloudFont;
    minFont: number;
    maxFont: number;
    fontWeight: 400 | 600 | 700;
    rotation: CloudRotation;
    spacing: number;
    align: CloudAlign;
  },
  seed: number,
): LayoutResult {
  const canvas = canvasFor(settings.aspect);
  return layoutWords(words, {
    ...settings,
    width: canvas.width,
    height: canvas.height,
    seed,
  });
}

export function fitMessage(result: LayoutResult): string | null {
  if (!result.scaled && result.omitted.length === 0) return null;
  const parts: string[] = [];
  if (result.scaled) {
    parts.push("Some long words were reduced so they stay inside the shape.");
  }
  if (result.omitted.length > 0) {
    const names = result.omitted
      .slice(0, 5)
      .map((word) => word.text)
      .join(", ");
    const extra = result.omitted.length === 1 ? "" : "s";
    parts.push(
      `${result.omitted.length} word${extra} did not fit: ${names}. Try Rectangle, fewer words, or a smaller maximum size.`,
    );
  }
  return parts.join(" ");
}

export function frequencySummary(words: RankedWord[]): string {
  if (words.length === 0) return "No words to display.";
  const top = words
    .slice(0, 8)
    .map((word) => `${word.text} (${word.count})`)
    .join(", ");
  return `Most frequent words: ${top}.`;
}
