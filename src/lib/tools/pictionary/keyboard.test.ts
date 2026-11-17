import { describe, expect, it } from "vitest";
import { shortcutFromKey } from "./keyboard";

const page = { tagName: "BODY", interactive: false };

describe("pictionary keyboard shortcuts", () => {
  it("maps generate, hide, and copy keys", () => {
    expect(shortcutFromKey({ key: " ", code: "Space", target: page })).toBe("generate");
    expect(shortcutFromKey({ key: "n", target: page })).toBe("generate");
    expect(shortcutFromKey({ key: "N", target: page })).toBe("generate");
    expect(shortcutFromKey({ key: "h", target: page })).toBe("toggle-hidden");
    expect(shortcutFromKey({ key: "c", target: page })).toBe("copy");
  });

  it("ignores typing fields, modified keys, and space on a control", () => {
    expect(shortcutFromKey({ key: "n", target: { tagName: "INPUT" } })).toBeNull();
    expect(shortcutFromKey({ key: "h", target: { tagName: "TEXTAREA" } })).toBeNull();
    expect(shortcutFromKey({ key: "c", target: { tagName: "SELECT" } })).toBeNull();
    expect(shortcutFromKey({ key: "n", target: { isContentEditable: true } })).toBeNull();
    expect(shortcutFromKey({ key: "c", metaKey: true, target: page })).toBeNull();
    expect(shortcutFromKey({ key: " ", code: "Space", target: { tagName: "BUTTON", interactive: true } })).toBeNull();
    expect(shortcutFromKey({ key: "n", target: { tagName: "BUTTON", interactive: true } })).toBe("generate");
  });
});
