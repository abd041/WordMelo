"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Button } from "@/components/ui/Button";
import {
  CHARACTER_METRIC_LABEL,
  LOREM_PRESETS,
  QUANTITY_LIMITS,
  buildLoremSearch,
  createCryptoRandomInt,
  documentStatsText,
  downloadFilenameFor,
  generateLorem,
  mimeTypeFor,
  parseLoremSearch,
  presetsByGroup,
  serializeDocument,
  type GeneratedDocument,
  type GenerationMode,
  type HtmlExportMode,
  type ListItemLength,
  type ListStyle,
  type OutputFormat,
  type ParagraphLength,
} from "@/lib/tools/lorem-ipsum";
import {
  countCodePoints,
  countUtf16Units,
} from "@/lib/tools/character-counter/count";
import {
  countCharactersWithSpaces,
  countParagraphs,
  countSentences,
  countWords,
  tryCountGraphemes,
} from "@/lib/tools/word-counter/count";
import { cn, copyTextToClipboard } from "@/lib/utils";

type PreviewLayout = "article" | "landing" | "mobile" | "card";
type OutputView = "source" | "rendered";

const PREVIEW_LAYOUTS: Record<
  PreviewLayout,
  { label: string; maxWidth: string; align: "left" | "center" }
> = {
  article: { label: "Website Article", maxWidth: "42rem", align: "left" },
  landing: { label: "Landing Page", maxWidth: "36rem", align: "center" },
  mobile: { label: "Mobile Paragraph", maxWidth: "22rem", align: "left" },
  card: { label: "UI Card", maxWidth: "18rem", align: "left" },
};

const MODE_OPTIONS: Array<{ id: GenerationMode; label: string; hint: string }> =
  [
    { id: "paragraphs", label: "Paragraphs", hint: "Multi-sentence blocks" },
    { id: "sentences", label: "Sentences", hint: "Exact sentence count" },
    { id: "words", label: "Words", hint: "Exact word count" },
    {
      id: "characters",
      label: "Characters",
      hint: CHARACTER_METRIC_LABEL,
    },
    { id: "lists", label: "Lists", hint: "Bulleted or numbered items" },
  ];

const QUICK_VALUES: Record<GenerationMode, number[]> = {
  paragraphs: [1, 3, 5, 10, 20],
  sentences: [5, 10, 25, 50],
  words: [25, 50, 100, 250, 500],
  characters: [80, 160, 280, 500, 1000],
  lists: [3, 5, 8, 12],
};

function createInitialDocument(): GeneratedDocument {
  return generateLorem({
    mode: "paragraphs",
    quantity: 3,
    paragraphLength: "medium",
    classicOpening: true,
    seed: 1,
  });
}

