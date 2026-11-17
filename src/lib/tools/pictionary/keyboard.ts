export type ShortcutAction = "generate" | "toggle-hidden" | "copy";

export interface ShortcutTarget {
  tagName?: string;
  isContentEditable?: boolean;
  interactive?: boolean;
}

export function shortcutFromKey(event: {
  key: string;
  code?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  target: ShortcutTarget;
}): ShortcutAction | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  const tag = event.target.tagName?.toUpperCase() ?? "";
  const typing =
    Boolean(event.target.isContentEditable) ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT";
  if (typing) return null;

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const space = key === " " || event.code === "Space";
  if (space || key === "n") {
    if (space && event.target.interactive) return null;
    return "generate";
  }
  if (key === "h") return "toggle-hidden";
  if (key === "c") return "copy";
  return null;
}

export function describeShortcutTarget(target: EventTarget | null): ShortcutTarget {
  if (!target || typeof target !== "object") return {};
  const element = target as Partial<HTMLElement> & { closest?: HTMLElement["closest"] };
  const interactive =
    typeof element.closest === "function"
      ? Boolean(
          element.closest(
            "button, a, summary, input, textarea, select, [role='button'], [role='tab'], [role='radio'], [contenteditable='true']",
          ),
        )
      : false;
  return {
    tagName: element.tagName,
    isContentEditable: Boolean(element.isContentEditable),
    interactive,
  };
}
