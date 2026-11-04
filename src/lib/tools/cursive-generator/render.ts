import {
  CURSIVE_FONTS,
  getCursiveFont,
  loadCursiveFont,
  type CursiveFontDefinition,
} from "./fonts";

export type HandwritingAlign = "left" | "center" | "right";
export type HandwritingBackgroundId =
  | "white"
  | "cream"
  | "mint"
  | "transparent";
export type HandwritingLayout = "auto" | "square" | "landscape" | "portrait";

export interface HandwritingRenderOptions {
  text: string;
  fontId: string;
  fontSize: number;
  color: string;
  backgroundId: HandwritingBackgroundId;
  align: HandwritingAlign;
  letterSpacing: number;
  lineHeight: number;
  padding: number;
  layout: HandwritingLayout;
  /** Device pixel ratio for sharp PNG; defaults to 2 */
  pixelRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface HandwritingRenderResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  clipped: boolean;
  lineCount: number;
}

export const HANDWRITING_BACKGROUNDS: {
  id: HandwritingBackgroundId;
  label: string;
  /** CSS/canvas fill; null = transparent */
  fill: string | null;
}[] = [
  { id: "white", label: "White", fill: "#ffffff" },
  { id: "cream", label: "Cream", fill: "#f7f1e8" },
  { id: "mint", label: "Mint paper", fill: "#eef6f3" },
  { id: "transparent", label: "Transparent", fill: null },
];

export const HANDWRITING_COLORS: { id: string; label: string; value: string }[] =
  [
    { id: "ink", label: "Deep navy", value: "#1a2b3c" },
    { id: "teal", label: "Teal", value: "#0f6b66" },
    { id: "black", label: "Black", value: "#111111" },
    { id: "rose", label: "Rose", value: "#9b4b6b" },
    { id: "gold", label: "Gold brown", value: "#8a6a32" },
  ];

export const DEFAULT_HANDWRITING_OPTIONS: Omit<
  HandwritingRenderOptions,
  "text" | "fontId"
> = {
  fontSize: 64,
  color: "#1a2b3c",
  backgroundId: "cream",
  align: "center",
  letterSpacing: 0,
  lineHeight: 1.35,
  padding: 48,
  layout: "auto",
  pixelRatio: 2,
  maxWidth: 1600,
  maxHeight: 1600,
};

export const PNG_DOWNLOAD_FILENAME = "WordMelo-cursive-writing.png";

function getBackgroundFill(
  id: HandwritingBackgroundId,
): string | null {
  return (
    HANDWRITING_BACKGROUNDS.find((item) => item.id === id)?.fill ?? "#ffffff"
  );
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxLineWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/(\s+)/);
    let current = "";
    for (const word of words) {
      const next = current + word;
      if (current && ctx.measureText(next).width > maxLineWidth) {
        lines.push(current.replace(/\s+$/u, ""));
        current = word.replace(/^\s+/u, "");
      } else {
        current = next;
      }
    }
    if (current.length > 0 || paragraph.length === 0) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [""];
}

function applyLetterSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: HandwritingAlign,
): void {
  if (!spacing) {
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    return;
  }

  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) +
    Math.max(0, chars.length - 1) * spacing;

  let cursor =
    align === "left"
      ? x
      : align === "right"
        ? x - total
        : x - total / 2;

  ctx.textAlign = "left";
  chars.forEach((ch, index) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[index]! + spacing;
  });
}

export function resolveFont(
  fontId: string,
): CursiveFontDefinition {
  return getCursiveFont(fontId) ?? CURSIVE_FONTS[0]!;
}

/**
 * Render handwriting to an offscreen canvas. Fonts must be loadable in
 * the browser; call loadCursiveFont first or let this method load them.
 */
