"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  CURSIVE_FONTS,
  CURSIVE_SAMPLE_NAME,
  DEFAULT_CURSIVE_FONT_ID,
  DEFAULT_HANDWRITING_OPTIONS,
  HANDWRITING_BACKGROUNDS,
  HANDWRITING_COLORS,
  HANDWRITING_PRESETS,
  PNG_DOWNLOAD_FILENAME,
  downloadBlob,
  getCursiveFont,
  loadCursiveFont,
  renderHandwritingPngBlob,
  type HandwritingAlign,
  type HandwritingBackgroundId,
  type HandwritingLayout,
} from "@/lib/tools/cursive-generator";
import { cn } from "@/lib/utils";

interface CursiveHandwritingStudioProps {
  text: string;
  onTextChange: (value: string) => void;
}

type ExportQuality = "standard" | "high";

function previewSnippet(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Preview";
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 28)}…`;
}

export function CursiveHandwritingStudio({
  text,
  onTextChange,
}: CursiveHandwritingStudioProps) {
  const previewId = useId();
  const [fontId, setFontId] = useState(DEFAULT_CURSIVE_FONT_ID);
  const [fontSize, setFontSize] = useState(DEFAULT_HANDWRITING_OPTIONS.fontSize);
  const [color, setColor] = useState(DEFAULT_HANDWRITING_OPTIONS.color);
  const [backgroundId, setBackgroundId] = useState<HandwritingBackgroundId>(
    DEFAULT_HANDWRITING_OPTIONS.backgroundId,
  );
  const [align, setAlign] = useState<HandwritingAlign>(
    DEFAULT_HANDWRITING_OPTIONS.align,
  );
  const [letterSpacing, setLetterSpacing] = useState(
    DEFAULT_HANDWRITING_OPTIONS.letterSpacing,
  );
  const [lineHeight, setLineHeight] = useState(
    DEFAULT_HANDWRITING_OPTIONS.lineHeight,
  );
  const [padding, setPadding] = useState(DEFAULT_HANDWRITING_OPTIONS.padding);
  const [layout, setLayout] = useState<HandwritingLayout>(
    DEFAULT_HANDWRITING_OPTIONS.layout,
  );
  const [quality, setQuality] = useState<ExportQuality>("high");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [fontsFailed, setFontsFailed] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const primary = getCursiveFont(DEFAULT_CURSIVE_FONT_ID);
      if (primary) {
        try {
          await loadCursiveFont(primary);
          if (!cancelled) {
            setLoadedFonts((prev) => new Set(prev).add(primary.id));
          }
        } catch {
          if (!cancelled) setFontsFailed([primary.id]);
        }
      }

      for (const font of CURSIVE_FONTS) {
        if (font.id === DEFAULT_CURSIVE_FONT_ID) continue;
        try {
          await loadCursiveFont(font);
          if (!cancelled) {
            setLoadedFonts((prev) => new Set(prev).add(font.id));
          }
        } catch {
          if (!cancelled) {
            setFontsFailed((prev) =>
              prev.includes(font.id) ? prev : [...prev, font.id],
            );
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fontsReady = loadedFonts.size > 0;
  const activeFont = useMemo(
    () => CURSIVE_FONTS.find((font) => font.id === fontId) ?? CURSIVE_FONTS[0]!,
    [fontId],
  );

  const backgroundFill =
    HANDWRITING_BACKGROUNDS.find((item) => item.id === backgroundId)?.fill ??
    "#ffffff";

  const previewStyle = useMemo(
    () => ({
      fontFamily: `"${activeFont.family}", cursive`,
      fontSize: `${fontSize}px`,
      color,
      letterSpacing: `${letterSpacing}px`,
      lineHeight,
      textAlign: align as CanvasTextAlign,
      padding: `${padding}px`,
      backgroundColor:
        backgroundId === "transparent"
          ? "transparent"
          : (backgroundFill ?? undefined),
      backgroundImage:
        backgroundId === "transparent"
          ? "linear-gradient(45deg,#e8e8e8 25%,transparent 25%),linear-gradient(-45deg,#e8e8e8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e8e8 75%),linear-gradient(-45deg,transparent 75%,#e8e8e8 75%)"
          : undefined,
      backgroundSize: backgroundId === "transparent" ? "16px 16px" : undefined,
      backgroundPosition:
        backgroundId === "transparent"
          ? "0 0, 0 8px, 8px -8px, -8px 0"
          : undefined,
    }),
    [
      activeFont.family,
      fontSize,
      color,
      letterSpacing,
      lineHeight,
      align,
      padding,
      backgroundId,
      backgroundFill,
    ],
  );

  function applyPreset(presetId: string) {
    const preset = HANDWRITING_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setActivePreset(preset.id);
    setFontId(preset.fontId);
    setFontSize(preset.fontSize);
    setColor(preset.color);
    setBackgroundId(preset.backgroundId);
    setAlign(preset.align);
    setLetterSpacing(preset.letterSpacing);
    setLineHeight(preset.lineHeight);
    setPadding(preset.padding);
    setLayout(preset.layout);
    const font = getCursiveFont(preset.fontId);
    if (font) {
      void loadCursiveFont(font).then(() => {
        setLoadedFonts((prev) => new Set(prev).add(font.id));
      });
    }
    setFeedback({ message: `Applied “${preset.label}”`, tone: "success" });
  }

  function resetDesign() {
    setActivePreset(null);
    setFontId(DEFAULT_CURSIVE_FONT_ID);
    setFontSize(DEFAULT_HANDWRITING_OPTIONS.fontSize);
    setColor(DEFAULT_HANDWRITING_OPTIONS.color);
    setBackgroundId(DEFAULT_HANDWRITING_OPTIONS.backgroundId);
    setAlign(DEFAULT_HANDWRITING_OPTIONS.align);
    setLetterSpacing(DEFAULT_HANDWRITING_OPTIONS.letterSpacing);
    setLineHeight(DEFAULT_HANDWRITING_OPTIONS.lineHeight);
    setPadding(DEFAULT_HANDWRITING_OPTIONS.padding);
    setLayout(DEFAULT_HANDWRITING_OPTIONS.layout);
    setQuality("high");
    setFeedback({ message: "Design settings reset", tone: "neutral" });
  }

  async function handleDownload() {
    if (!text.trim()) {
      setFeedback({ message: "Enter text before downloading", tone: "neutral" });
      return;
    }
    setExporting(true);
    setFeedback({ message: "Preparing PNG…", tone: "neutral" });
    try {
      await loadCursiveFont(activeFont);
      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2;
      const pixelRatio =
        quality === "high" ? Math.min(3, Math.max(2, dpr)) : Math.min(2, dpr);
      const { blob, meta } = await renderHandwritingPngBlob({
        text,
        fontId,
        fontSize,
        color,
        backgroundId,
        align,
        letterSpacing,
        lineHeight,
        padding,
        layout,
        pixelRatio,
      });
      downloadBlob(PNG_DOWNLOAD_FILENAME, blob);
      setFeedback({
        message: meta.clipped
          ? "Downloaded PNG (some content may be clipped at max size)"
          : `Downloaded ${quality === "high" ? "high-resolution" : "standard"} PNG`,
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Could not export PNG in this browser",
        tone: "error",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <section
        aria-labelledby="handwriting-input-heading"
        className="overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-mint/30 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="handwriting-input-heading"
              className="font-sans text-base font-semibold text-ink"
            >
              Handwriting Studio
            </h2>
            <p className="text-xs text-ink-soft">
              Preview uses the same OFL font files as PNG export. Checkerboard
              means transparent — it is not baked into the file.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onTextChange(CURSIVE_SAMPLE_NAME)}
            >
              Sample name
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={resetDesign}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset design
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <label htmlFor={`${previewId}-text`} className="sr-only">
            Text for handwriting preview
          </label>
          <textarea
            id={`${previewId}-text`}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            rows={3}
            placeholder="Name, phrase, or short note…"
            className="w-full resize-y rounded-control border border-line bg-paper px-3 py-3 font-serif text-base leading-relaxed text-ink outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          />
        </div>
      </section>

      {!fontsReady ? (
        <p className="flex items-center gap-2 text-sm text-ink-muted" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading handwriting fonts…
        </p>
      ) : null}

      <section aria-labelledby="presets-heading" className="space-y-2">
        <h3
          id="presets-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft"
        >
          Design presets
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {HANDWRITING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={activePreset === preset.id}
              title={preset.description}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                activePreset === preset.id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line bg-paper text-ink hover:bg-mint/50",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="font-picker-heading" className="space-y-2">
        <h3
          id="font-picker-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft"
        >
          Cursive fonts
        </h3>
        <div
          role="listbox"
          aria-label="Handwriting font"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {CURSIVE_FONTS.map((font) => {
            const selected = font.id === fontId;
            const failed = fontsFailed.includes(font.id);
            const loaded = loadedFonts.has(font.id);
            return (
              <button
                key={font.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={failed}
                onClick={() => {
                  setActivePreset(null);
                  setFontId(font.id);
                  void loadCursiveFont(font)
                    .then(() =>
                      setLoadedFonts((prev) => new Set(prev).add(font.id)),
                    )
                    .catch(() => {
                      setFeedback({
                        message: `Could not load ${font.label}`,
                        tone: "error",
                      });
                    });
                }}
                className={cn(
                  "rounded-[1rem] border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-accent bg-accent-soft shadow-soft"
                    : "border-line bg-paper hover:border-line-strong hover:bg-mint/40",
                  failed && "opacity-50",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">
                    {font.label}
                  </span>
                  {!loaded && !failed ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-ink-soft"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span
                  className="mt-2 block truncate text-[1.65rem] leading-tight text-ink"
                  style={{
                    fontFamily: loaded
                      ? `"${font.family}", cursive`
                      : "Georgia, serif",
                  }}
                >
                  {previewSnippet(text)}
                </span>
                <span className="mt-1 block text-[0.7rem] text-ink-soft">
                  {font.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_20rem]">
        <section
          aria-labelledby="live-preview-heading"
          className="overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <h3
                id="live-preview-heading"
                className="font-sans text-sm font-semibold text-ink"
              >
                Live preview · {activeFont.label}
              </h3>
              <p className="text-xs text-ink-soft">
                Exact font size shown — scroll if the phrase is wide.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div
                role="group"
                aria-label="PNG resolution"
                className="inline-flex rounded-control border border-line p-0.5"
              >
                {(
                  [
                    ["standard", "Standard"],
                    ["high", "High-res"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={quality === id}
                    onClick={() => setQuality(id)}
                    className={cn(
                      "rounded-[0.55rem] px-2.5 py-1 text-xs font-semibold",
                      quality === id
                        ? "bg-mint text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={exporting || !text.trim() || !fontsReady}
                onClick={() => void handleDownload()}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                Download PNG
              </Button>
            </div>
          </div>
          <div
            className="min-h-[14rem] overflow-auto"
            style={{
              backgroundColor:
                backgroundId === "transparent" ? "#f0f0f0" : undefined,
            }}
          >
            <div
              id={previewId}
              role="img"
              aria-label={`Handwriting preview in ${activeFont.label}`}
              className={cn(
                "mx-auto w-full max-w-full whitespace-pre-wrap break-words",
                layout === "square" && "aspect-square max-w-xl",
                layout === "landscape" && "aspect-video max-w-4xl",
                layout === "portrait" && "aspect-[3/4] max-w-md",
              )}
              style={previewStyle}
            >
              {text.trim() ? text : "Your cursive writing appears here"}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="design-controls-heading"
          className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft"
        >
          <h3
            id="design-controls-heading"
            className="font-sans text-sm font-semibold text-ink"
          >
            Design controls
          </h3>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Typography
          </p>
          <label className="mt-2 block text-xs font-medium text-ink-muted">
            Font size ({fontSize}px)
            <input
              type="range"
              min={28}
              max={120}
              value={fontSize}
              onChange={(event) => {
                setActivePreset(null);
                setFontSize(Number(event.target.value));
              }}
              className="mt-1 w-full accent-[var(--accent)]"
            />
          </label>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Appearance
          </p>
          <fieldset className="mt-2">
            <legend className="text-xs font-medium text-ink-muted">
              Text color
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {HANDWRITING_COLORS.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  aria-label={swatch.label}
                  aria-pressed={color === swatch.value}
                  onClick={() => {
                    setActivePreset(null);
                    setColor(swatch.value);
                  }}
                  className={cn(
                    "h-8 w-8 rounded-full border-2",
                    color === swatch.value ? "border-accent" : "border-line",
                  )}
                  style={{ backgroundColor: swatch.value }}
                />
              ))}
              <label className="inline-flex items-center gap-1 text-xs text-ink-soft">
                Custom
                <input
                  type="color"
                  value={color}
                  aria-label="Custom text color"
                  onChange={(event) => {
                    setActivePreset(null);
                    setColor(event.target.value);
                  }}
                  className="h-8 w-10 cursor-pointer rounded border border-line bg-paper"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-ink-muted">
              Background
            </legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {HANDWRITING_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  aria-pressed={backgroundId === bg.id}
                  onClick={() => {
                    setActivePreset(null);
                    setBackgroundId(bg.id);
                  }}
                  className={cn(
                    "rounded-control border px-2.5 py-1.5 text-xs font-medium",
                    backgroundId === bg.id
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line bg-paper text-ink-muted",
                  )}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Layout
          </p>
          <fieldset className="mt-2">
            <legend className="text-xs font-medium text-ink-muted">
              Alignment
            </legend>
            <div className="mt-2 flex gap-1.5">
              {(
                [
                  ["left", AlignLeft, "Left"],
                  ["center", AlignCenter, "Center"],
                  ["right", AlignRight, "Right"],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  aria-pressed={align === value}
                  onClick={() => {
                    setActivePreset(null);
                    setAlign(value);
                  }}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-control border",
                    align === value
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-line bg-paper text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-ink-muted">
              Image layout
            </legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["auto", "Auto-fit"],
                  ["square", "Square"],
                  ["landscape", "Landscape"],
                  ["portrait", "Portrait"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={layout === value}
                  onClick={() => {
                    setActivePreset(null);
                    setLayout(value);
                  }}
                  className={cn(
                    "rounded-control border px-2.5 py-1.5 text-xs font-medium",
                    layout === value
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line bg-paper text-ink-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
            className="mt-4 inline-flex w-full items-center justify-between rounded-control border border-line bg-paper px-3 py-2 text-left text-xs font-semibold text-ink"
          >
            Advanced spacing
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                advancedOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {advancedOpen ? (
            <div className="mt-3 space-y-3">
              <label className="block text-xs font-medium text-ink-muted">
                Letter spacing ({letterSpacing}px)
                <input
                  type="range"
                  min={-2}
                  max={12}
                  value={letterSpacing}
                  onChange={(event) => {
                    setActivePreset(null);
                    setLetterSpacing(Number(event.target.value));
                  }}
                  className="mt-1 w-full accent-[var(--accent)]"
                />
              </label>
              <label className="block text-xs font-medium text-ink-muted">
                Line height ({lineHeight.toFixed(2)})
                <input
                  type="range"
                  min={1}
                  max={2.2}
                  step={0.05}
                  value={lineHeight}
                  onChange={(event) => {
                    setActivePreset(null);
                    setLineHeight(Number(event.target.value));
                  }}
                  className="mt-1 w-full accent-[var(--accent)]"
                />
              </label>
              <label className="block text-xs font-medium text-ink-muted">
                Padding ({padding}px)
                <input
                  type="range"
                  min={16}
                  max={96}
                  value={padding}
                  onChange={(event) => {
                    setActivePreset(null);
                    setPadding(Number(event.target.value));
                  }}
                  className="mt-1 w-full accent-[var(--accent)]"
                />
              </label>
            </div>
          ) : null}
        </section>
      </div>

      {feedback ? (
        <FeedbackMessage tone={feedback.tone} message={feedback.message} />
      ) : null}
    </div>
  );
}