export function LoremIpsumApp() {
  const quantityId = useId();
  const [mode, setMode] = useState<GenerationMode>("paragraphs");
  const [quantity, setQuantity] = useState(3);
  const [paragraphLength, setParagraphLength] =
    useState<ParagraphLength>("medium");
  const [classicOpening, setClassicOpening] = useState(true);
  const [preferCompleteWords, setPreferCompleteWords] = useState(false);
  const [textKind, setTextKind] = useState<"lorem" | "ui-english">("lorem");
  const [format, setFormat] = useState<OutputFormat>("plain");
  const [htmlMode, setHtmlMode] = useState<HtmlExportMode>("clean");
  const [outputView, setOutputView] = useState<OutputView>("source");
  const [document, setDocument] = useState<GeneratedDocument | null>(
    createInitialDocument,
  );
  const [listStyle, setListStyle] = useState<ListStyle>("unordered");
  const [listItemLength, setListItemLength] = useState<ListItemLength>("medium");
  const [seedInput, setSeedInput] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<PreviewLayout>("article");
  const [fontSize, setFontSize] = useState(17);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [paragraphGap, setParagraphGap] = useState(1.1);
  const [align, setAlign] = useState<"left" | "center" | "justify">("left");
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  useEffect(() => {
    const parsed = parseLoremSearch(window.location.search);
    if (!parsed) return;
    setMode(parsed.mode);
    setQuantity(parsed.quantity);
    setParagraphLength(parsed.paragraphLength);
    setListStyle(parsed.listStyle);
    setListItemLength(parsed.listItemLength);
    setClassicOpening(parsed.classicOpening);
    setPreferCompleteWords(parsed.preferCompleteWords);
    setTextKind(parsed.textKind);
    setFormat(parsed.format);
    setSeedInput(parsed.seed === null ? "" : String(parsed.seed));
    setDocument(
      generateLorem({
        mode: parsed.mode,
        quantity: parsed.quantity,
        paragraphLength: parsed.paragraphLength,
        listStyle: parsed.listStyle,
        listItemLength: parsed.listItemLength,
        classicOpening: parsed.classicOpening,
        preferCompleteWords: parsed.preferCompleteWords,
        textKind: parsed.textKind,
        seed: parsed.seed ?? undefined,
        randomInt: parsed.seed === null ? createCryptoRandomInt() : undefined,
      }),
    );
  }, []);

  useEffect(() => {
    if (!manualCopy) return;
    manualCopyRef.current?.focus();
    manualCopyRef.current?.select();
  }, [manualCopy]);

  const limits = QUANTITY_LIMITS[mode];

  const outputText = useMemo(
    () =>
      document ? serializeDocument(document, format, htmlMode) : "",
    [document, format, htmlMode],
  );

  const plainForStats = useMemo(
    () => (document ? documentStatsText(document) : ""),
    [document],
  );

  const stats = useMemo(() => {
    if (!plainForStats) {
      return {
        words: 0,
        chars: 0,
        sentences: 0,
        paragraphs: 0,
        utf16: 0,
        codePoints: 0,
        graphemes: null as number | null,
      };
    }
    const g = tryCountGraphemes(plainForStats);
    return {
      words: countWords(plainForStats),
      chars: countCharactersWithSpaces(plainForStats),
      sentences: countSentences(plainForStats),
      paragraphs: countParagraphs(plainForStats),
      utf16: countUtf16Units(plainForStats),
      codePoints: countCodePoints(plainForStats),
      graphemes: g.available ? g.count : null,
    };
  }, [plainForStats]);

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  function readSeed(): number | undefined {
    if (seedInput.trim() === "") return undefined;
    const value = Number(seedInput);
    if (!Number.isInteger(value) || value < 0 || value > 2147483647) return undefined;
    return value;
  }

  const seedValid =
    seedInput.trim() === "" || readSeed() !== undefined;
  const quantityValid =
    Number.isInteger(quantity) &&
    quantity >= limits.min &&
    quantity <= limits.max;

  function runGenerate(overrides?: {
    mode?: GenerationMode;
    quantity?: number;
    paragraphLength?: ParagraphLength;
    classicOpening?: boolean;
    textKind?: "lorem" | "ui-english";
    preferCompleteWords?: boolean;
  }) {
    const nextMode = overrides?.mode ?? mode;
    const nextQty = overrides?.quantity ?? quantity;
    const nextLimits = QUANTITY_LIMITS[nextMode];
    const clamped = Math.min(
      nextLimits.max,
      Math.max(nextLimits.min, Math.floor(nextQty) || nextLimits.min),
    );
    const seed = readSeed();
    const doc = generateLorem({
      mode: nextMode,
      quantity: clamped,
      paragraphLength: overrides?.paragraphLength ?? paragraphLength,
      classicOpening: overrides?.classicOpening ?? classicOpening,
      textKind: overrides?.textKind ?? textKind,
      preferCompleteWords:
        overrides?.preferCompleteWords ?? preferCompleteWords,
      listStyle,
      listItemLength,
      seed,
      randomInt: seed === undefined ? createCryptoRandomInt() : undefined,
    });
    setDocument(doc);
    setManualCopy(null);
    if (overrides?.textKind) setTextKind(overrides.textKind);
    showFeedback("Placeholder text generated", "success");
  }

  function applyPreset(id: string) {
    const preset = LOREM_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const opts = preset.options;
    const nextKind = opts.textKind ?? "lorem";
    setMode(opts.mode);
    setQuantity(opts.quantity);
    if (opts.paragraphLength) setParagraphLength(opts.paragraphLength);
    setClassicOpening(Boolean(opts.classicOpening));
    setPreferCompleteWords(Boolean(opts.preferCompleteWords));
    setTextKind(nextKind);
    setActivePreset(id);
    const seed = readSeed();
    const doc = generateLorem({
      ...opts,
      textKind: nextKind,
      seed,
      randomInt: seed === undefined ? createCryptoRandomInt() : undefined,
    });
    setDocument(doc);
    setManualCopy(null);
    showFeedback(`Preset: ${preset.label}`, "success");
  }

  function handleModeChange(next: GenerationMode) {
    setMode(next);
    setActivePreset(null);
    setTextKind("lorem");
    setQuantity((current) => {
      const nextLimits = QUANTITY_LIMITS[next];
      if (!Number.isInteger(current)) return nextLimits.default;
      return Math.min(nextLimits.max, Math.max(nextLimits.min, current));
    });
  }

  async function copySettingsLink() {
    const seed = readSeed() ?? null;
    const query = buildLoremSearch({
      mode,
      quantity: quantityValid ? quantity : limits.default,
      paragraphLength,
      listStyle,
      listItemLength,
      classicOpening,
      preferCompleteWords,
      textKind,
      format,
      seed,
    });
    const url = `${window.location.origin}/lorem-ipsum-generator?${query}`;
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setManualCopy(null);
      showFeedback("Settings link copied", "success");
    } else {
      setManualCopy(url);
      showFeedback(
        "Automatic copy was blocked. The settings link is selected below.",
        "error",
      );
    }
  }

  function handleClear() {
    setDocument(null);
    showFeedback("Output cleared", "neutral");
  }

  const layout = PREVIEW_LAYOUTS[previewLayout];
  const loremPresets = presetsByGroup("lorem");
  const uiPresets = presetsByGroup("ui");

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Presets */}
      <section className="space-y-3" aria-label="Presets">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Lorem Ipsum text
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {loremPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.description}
                aria-pressed={activePreset === preset.id}
                onClick={() => applyPreset(preset.id)}
                className={cn(
                  "min-h-11 rounded-control border px-3 py-2 text-left text-sm font-semibold shadow-soft transition-colors",
                  activePreset === preset.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink-muted hover:border-accent/40 hover:text-accent",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            English UI placeholder copy
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {uiPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.description}
                aria-pressed={activePreset === preset.id}
                onClick={() => applyPreset(preset.id)}
                className={cn(
                  "min-h-11 rounded-control border px-3 py-2 text-left text-sm font-semibold transition-colors",
                  activePreset === preset.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-paper text-ink-muted hover:border-accent/40 hover:text-accent",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.35fr)] lg:items-start lg:gap-6">
        {/* Controls */}
        <section className="rounded-[1.35rem] border border-line bg-surface p-4 shadow-soft sm:p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Placeholder text & typography studio
          </p>
          <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
            Generator controls
          </h2>

          <div
            role="radiogroup"
            aria-label="Generation mode"
            className="mt-4 grid grid-cols-2 gap-2"
          >
            {MODE_OPTIONS.map((opt) => {
              const selected = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleModeChange(opt.id)}
                  className={cn(
                    "rounded-control border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-accent bg-accent-soft text-accent shadow-soft"
                      : "border-line bg-paper text-ink hover:border-line-strong",
                  )}
                >
                  <span className="block text-sm font-semibold">{opt.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[0.75rem] leading-snug",
                      selected ? "text-accent" : "text-ink-muted",
                    )}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label
              htmlFor={quantityId}
              className="text-sm font-semibold text-ink"
            >
              Quantity ({limits.min}–{limits.max.toLocaleString("en-US")})
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                id={quantityId}
                type="number"
                inputMode="numeric"
                min={limits.min}
                max={limits.max}
                value={Number.isFinite(quantity) ? quantity : ""}
                aria-invalid={!quantityValid}
                onChange={(event) => {
                  setActivePreset(null);
                  const raw = event.target.value;
                  setQuantity(raw.trim() === "" ? Number.NaN : Number(raw));
                }}
                className="h-11 w-28 rounded-control border border-line bg-paper px-3 text-sm outline-none focus:border-accent"
              />
              <div className="flex flex-wrap gap-1.5">
                {QUICK_VALUES[mode].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setActivePreset(null);
                      setQuantity(n);
                    }}
                    className={cn(
                      "h-9 min-w-9 rounded-control border px-2.5 text-sm font-semibold",
                      quantity === n
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line text-ink-muted hover:text-ink",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {quantityValid ? null : (
              <p className="mt-2 text-sm text-danger" role="alert">
                Enter a whole number from {limits.min.toLocaleString("en-US")} to{" "}
                {limits.max.toLocaleString("en-US")}.
              </p>
            )}
          </div>

          {mode === "paragraphs" ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Paragraph length</p>
              <div
                role="radiogroup"
                aria-label="Paragraph length"
                className="mt-2 grid grid-cols-2 gap-2"
              >
                {(
                  [
                    ["short", "Short", "≈25–45 words"],
                    ["medium", "Medium", "≈50–90 words"],
                    ["long", "Long", "≈100–160 words"],
                    ["variable", "Variable", "Mixed lengths"],
                  ] as const
                ).map(([id, label, hint]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={paragraphLength === id}
                    onClick={() => setParagraphLength(id)}
                    className={cn(
                      "rounded-control border px-3 py-2 text-left",
                      paragraphLength === id
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-paper text-ink-muted",
                    )}
                  >
                    <span className="block text-sm font-semibold">{label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[0.75rem]",
                        paragraphLength === id ? "text-accent" : "text-ink-muted",
                      )}
                    >
                      {hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {mode === "lists" ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-ink">List type</p>
                <div role="radiogroup" aria-label="List type" className="mt-2 flex gap-2">
                  {(
                    [
                      ["unordered", "Bulleted"],
                      ["ordered", "Numbered"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={listStyle === id}
                      onClick={() => {
                        setActivePreset(null);
                        setListStyle(id);
                      }}
                      className={cn(
                        "min-h-11 rounded-control border px-3 text-sm font-semibold",
                        listStyle === id
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-paper text-ink-muted",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Item length</p>
                <div role="radiogroup" aria-label="List item length" className="mt-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      ["short", "Short"],
                      ["medium", "Medium"],
                      ["long", "Long"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={listItemLength === id}
                      onClick={() => {
                        setActivePreset(null);
                        setListItemLength(id);
                      }}
                      className={cn(
                        "min-h-11 rounded-control border px-2 text-sm font-semibold",
                        listItemLength === id
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-paper text-ink-muted",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {mode === "characters" ? (
            <div className="mt-5 space-y-2">
              <p className="text-xs text-ink-soft">{CHARACTER_METRIC_LABEL}</p>
              <label className="inline-flex items-start gap-2 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  checked={preferCompleteWords}
                  onChange={(e) => setPreferCompleteWords(e.target.checked)}
                  className="mt-0.5 rounded border-line"
                />
                <span>
                  Prefer complete words
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    May undershoot the target. Approximate length is never labeled
                    exact.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {textKind === "lorem" ? (
            <label className="mt-5 inline-flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={classicOpening}
                onChange={(e) => setClassicOpening(e.target.checked)}
                className="rounded border-line"
              />
              Start with classic Lorem Ipsum
            </label>
          ) : (
            <p className="mt-5 text-sm text-ink-soft">
              Active content type: English UI placeholder copy (not Lorem Ipsum).
              Change mode or pick a Lorem preset to switch back.
            </p>
          )}

          <div className="mt-5">
            <label htmlFor={`${quantityId}-seed`} className="text-sm font-semibold text-ink">
              Seed <span className="font-normal text-ink-soft">(optional)</span>
            </label>
            <input
              id={`${quantityId}-seed`}
              type="number"
              inputMode="numeric"
              min={0}
              max={2147483647}
              value={seedInput}
              placeholder="Random"
              aria-invalid={!seedValid}
              onChange={(event) => {
                setActivePreset(null);
                setSeedInput(event.target.value);
              }}
              className="mt-2 h-11 w-full rounded-control border border-line bg-paper px-3 text-sm outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-ink-soft">
              {seedValid
                ? "The same seed and settings always produce the same text. Leave blank for a new result each time."
                : "Use a whole number from 0 to 2,147,483,647, or leave the seed blank."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              size="lg"
              onClick={() => runGenerate()}
              disabled={!quantityValid || !seedValid}
            >
              Generate
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => runGenerate()}
              disabled={!document || !quantityValid || !seedValid}
            >
              Regenerate
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!document}
            >
              Clear
            </Button>
          </div>
        </section>

        {/* Output */}
        <section
          aria-labelledby="lorem-output-heading"
          className="rounded-[1.35rem] border border-accent/20 bg-surface p-4 shadow-soft sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent">
                Generated output
              </p>
              <h2
                id="lorem-output-heading"
                className="mt-0.5 font-display text-xl font-semibold text-ink"
              >
                Placeholder text
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton
                text={outputText}
                disabled={!outputText}
                label="Copy all"
                onFailed={() => setManualCopy(outputText)}
                onFeedback={(message, tone) => {
                  if (tone !== "error") setManualCopy(null);
                  showFeedback(message, tone ?? "neutral");
                }}
              />
              <DownloadButton
                text={outputText}
                filename={downloadFilenameFor(format)}
                label={
                  format === "html"
                    ? "Download HTML"
                    : format === "markdown"
                      ? "Download MD"
                      : "Download TXT"
                }
                mimeType={mimeTypeFor(format)}
                disabled={!outputText}
                onFeedback={(message, tone) =>
                  showFeedback(message, tone ?? "neutral")
                }
              />
              <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={copySettingsLink}>
                Copy link
              </Button>
            </div>
          </div>

          {feedback ? (
            <div className="mt-3">
              <FeedbackMessage
                message={feedback.message}
                tone={feedback.tone}
                onDismiss={() => setFeedback(null)}
              />
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Output format"
              className="inline-flex rounded-control border border-line bg-paper p-1"
            >
              {(
                [
                  ["plain", "Plain text"],
                  ["html", "HTML"],
                  ["markdown", "Markdown"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={format === id}
                  onClick={() => {
                    setFormat(id);
                    setOutputView("source");
                  }}
                  className={cn(
                    "min-h-11 rounded-[0.55rem] px-3 text-sm font-semibold",
                    format === id
                      ? "bg-accent text-accent-foreground"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {format !== "plain" ? (
              <div
                role="radiogroup"
                aria-label="Source or rendered view"
                className="inline-flex rounded-control border border-line bg-paper p-1"
              >
                {(
                  [
                    ["source", "Code view"],
                    ["rendered", "Rendered preview"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={outputView === id}
                    onClick={() => setOutputView(id)}
                    className={cn(
                      "rounded-[0.55rem] px-2.5 py-1.5 text-xs font-semibold",
                      outputView === id
                        ? "bg-mint text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {format === "html" ? (
            <div
              role="radiogroup"
              aria-label="HTML export style"
              className="mt-2 inline-flex rounded-control border border-line bg-paper p-1"
            >
              {(
                [
                  ["clean", "Clean HTML"],
                  ["styled", "Styled HTML"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={htmlMode === id}
                  onClick={() => setHtmlMode(id)}
                  className={cn(
                    "rounded-[0.55rem] px-2.5 py-1.5 text-xs font-semibold",
                    htmlMode === id
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
            {stats.words.toLocaleString("en-US")} words ·{" "}
            {stats.chars.toLocaleString("en-US")} characters ·{" "}
            {stats.sentences.toLocaleString("en-US")} sentences ·{" "}
            {stats.paragraphs.toLocaleString("en-US")} paragraphs
            {mode === "characters" || document?.mode === "characters"
              ? ` · UTF-16 ${stats.utf16.toLocaleString("en-US")} · code points ${stats.codePoints.toLocaleString("en-US")}${stats.graphemes != null ? ` · graphemes ${stats.graphemes.toLocaleString("en-US")}` : ""}`
              : ""}
            {document?.classicOpeningAbbreviated
              ? " · Classic opening abbreviated to fit quantity"
              : ""}
            {document?.preferCompleteWords &&
            document.actualUtf16Length != null &&
            !document.exactUtf16
              ? ` · Approximate length ${document.actualUtf16Length} (target ${document.requestedQuantity})`
              : ""}
            {document?.textKind === "ui-english"
              ? " · English UI copy (not Lorem Ipsum)"
              : ""}
            {document?.mode === "lists"
              ? ` · ${document.paragraphs.length} list items`
              : ""}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Counts describe the placeholder text. HTML and Markdown markup are not included.
          </p>

          {manualCopy ? (
            <div className="mt-3">
              <p id="lorem-manual-copy" role="status" className="text-sm text-danger">
                Automatic copy was blocked. This text is selected so you can copy it yourself.
              </p>
              <textarea
                ref={manualCopyRef}
                readOnly
                aria-labelledby="lorem-manual-copy"
                value={manualCopy}
                rows={4}
                className="mt-2 w-full resize-y rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink"
              />
            </div>
          ) : null}

          {outputView === "rendered" && format !== "plain" && document ? (
            <div
              className={cn(
                "mt-3 overflow-auto rounded-[1.1rem] border border-line bg-mint/15 px-4 py-4 font-sans text-base leading-7 text-ink",
                outputExpanded ? "max-h-[40rem]" : "max-h-[22rem]",
              )}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Rendered preview
              </p>
              {document.mode === "lists" ? (
                document.listStyle === "ordered" ? (
                  <ol className="list-decimal space-y-2 pl-5">
                    {document.paragraphs.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc space-y-2 pl-5">
                    {document.paragraphs.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )
              ) : (
                document.paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          ) : (
            <pre
              className={cn(
                "mt-3 overflow-auto whitespace-pre-wrap break-words rounded-[1.1rem] border border-line bg-mint/20 px-4 py-4 font-sans text-[0.95rem] leading-7 text-ink sm:text-base sm:leading-7",
                outputExpanded ? "max-h-[40rem]" : "max-h-[22rem]",
                format !== "plain" && "font-mono text-[0.82rem] sm:text-sm",
              )}
            >
              {outputText || (
                <span className="text-ink-soft">
                  Press Generate for placeholder text.
                </span>
              )}
            </pre>
          )}

          <button
            type="button"
            className="mt-2 text-sm font-semibold text-accent underline-offset-2 hover:underline"
            onClick={() => setOutputExpanded((v) => !v)}
          >
            {outputExpanded ? "Collapse output" : "Expand output"}
          </button>
        </section>
      </div>

      {/* Typography preview — open by default */}
      <section className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
          aria-expanded={previewOpen}
          onClick={() => setPreviewOpen((o) => !o)}
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Typography preview studio
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Adjust layout look without changing generated words
            </p>
          </div>
          <span aria-hidden className="text-lg text-ink-muted">
            {previewOpen ? "−" : "+"}
          </span>
        </button>
        {previewOpen ? (
          <div className="space-y-4 border-t border-line px-4 py-4 sm:px-5">
            <div
              role="radiogroup"
              aria-label="Preview layout"
              className="flex flex-wrap gap-2"
            >
              {(Object.keys(PREVIEW_LAYOUTS) as PreviewLayout[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={previewLayout === id}
                  onClick={() => setPreviewLayout(id)}
                  className={cn(
                    "rounded-control border px-3 py-2 text-sm font-semibold",
                    previewLayout === id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-muted",
                  )}
                >
                  {PREVIEW_LAYOUTS[id].label}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => {
                  setPreviewLayout("article");
                  setFontSize(17);
                  setLineHeight(1.7);
                  setParagraphGap(1.1);
                  setAlign("left");
                }}
              >
                Reset preview
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm text-ink-muted">
                Font size ({fontSize}px)
                <input
                  type="range"
                  min={14}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <label className="text-sm text-ink-muted">
                Line height ({lineHeight.toFixed(2)})
                <input
                  type="range"
                  min={140}
                  max={200}
                  value={Math.round(lineHeight * 100)}
                  onChange={(e) =>
                    setLineHeight(Number(e.target.value) / 100)
                  }
                  className="mt-1 w-full"
                />
              </label>
              <label className="text-sm text-ink-muted">
                Paragraph gap ({paragraphGap.toFixed(1)}em)
                <input
                  type="range"
                  min={60}
                  max={180}
                  value={Math.round(paragraphGap * 100)}
                  onChange={(e) =>
                    setParagraphGap(Number(e.target.value) / 100)
                  }
                  className="mt-1 w-full"
                />
              </label>
              <div>
                <p className="text-sm text-ink-muted">Alignment</p>
                <div
                  role="radiogroup"
                  aria-label="Text alignment"
                  className="mt-1 flex gap-1"
                >
                  {(["left", "center", "justify"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={align === a}
                      onClick={() => setAlign(a)}
                      className={cn(
                        "rounded-control border px-2.5 py-1.5 text-xs font-semibold capitalize",
                        align === a
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line text-ink-muted",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="rounded-[1.1rem] border border-line bg-paper px-4 py-5 sm:px-6"
              style={{
                maxWidth: layout.maxWidth,
                marginInline:
                  layout.align === "center" || align === "center"
                    ? "auto"
                    : undefined,
              }}
            >
              <div
                className="font-serif text-ink"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight,
                  textAlign: align,
                }}
              >
                {document?.mode === "lists" ? (
                  document.listStyle === "ordered" ? (
                    <ol className="list-decimal pl-5">
                      {document.paragraphs.map((item, index) => (
                        <li key={index} style={{ marginTop: index === 0 ? 0 : `${paragraphGap}em` }}>
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="list-disc pl-5">
                      {document.paragraphs.map((item, index) => (
                        <li key={index} style={{ marginTop: index === 0 ? 0 : `${paragraphGap}em` }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  (document?.paragraphs ?? []).map((p, i) => (
                    <p
                      key={i}
                      style={{
                        marginTop: i === 0 ? 0 : `${paragraphGap}em`,
                      }}
                    >
                      {p}
                    </p>
                  ))
                )}
                {!document ? (
                  <p className="text-ink-soft">Generate text to preview.</p>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-ink-soft">
              Preview styling is visual only. Plain TXT does not keep typography.
              Choose Styled HTML if you want basic CSS in the HTML download.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
