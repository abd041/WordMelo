import type { LimitPreset } from "./types";

/**
 * Generic length presets only.
 * Platform-branded limits (X, Instagram, LinkedIn, YouTube) are omitted because
 * several platforms use weighted or exception-based counting (URLs, emoji, CJK,
 * media) that a simple grapheme/code-point/UTF-16 meter cannot guarantee.
 *
 * Verification note (2026-11-04): X free posts are commonly 280 with weighted
 * rules; Instagram API captions cite 2200 — neither maps cleanly to a single
 * WordMelo metric without false publishing guarantees.
 */
export const LIMIT_PRESETS: LimitPreset[] = [
  {
    id: "100",
    label: "100",
    limit: 100,
    blurb: "Short note or tight microcopy.",
    kind: "generic",
  },
  {
    id: "160",
    label: "160",
    limit: 160,
    blurb: "Common SMS-era drafting length.",
    kind: "generic",
  },
  {
    id: "280",
    label: "280",
    limit: 280,
    blurb: "Generic short-form draft length.",
    kind: "generic",
  },
  {
    id: "500",
    label: "500",
    limit: 500,
    blurb: "Medium caption or blurb draft.",
    kind: "generic",
  },
  {
    id: "1000",
    label: "1,000",
    limit: 1000,
    blurb: "Longer description draft.",
    kind: "generic",
  },
  {
    id: "2200",
    label: "2,200",
    limit: 2200,
    blurb: "Long caption-style draft length.",
    kind: "generic",
  },
  {
    id: "seo-title",
    label: "SEO title draft",
    limit: 60,
    blurb: "Rough title drafting guide — Google truncates by pixels, not a fixed count.",
    kind: "seo-guide",
  },
  {
    id: "seo-meta",
    label: "Meta description draft",
    limit: 160,
    blurb: "Rough snippet drafting guide — display varies by query and device.",
    kind: "seo-guide",
  },
];

export function getPreset(id: string): LimitPreset | undefined {
  return LIMIT_PRESETS.find((p) => p.id === id);
}
