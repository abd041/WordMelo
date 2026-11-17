import { FONT_PRESETS, effectiveFontWeight } from "./fonts";
import { fillForWord, pngPixelSize, resolvePngScale, type SvgRenderOptions } from "./svg";
import type { CloudFont, LayoutResult } from "./types";

export interface PngExport {
  blob: Blob;
  scale: 1 | 2 | 3;
  clamped: boolean;
  width: number;
  height: number;
}

async function resolvedFamily(font: CloudFont): Promise<string> {
  const preset = FONT_PRESETS[font];
  const probe = document.createElement("span");
  probe.style.fontFamily = preset.previewFamily;
  probe.textContent = "Ag";
  document.body.append(probe);
  const family = getComputedStyle(probe).fontFamily || preset.exportFamily;
  probe.remove();
  if (document.fonts?.load) {
    try {
      await document.fonts.load(`16px ${family}`);
    } catch {
      // The canvas still draws with the nearest available face.
    }
  }
  if (document.fonts?.ready) await document.fonts.ready;
  return family;
}

export async function renderWordCloudPng(
  layout: LayoutResult,
  options: SvgRenderOptions & { font: CloudFont },
  requestedScale: 1 | 2 | 3,
): Promise<PngExport> {
  const { scale, clamped } = resolvePngScale(layout.width, layout.height, requestedScale);
  const pixels = pngPixelSize(layout.width, layout.height, scale);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  const family = await resolvedFamily(options.font);
  if (!options.transparent) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.scale(scale, scale);
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const word of layout.words) {
    const weight = word.highlighted
      ? Math.min(700, options.fontWeight + 100)
      : effectiveFontWeight(options.font, options.fontWeight as 400 | 600 | 700);
    context.save();
    context.translate(word.x, word.y);
    context.rotate((word.rotation * Math.PI) / 180);
    context.font = `${weight} ${word.fontSize}px ${family}`;
    context.fillStyle = fillForWord(word.highlighted, word.colorIndex, options);
    context.fillText(word.text, 0, 0);
    context.restore();
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error("PNG export failed."));
    }, "image/png");
  });
  return { blob, scale, clamped, width: pixels.width, height: pixels.height };
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
