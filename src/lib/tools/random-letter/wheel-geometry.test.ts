import { describe, expect, it } from "vitest";
import {
  rotationToLandOn,
  segmentAngleDeg,
  segmentCenterFromTopDeg,
} from "./wheel-geometry";

describe("wheel geometry", () => {
  it("splits the circle evenly", () => {
    expect(segmentAngleDeg(26)).toBeCloseTo(360 / 26);
    expect(segmentAngleDeg(1)).toBe(360);
  });

  it("places the first segment center just past the top", () => {
    expect(segmentCenterFromTopDeg(0, 4)).toBe(45);
    expect(segmentCenterFromTopDeg(1, 4)).toBe(135);
  });

  it("computes a positive rotation that lands on the target", () => {
    const next = rotationToLandOn(0, 4, 0, 2);
    expect(next).toBeGreaterThanOrEqual(720);
    // Segment 0 center is at 45°; wheel must rotate 315° (+ turns)
    expect(next % 360).toBeCloseTo(315);
  });

  it("is stable for repeated landings from nonzero rotation", () => {
    const first = rotationToLandOn(2, 5, 100, 3);
    const second = rotationToLandOn(2, 5, first, 3);
    expect(second).toBeGreaterThan(first);
  });
});
