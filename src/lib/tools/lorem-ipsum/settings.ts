import { QUANTITY_LIMITS } from "./types";
import type {
  GenerationMode,
  ListItemLength,
  ListStyle,
  OutputFormat,
  ParagraphLength,
} from "./types";

const MODES = new Set<GenerationMode>([
  "paragraphs",
  "sentences",
  "words",
  "characters",
  "lists",
]);
const PARAGRAPH_LENGTHS = new Set<ParagraphLength>([
  "short",
  "medium",
  "long",
  "variable",
]);
const ITEM_LENGTHS = new Set<ListItemLength>(["short", "medium", "long"]);
const FORMATS = new Set<OutputFormat>(["plain", "html", "markdown"]);

export interface LoremShareSettings {
  mode: GenerationMode;
  quantity: number;
  paragraphLength: ParagraphLength;
  listStyle: ListStyle;
  listItemLength: ListItemLength;
  classicOpening: boolean;
  preferCompleteWords: boolean;
  textKind: "lorem" | "ui-english";
  format: OutputFormat;
  seed: number | null;
}

const MAX_SEED = 2147483647;

function clampAmount(mode: GenerationMode, value: number): number {
  const limits = QUANTITY_LIMITS[mode];
  return Math.min(limits.max, Math.max(limits.min, Math.floor(value)));
}

/** Read a settings link. Returns null when the query has no recognized fields. */
export function parseLoremSearch(search: string): LoremShareSettings | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if ([...params.keys()].length === 0) return null;

  const modeParam = params.get("mode");
  if (modeParam !== null && !MODES.has(modeParam as GenerationMode)) return null;
  const mode = (modeParam as GenerationMode | null) ?? "paragraphs";

  const amountParam = params.get("amount");
  const amount = amountParam === null ? QUANTITY_LIMITS[mode].default : Number(amountParam);
  if (amountParam !== null && !Number.isFinite(amount)) return null;

  const lengthParam = params.get("length");
  const paragraphLength: ParagraphLength =
    lengthParam && PARAGRAPH_LENGTHS.has(lengthParam as ParagraphLength)
      ? (lengthParam as ParagraphLength)
      : "medium";
  const listItemLength: ListItemLength =
    lengthParam && ITEM_LENGTHS.has(lengthParam as ListItemLength)
      ? (lengthParam as ListItemLength)
      : "medium";

  const listParam = params.get("list");
  const listStyle: ListStyle = listParam === "ol" ? "ordered" : "unordered";

  const formatParam = params.get("format");
  if (formatParam !== null && !FORMATS.has(formatParam as OutputFormat)) return null;

  const seedParam = params.get("seed");
  let seed: number | null = null;
  if (seedParam !== null && seedParam !== "") {
    const seedNumber = Number(seedParam);
    if (!Number.isInteger(seedNumber) || seedNumber < 0 || seedNumber > MAX_SEED) {
      return null;
    }
    seed = seedNumber;
  }

  const kind = params.get("kind");
  if (kind !== null && kind !== "lorem" && kind !== "ui") return null;

  const recognized = ["mode", "amount", "length", "list", "classic", "words", "format", "seed", "kind"];
  if (!recognized.some((key) => params.has(key))) return null;

  return {
    mode,
    quantity: clampAmount(mode, amount),
    paragraphLength,
    listStyle,
    listItemLength,
    classicOpening: params.get("classic") !== "0",
    preferCompleteWords: params.get("words") === "1",
    textKind: kind === "ui" ? "ui-english" : "lorem",
    format: (formatParam as OutputFormat | null) ?? "plain",
    seed,
  };
}

export function buildLoremSearch(settings: LoremShareSettings): string {
  const params = new URLSearchParams();
  params.set("mode", settings.mode);
  params.set("amount", String(settings.quantity));
  if (settings.mode === "paragraphs") params.set("length", settings.paragraphLength);
  if (settings.mode === "lists") {
    params.set("length", settings.listItemLength);
    params.set("list", settings.listStyle === "ordered" ? "ol" : "ul");
  }
  params.set("classic", settings.classicOpening ? "1" : "0");
  if (settings.preferCompleteWords) params.set("words", "1");
  if (settings.format !== "plain") params.set("format", settings.format);
  if (settings.textKind === "ui-english") params.set("kind", "ui");
  if (settings.seed !== null) params.set("seed", String(settings.seed));
  return params.toString();
}
