/**
 * Self-hosted OFL cursive/handwriting fonts for Handwriting Studio.
 * Files live in /public/fonts/cursive — see ATTRIBUTION.md and licenses/.
 */

export type CursiveFontCategory =
  | "elegant"
  | "casual"
  | "classic"
  | "calligraphy"
  | "signature"
  | "brush"
  | "decorative";

export interface CursiveFontDefinition {
  id: string;
  /** CSS font-family name registered at runtime */
  family: string;
  label: string;
  category: CursiveFontCategory;
  description: string;
  /** Public URL path to WOFF2 */
  woff2Path: string;
  licensePath: string;
  designer: string;
}

export const CURSIVE_FONTS: CursiveFontDefinition[] = [
  {
    id: "dancing-script",
    family: "WordMelo Dancing Script",
    label: "Dancing Script",
    category: "casual",
    description: "Friendly connected handwriting for everyday phrases",
    woff2Path: "/fonts/cursive/dancingscript.woff2",
    licensePath: "/fonts/cursive/licenses/dancingscript-OFL.txt",
    designer: "Impallari Type",
  },
  {
    id: "great-vibes",
    family: "WordMelo Great Vibes",
    label: "Great Vibes",
    category: "elegant",
    description: "Formal roundhand script for invitations and titles",
    woff2Path: "/fonts/cursive/greatvibes.woff2",
    licensePath: "/fonts/cursive/licenses/greatvibes-OFL.txt",
    designer: "TypeSETit / Robert Leuschke",
  },
  {
    id: "pacifico",
    family: "WordMelo Pacifico",
    label: "Pacifico",
    category: "brush",
    description: "Brush lettering with a modern, playful feel",
    woff2Path: "/fonts/cursive/pacifico.woff2",
    licensePath: "/fonts/cursive/licenses/pacifico-OFL.txt",
    designer: "Vernon Adams and contributors",
  },
  {
    id: "allura",
    family: "WordMelo Allura",
    label: "Allura",
    category: "decorative",
    description: "Flourished decorative script for display names",
    woff2Path: "/fonts/cursive/allura.woff2",
    licensePath: "/fonts/cursive/licenses/allura-OFL.txt",
    designer: "TypeSETit / Robert Leuschke",
  },
  {
    id: "sacramento",
    family: "WordMelo Sacramento",
    label: "Sacramento",
    category: "classic",
    description: "Classic monoline cursive with clean joins",
    woff2Path: "/fonts/cursive/sacramento.woff2",
    licensePath: "/fonts/cursive/licenses/sacramento-OFL.txt",
    designer: "TypeSETit / Brian J. Bonislawsky",
  },
  {
    id: "satisfy",
    family: "WordMelo Satisfy",
    label: "Satisfy",
    category: "signature",
    description: "Relaxed signature-style lettering",
    woff2Path: "/fonts/cursive/satisfy.woff2",
    licensePath: "/fonts/cursive/licenses/satisfy-OFL.txt",
    designer: "Sideshow",
  },
  {
    id: "alex-brush",
    family: "WordMelo Alex Brush",
    label: "Alex Brush",
    category: "calligraphy",
    description: "Calligraphic brush script for short phrases",
    woff2Path: "/fonts/cursive/alexbrush.woff2",
    licensePath: "/fonts/cursive/licenses/alexbrush-OFL.txt",
    designer: "TypeSETit / Robert Leuschke",
  },
];

export function getCursiveFont(id: string): CursiveFontDefinition | undefined {
  return CURSIVE_FONTS.find((font) => font.id === id);
}

export const DEFAULT_CURSIVE_FONT_ID = "dancing-script";

const loadedFamilies = new Set<string>();

/** Load a single self-hosted WOFF2 via the FontFace API (browser only). */
export async function loadCursiveFont(
  font: CursiveFontDefinition,
): Promise<void> {
  if (typeof document === "undefined") return;
  if (loadedFamilies.has(font.family)) {
    await document.fonts.load(`48px "${font.family}"`);
    return;
  }

  const face = new FontFace(font.family, `url(${font.woff2Path})`, {
    style: "normal",
    weight: "400",
    display: "swap",
  });

  try {
    const loaded = await face.load();
    document.fonts.add(loaded);
    loadedFamilies.add(font.family);
    await document.fonts.load(`48px "${font.family}"`);
  } catch (error) {
    throw new Error(
      `Could not load font “${font.label}”: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
}

export async function loadAllCursiveFonts(
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ ok: string[]; failed: string[] }> {
  const ok: string[] = [];
  const failed: string[] = [];
  let loaded = 0;
  for (const font of CURSIVE_FONTS) {
    try {
      await loadCursiveFont(font);
      ok.push(font.id);
    } catch {
      failed.push(font.id);
    }
    loaded += 1;
    onProgress?.(loaded, CURSIVE_FONTS.length);
  }
  return { ok, failed };
}

export function isCursiveFontLoaded(family: string): boolean {
  return loadedFamilies.has(family);
}

/** Test helper — clears the in-memory loaded set. */
export function resetCursiveFontLoadStateForTests(): void {
  loadedFamilies.clear();
}
