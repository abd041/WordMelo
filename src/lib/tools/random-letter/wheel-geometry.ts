/**
 * Wheel geometry helpers. Pointer sits at the top (12 o'clock).
 * Segments are laid out clockwise from the top.
 */

export function segmentAngleDeg(poolSize: number): number {
  if (poolSize <= 0) return 360;
  return 360 / poolSize;
}

/** Center angle of segment `index` measured clockwise from top, before wheel rotation. */
export function segmentCenterFromTopDeg(index: number, poolSize: number): number {
  const seg = segmentAngleDeg(poolSize);
  return index * seg + seg / 2;
}

/**
 * Absolute rotation (clockwise) that places segment `index` under the top pointer.
 * Adds `extraTurns` full spins for animation.
 */
export function rotationToLandOn(
  index: number,
  poolSize: number,
  currentRotation = 0,
  extraTurns = 4,
): number {
  if (poolSize <= 0 || index < 0 || index >= poolSize) {
    return currentRotation;
  }
  const center = segmentCenterFromTopDeg(index, poolSize);
  // Rotate wheel so the segment center moves to the top (0°).
  const desired = ((360 - (center % 360)) + 360) % 360;
  const normalized = ((currentRotation % 360) + 360) % 360;
  let delta = desired - normalized;
  if (delta < 0) delta += 360;
  return currentRotation + extraTurns * 360 + delta;
}

/** Polar to cartesian for SVG labels (0° = top, clockwise). */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleFromTopDeg: number,
): { x: number; y: number } {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}
