import type { CloudAspect, CloudShape } from "./types";

export interface CanvasSize {
  width: number;
  height: number;
}

export const ASPECT_SIZES: Record<CloudAspect, CanvasSize> = {
  square: { width: 1000, height: 1000 },
  landscape: { width: 1600, height: 900 },
  presentation: { width: 1200, height: 900 },
  portrait: { width: 900, height: 1200 },
  pinterest: { width: 800, height: 1200 },
};

const SHAPE_PAD = 18;

export function canvasFor(aspect: CloudAspect): CanvasSize {
  return ASPECT_SIZES[aspect];
}

/** True when a point lies inside the shape mask, including the edge inset. */
export function pointInShape(
  shape: CloudShape,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  if (x < SHAPE_PAD || y < SHAPE_PAD || x > width - SHAPE_PAD || y > height - SHAPE_PAD) {
    return false;
  }
  const cx = width / 2;
  const cy = height / 2;
  if (shape === "rectangle") return true;
  if (shape === "circle") {
    const radius = Math.min(width, height) / 2 - SHAPE_PAD;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }
  if (shape === "oval") {
    const rx = width / 2 - SHAPE_PAD;
    const ry = height / 2 - SHAPE_PAD;
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    return nx * nx + ny * ny <= 1;
  }
  if (shape === "diamond") {
    const nx = Math.abs(x - cx) / (width / 2 - SHAPE_PAD);
    const ny = Math.abs(y - cy) / (height / 2 - SHAPE_PAD);
    return nx + ny <= 1;
  }
  return pointInHeart(x, y, width, height);
}

function pointInHeart(x: number, y: number, width: number, height: number): boolean {
  const cx = width / 2;
  const cy = height * 0.56;
  const sx = (width / 2 - SHAPE_PAD) / 1.22;
  const sy = (height / 2 - SHAPE_PAD) / 1.18;
  if (sx <= 0 || sy <= 0) return false;
  const nx = (x - cx) / sx;
  const ny = (cy - y) / sy;
  const a = nx * nx + ny * ny - 1;
  return a * a * a - nx * nx * ny * ny * ny <= 0.02;
}

export function shapeInnerLimit(
  shape: CloudShape,
  width: number,
  height: number,
): { maxWidth: number; maxHeight: number } {
  const innerW = width - SHAPE_PAD * 2;
  const innerH = height - SHAPE_PAD * 2;
  if (shape === "rectangle") return { maxWidth: innerW * 0.92, maxHeight: innerH * 0.92 };
  if (shape === "circle") {
    const diameter = Math.min(width, height) - SHAPE_PAD * 2;
    return { maxWidth: diameter * 0.86, maxHeight: diameter * 0.86 };
  }
  if (shape === "oval") return { maxWidth: innerW * 0.84, maxHeight: innerH * 0.84 };
  if (shape === "diamond") return { maxWidth: innerW * 0.62, maxHeight: innerH * 0.62 };
  return { maxWidth: innerW * 0.58, maxHeight: innerH * 0.5 };
}

export function wordFitsShape(
  shape: CloudShape,
  cx: number,
  cy: number,
  wordWidth: number,
  wordHeight: number,
  rotation: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  for (const fx of [-0.5, 0, 0.5]) {
    for (const fy of [-0.5, 0, 0.5]) {
      const localX = fx * wordWidth;
      const localY = fy * wordHeight;
      const x = cx + localX * cos - localY * sin;
      const y = cy + localX * sin + localY * cos;
      if (!pointInShape(shape, x, y, canvasWidth, canvasHeight)) return false;
    }
  }
  return true;
}
