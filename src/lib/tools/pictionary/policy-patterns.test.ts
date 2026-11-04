import { describe, expect, it } from "vitest";
import { violatesContentPolicy } from "./policy";

describe("policy edge cases", () => {
  it("allows kitchen and tech objects that are not music performances", () => {
    expect(violatesContentPolicy("Microphone")).toBeNull();
    expect(violatesContentPolicy("Speaker")).toBeNull();
    expect(violatesContentPolicy("Butter knife")).toBeNull();
  });

  it("rejects clear music-instrument prompts", () => {
    expect(violatesContentPolicy("piano")).toBeTruthy();
    expect(violatesContentPolicy("violin case")).toBeTruthy();
  });
});
