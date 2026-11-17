import { splitGraphemes } from "./graphemes";
import { getFancyStyleById } from "./styles";

export interface PlatformPreview {
  id: string;
  label: string;
  styleId: string;
  /** Typical field length. Null means no common cap to hint about. */
  limit: number | null;
  note: string;
}

export const PLATFORM_PREVIEWS: readonly PlatformPreview[] = [
  {
    id: "instagram",
    label: "Instagram bio",
    styleId: "script",
    limit: 150,
    note: "Instagram bios are often limited to 150 characters. Phones differ in which glyphs they can draw.",
  },
  {
    id: "tiktok",
    label: "TikTok name",
    styleId: "bold-sans",
    limit: 30,
    note: "TikTok display names are short, and some special characters are rejected.",
  },
  {
    id: "discord",
    label: "Discord nickname",
    styleId: "fraktur",
    limit: 32,
    note: "Discord nicknames are usually capped at 32 characters.",
  },
  {
    id: "gaming",
    label: "Gaming name",
    styleId: "double-struck",
    limit: 16,
    note: "Many games allow only plain letters, numbers, and a few symbols.",
  },
  {
    id: "general",
    label: "General text",
    styleId: "bold-serif",
    limit: null,
    note: "A general preview. The same characters can look different in each app.",
  },
];

export interface RenderedPreview {
  output: string;
  styleName: string;
  styleId: string;
  limit: number | null;
  count: number;
  overLimit: boolean;
  note: string;
  label: string;
}

export function renderPlatformPreview(
  text: string,
  platformId: string,
  styleId?: string,
): RenderedPreview {
  const platform =
    PLATFORM_PREVIEWS.find((item) => item.id === platformId) ??
    PLATFORM_PREVIEWS[PLATFORM_PREVIEWS.length - 1]!;
  const style =
    getFancyStyleById(styleId || platform.styleId) ??
    getFancyStyleById(platform.styleId);
  const output = style ? style.transform(text) : text;
  const count = splitGraphemes(output).length;
  return {
    output,
    styleName: style?.name ?? "Plain",
    styleId: style?.id ?? platform.styleId,
    limit: platform.limit,
    count,
    overLimit: platform.limit !== null && count > platform.limit,
    note: platform.note,
    label: platform.label,
  };
}

export const NAME_FRAMES = [
  { id: "none", label: "No decoration", prefix: "", suffix: "" },
  { id: "stars", label: "Stars", prefix: "★ ", suffix: " ★" },
  { id: "sparkle", label: "Sparkle", prefix: "✦ ", suffix: " ✦" },
  { id: "brackets", label: "White brackets", prefix: "『", suffix: "』" },
  { id: "lenticular", label: "Lenticular brackets", prefix: "【", suffix: "】" },
  { id: "hearts", label: "Hearts", prefix: "♥ ", suffix: " ♥" },
] as const;

export type NameFrameId = (typeof NAME_FRAMES)[number]["id"];

/** First non-empty line, trimmed. Names should not swallow a whole caption. */
export function nameSourceLine(text: string): string {
  const line = text
    .split(/\r?\n/)
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  return line ?? "";
}

export function buildStyledName(
  text: string,
  styleId: string,
  frameId: string,
): string {
  const source = nameSourceLine(text);
  if (!source) return "";
  const style = getFancyStyleById(styleId);
  const styled = style ? style.transform(source) : source;
  const frame = NAME_FRAMES.find((item) => item.id === frameId) ?? NAME_FRAMES[0];
  return `${frame.prefix}${styled}${frame.suffix}`;
}