export async function renderHandwritingCanvas(
  options: HandwritingRenderOptions,
): Promise<HandwritingRenderResult> {
  if (typeof document === "undefined") {
    throw new Error("Handwriting rendering requires a browser environment");
  }

  const font = resolveFont(options.fontId);
  await loadCursiveFont(font);

  const pixelRatio = Math.min(3, Math.max(1, options.pixelRatio ?? 2));
  const padding = Math.max(8, options.padding);
  const fontSize = Math.min(200, Math.max(16, options.fontSize));
  const lineHeight = Math.min(2.4, Math.max(1, options.lineHeight));
  const letterSpacing = Math.min(20, Math.max(-4, options.letterSpacing));
  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1600;
  // Extra room for script flourishes / overhanging swashes beyond advance width.
  const flourishPad = Math.ceil(fontSize * 0.28);

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) {
    throw new Error("Could not create canvas context");
  }

  measureCtx.font = `${fontSize}px "${font.family}"`;
  measureCtx.textBaseline = "alphabetic";

  const contentBudget = Math.max(
    120,
    maxWidth - padding * 2 - flourishPad * 2,
  );
  const rawLines = options.text
    ? wrapLines(measureCtx, options.text, contentBudget)
    : [""];
  const lineCount = rawLines.length;

  let maxAscent = fontSize * 0.85;
  let maxDescent = fontSize * 0.35;
  let contentWidth = 0;
  for (const line of rawLines) {
    const sample = line || "Hg";
    const metrics = measureCtx.measureText(sample);
    maxAscent = Math.max(
      maxAscent,
      metrics.actualBoundingBoxAscent || fontSize * 0.85,
    );
    maxDescent = Math.max(
      maxDescent,
      metrics.actualBoundingBoxDescent || fontSize * 0.35,
    );
    if (!letterSpacing) {
      contentWidth = Math.max(
        contentWidth,
        metrics.width || measureCtx.measureText(line).width,
      );
    } else {
      const chars = Array.from(line);
      const w =
        chars.reduce((sum, ch) => sum + measureCtx.measureText(ch).width, 0) +
        Math.max(0, chars.length - 1) * letterSpacing;
      contentWidth = Math.max(contentWidth, w);
    }
  }

  const linePx = fontSize * lineHeight;
  const textBlockHeight =
    lineCount <= 1
      ? maxAscent + maxDescent
      : maxAscent + maxDescent + (lineCount - 1) * linePx;

  let cssWidth = Math.ceil(contentWidth + padding * 2 + flourishPad * 2);
  let cssHeight = Math.ceil(textBlockHeight + padding * 2 + flourishPad * 0.5);
  let clipped = false;

  if (options.layout === "square") {
    const side = Math.max(cssWidth, cssHeight, 240);
    cssWidth = side;
    cssHeight = side;
  } else if (options.layout === "landscape") {
    cssWidth = Math.max(cssWidth, 640);
    cssHeight = Math.max(cssHeight, Math.round(cssWidth * 0.5625));
  } else if (options.layout === "portrait") {
    cssHeight = Math.max(cssHeight, 640);
    cssWidth = Math.max(cssWidth, Math.round(cssHeight * 0.75));
  }

  if (cssWidth > maxWidth) {
    cssWidth = maxWidth;
    clipped = true;
  }
  if (cssHeight > maxHeight) {
    cssHeight = maxHeight;
    clipped = true;
  }

  cssWidth = Math.max(120, cssWidth);
  cssHeight = Math.max(80, cssHeight);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const fill = getBackgroundFill(options.backgroundId);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }

  ctx.fillStyle = options.color;
  ctx.font = `${fontSize}px "${font.family}"`;
  ctx.textBaseline = "alphabetic";

  const innerWidth = Math.max(40, cssWidth - padding * 2 - flourishPad * 2);
  const startY = padding + maxAscent;
  const lines = wrapLines(ctx, options.text || " ", innerWidth);

  lines.forEach((line, index) => {
    const y = startY + index * linePx;
    if (y + maxDescent > cssHeight - padding / 2) {
      clipped = true;
      return;
    }
    const x =
      options.align === "left"
        ? padding + flourishPad
        : options.align === "right"
          ? cssWidth - padding - flourishPad
          : cssWidth / 2;
    applyLetterSpacing(ctx, line, x, y, letterSpacing, options.align);
  });

  return {
    canvas,
    width: cssWidth,
    height: cssHeight,
    clipped,
    lineCount: lines.length,
  };
}

export async function renderHandwritingPngBlob(
  options: HandwritingRenderOptions,
): Promise<{ blob: Blob; meta: Omit<HandwritingRenderResult, "canvas"> }> {
  const result = await renderHandwritingCanvas(options);
  const blob = await new Promise<Blob>((resolve, reject) => {
    result.canvas.toBlob(
      (value) => {
        if (value) resolve(value);
        else reject(new Error("PNG encoding failed"));
      },
      "image/png",
    );
  });
  return {
    blob,
    meta: {
      width: result.width,
      height: result.height,
      clipped: result.clipped,
      lineCount: result.lineCount,
    },
  };
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Pure helpers for tests — layout size math without DOM fonts. */
export function computeAutoContentSize(args: {
  contentWidth: number;
  contentHeight: number;
  padding: number;
  layout: HandwritingLayout;
  maxWidth: number;
  maxHeight: number;
}): { width: number; height: number; clipped: boolean } {
  let width = Math.ceil(args.contentWidth + args.padding * 2);
  let height = Math.ceil(args.contentHeight + args.padding * 2);
  let clipped = false;

  if (args.layout === "square") {
    const side = Math.max(width, height, 240);
    width = side;
    height = side;
  } else if (args.layout === "landscape") {
    width = Math.max(width, 640);
    height = Math.max(height, Math.round(width * 0.5625));
  } else if (args.layout === "portrait") {
    height = Math.max(height, 640);
    width = Math.max(width, Math.round(height * 0.75));
  }

  if (width > args.maxWidth) {
    width = args.maxWidth;
    clipped = true;
  }
  if (height > args.maxHeight) {
    height = args.maxHeight;
    clipped = true;
  }

  return {
    width: Math.max(120, width),
    height: Math.max(80, height),
    clipped,
  };
}
