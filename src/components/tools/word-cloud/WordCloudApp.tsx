"use client";

import { useMemo, useState } from "react";
import { buildCloud, type CloudBuild } from "@/lib/tools/word-cloud/build";
import { MAX_INPUT_CHARS, textStats } from "@/lib/tools/word-cloud/analyze";
import { layoutSignature, DEFAULT_SEED, DEFAULT_SETTINGS } from "@/lib/tools/word-cloud/defaults";
import { effectiveFontWeight, FONT_PRESETS } from "@/lib/tools/word-cloud/fonts";
import { assignColorIndexes, fitMessage, frequencySummary } from "@/lib/tools/word-cloud/layout";
import {
  PALETTES,
  lowContrastColors,
  paletteById,
  parseHexColor,
} from "@/lib/tools/word-cloud/palettes";
import { downloadBlob, renderWordCloudPng } from "@/lib/tools/word-cloud/raster";
import { SAMPLE_TEXT } from "@/lib/tools/word-cloud/sample";
import {
  CLOUD_ALIGNS,
  CLOUD_ASPECTS,
  CLOUD_FONTS,
  CLOUD_ROTATIONS,
  CLOUD_SHAPES,
  type CloudAspect,
  type CloudSettings,
  type CloudShape,
} from "@/lib/tools/word-cloud/types";
import {
  PNG_FILENAME,
  SVG_FILENAME,
  buildWordCloudSvg,
  canCopyImage,
  fillForWord,
} from "@/lib/tools/word-cloud/svg";
import { cn, downloadTextFile } from "@/lib/utils";

const SHAPE_LABELS: Record<CloudShape, string> = {
  rectangle: "Rectangle",
  circle: "Circle",
  heart: "Heart",
  diamond: "Diamond",
  oval: "Oval",
};

const ASPECT_LABELS: Record<CloudAspect, string> = {
  square: "Square 1:1",
  landscape: "Landscape 16:9",
  presentation: "Presentation 4:3",
  portrait: "Portrait 3:4",
  pinterest: "Pinterest 2:3",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink";

function validate(settings: CloudSettings, seedInput: string): string | null {
  const checks: Array<[number, number, number, string]> = [
    [settings.minLength, 1, 20, "Minimum word length must be from 1 to 20."],
    [settings.minFrequency, 1, 20, "Minimum frequency must be from 1 to 20."],
    [settings.maxWords, 10, 200, "Show between 10 and 200 words."],
    [settings.minFont, 10, 64, "Minimum size must be from 10 to 64."],
    [settings.maxFont, 18, 140, "Maximum size must be from 18 to 140."],
    [settings.spacing, 0, 32, "Spacing must be from 0 to 32."],
  ];
  for (const [value, min, max, message] of checks) {
    if (!Number.isInteger(value) || value < min || value > max) return message;
  }
  if (settings.minFont > settings.maxFont) {
    return "Minimum size cannot be larger than maximum size.";
  }
  if (!/^\d+$/.test(seedInput.trim())) {
    return "Seed must be a whole number from 0 to 2,147,483,647.";
  }
  const seed = Number(seedInput);
  if (seed > 2_147_483_647) {
    return "Seed must be a whole number from 0 to 2,147,483,647.";
  }
  if (!parseHexColor(settings.background)) {
    return "Background color must be a 6-digit hex value.";
  }
  if (settings.customColor && !parseHexColor(settings.customColor)) {
    return "Text color must be a 6-digit hex value.";
  }
  return null;
}

export function WordCloudApp() {
  const initial = useMemo(
    () => buildCloud(SAMPLE_TEXT, DEFAULT_SETTINGS, DEFAULT_SEED),
    [],
  );
  const [text, setText] = useState(SAMPLE_TEXT);
  const [settings, setSettings] = useState<CloudSettings>(DEFAULT_SETTINGS);
  const [seedInput, setSeedInput] = useState(String(DEFAULT_SEED));
  const [cloud, setCloud] = useState<CloudBuild>(initial);
  const [signature, setSignature] = useState(() =>
    layoutSignature(SAMPLE_TEXT, DEFAULT_SETTINGS, DEFAULT_SEED),
  );
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState("Sample word cloud ready.");
  const [notice, setNotice] = useState("");
  const [scale, setScale] = useState<1 | 2 | 3>(2);

  const stats = useMemo(() => textStats(text, settings.ignoreCase), [text, settings.ignoreCase]);
  const problem = validate(settings, seedInput);
  const seed = problem ? cloud.layout.seed : Number(seedInput);
  const stale = layoutSignature(text, settings, seed) !== signature;
  const palette = paletteById(settings.palette);
  const colored = useMemo(
    () =>
      assignColorIndexes(
        cloud.layout.words,
        palette.colors.length,
        cloud.layout.seed,
        settings.randomizeColors,
      ),
    [cloud.layout.words, cloud.layout.seed, palette.colors.length, settings.randomizeColors],
  );
  const layout = { ...cloud.layout, words: colored };
  const placed = new Set(layout.words.map((word) => word.text));
  const summary = frequencySummary(cloud.stats.words);
  const fit = fitMessage(layout);
  const previewFamily = FONT_PRESETS[settings.font].previewFamily;
  const weight = effectiveFontWeight(settings.font, settings.fontWeight);
  const colorsInUse = settings.customColor
    ? [settings.customColor]
    : [...palette.colors];
  const contrastWarning =
    !settings.transparent &&
    lowContrastColors(
      settings.customColor ? colorsInUse : [...colorsInUse, "#9a3412"],
      settings.background,
    ).length > 0;

  function patch(partial: Partial<CloudSettings>) {
    setSettings((current) => ({ ...current, ...partial }));
  }

  function publish(nextText: string, nextSettings: CloudSettings, nextSeed: number, message: string) {
    setWorking(true);
    setStatus("Building word cloud.");
    window.setTimeout(() => {
      try {
        const next = buildCloud(nextText, nextSettings, nextSeed);
        setCloud(next);
        setSignature(layoutSignature(nextText, nextSettings, nextSeed));
        setSeedInput(String(nextSeed));
        setStatus(
          next.layout.words.length === 0
            ? "No words matched these filters."
            : message,
        );
        setNotice("");
      } catch {
        setStatus("The word cloud could not be built. Try fewer words or the rectangle shape.");
      } finally {
        setWorking(false);
      }
    }, 0);
  }

  function generate() {
    if (problem || working) return;
    publish(text, settings, Number(seedInput), "Word cloud updated.");
  }

  function regenerate() {
    if (problem || working) return;
    const current = Number(seedInput);
    const nextSeed = current >= 2_147_483_647 ? 0 : current + 1;
    publish(text, settings, nextSeed, "Word cloud regenerated.");
  }

  async function paste() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) {
        setNotice("The clipboard did not contain text. Paste with the keyboard instead.");
        return;
      }
      setText(value);
      setNotice("");
      setStatus("Text pasted. Press Generate to update the cloud.");
    } catch {
      setNotice("Clipboard access was blocked. Paste with the keyboard instead.");
    }
  }

  function renderOptions() {
    return {
      palette: settings.palette,
      background: parseHexColor(settings.background) ?? "#ffffff",
      transparent: settings.transparent,
      customColor: settings.customColor ? parseHexColor(settings.customColor) : null,
      fontFamily: FONT_PRESETS[settings.font].exportFamily,
      fontWeight: weight,
      font: settings.font,
    };
  }

  async function downloadPng() {
    if (layout.words.length === 0) return;
    try {
      const png = await renderWordCloudPng(layout, renderOptions(), scale);
      downloadBlob(PNG_FILENAME, png.blob);
      setStatus(
        png.clamped
          ? `PNG downloaded at ${png.scale}x because a larger size would use too much memory.`
          : "PNG downloaded.",
      );
      setNotice("");
    } catch {
      setNotice("The PNG could not be created in this browser.");
    }
  }

  function downloadSvg() {
    if (layout.words.length === 0) return;
    const options = renderOptions();
    downloadTextFile(
      SVG_FILENAME,
      buildWordCloudSvg(layout, options),
      "image/svg+xml;charset=utf-8",
    );
    setStatus("SVG downloaded.");
  }

  async function copyImage() {
    if (layout.words.length === 0) return;
    if (!canCopyImage()) {
      setNotice("This browser cannot copy images. Download the PNG instead.");
      setStatus("Image copy is not available in this browser.");
      return;
    }
    try {
      const png = await renderWordCloudPng(layout, renderOptions(), scale);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png.blob })]);
      setNotice("");
      setStatus("Image copied.");
    } catch {
      setNotice("The image could not be copied. Download the PNG instead.");
      setStatus("Image copy failed.");
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(17.5rem,24rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <section className="order-1 surface-card p-4 sm:p-5 lg:col-start-1" aria-labelledby="cloud-input-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="cloud-input-heading" className="font-display text-xl font-semibold text-ink">
            Your text
          </h2>
          <p className="text-sm text-ink-muted">
            {stats.characters.toLocaleString("en-US")} characters · {stats.words.toLocaleString("en-US")} words · {stats.uniqueWords.toLocaleString("en-US")} unique
          </p>
        </div>
        <label htmlFor="word-cloud-text" className="sr-only">
          Text for the word cloud
        </label>
        <textarea
          id="word-cloud-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              generate();
            }
          }}
          placeholder="Paste your text here to create a beautiful word cloud..."
          className="mt-3 min-h-48 w-full resize-y rounded-control border border-line bg-paper px-3 py-3 text-base leading-7 text-ink placeholder:text-ink-soft"
          spellCheck
        />
        {stats.truncated ? (
          <p className="mt-2 text-sm text-warning">
            Only the first {MAX_INPUT_CHARS.toLocaleString("en-US")} characters are counted and drawn.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={paste} className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink">
            Paste
          </button>
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE_TEXT);
              publish(SAMPLE_TEXT, settings, Number.isInteger(seed) ? seed : DEFAULT_SEED, "Sample word cloud ready.");
            }}
            className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink"
          >
            Sample text
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setCloud(buildCloud("", settings, cloud.layout.seed));
              setSignature(layoutSignature("", settings, cloud.layout.seed));
              setStatus("Text cleared.");
            }}
            className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink"
          >
            Clear text
          </button>
          <button
            type="button"
            onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              publish(text, DEFAULT_SETTINGS, DEFAULT_SEED, "Settings restored.");
            }}
            className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink"
          >
            Reset to defaults
          </button>
        </div>
        {notice ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="order-2 surface-card p-4 sm:p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-labelledby="cloud-preview-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="cloud-preview-heading" className="font-display text-xl font-semibold text-ink">
            Word cloud
          </h2>
          <p id="cloud-summary" className="max-w-xl text-sm text-ink-muted">
            {summary}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={Boolean(problem) || working}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {working ? "Generating…" : "Generate"}
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={Boolean(problem) || working || layout.words.length === 0}
            className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Regenerate
          </button>
          <button type="button" onClick={() => void downloadPng()} disabled={layout.words.length === 0} className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:opacity-50">
            Download PNG
          </button>
          <label className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-surface px-3 text-sm text-ink">
            <span className="sr-only">PNG resolution</span>
            <select
              value={scale}
              onChange={(event) => setScale(Number(event.target.value) as 1 | 2 | 3)}
              className="bg-transparent text-sm font-semibold"
              aria-label="PNG resolution"
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </label>
          <button type="button" onClick={downloadSvg} disabled={layout.words.length === 0} className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:opacity-50">
            Download SVG
          </button>
          <button type="button" onClick={() => void copyImage()} disabled={layout.words.length === 0} className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:opacity-50">
            Copy image
          </button>
        </div>
        {problem ? (
          <p id="cloud-settings-error" className="mt-3 text-sm text-danger" role="alert">
            {problem}
          </p>
        ) : null}
        {stale && !problem ? (
          <p className="mt-3 text-sm text-ink-muted">Settings changed. Generate to update the layout.</p>
        ) : null}
        <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
          {status}
        </p>
        <div
          className="mt-4 overflow-hidden rounded-card border border-line"
          style={
            settings.transparent
              ? {
                  backgroundColor: "#f4f6f4",
                  backgroundImage:
                    "linear-gradient(45deg, #e4ebe6 25%, transparent 25%), linear-gradient(-45deg, #e4ebe6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4ebe6 75%), linear-gradient(-45deg, transparent 75%, #e4ebe6 75%)",
                  backgroundSize: "18px 18px",
                  backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0",
                }
              : { backgroundColor: parseHexColor(settings.background) ?? "#ffffff" }
          }
          aria-busy={working}
        >
          {layout.words.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm leading-6 text-ink-muted">
              No usable words yet. Add a few words, or turn off common-word filtering.
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              role="img"
              aria-labelledby="cloud-summary"
              className="h-auto w-full motion-safe:animate-fade-in"
            >
              {colored.map((word) => (
                <text
                  key={`${word.text}-${word.count}`}
                  x={word.x}
                  y={word.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={fillForWord(word.highlighted, word.colorIndex, {
                    palette: settings.palette,
                    customColor: settings.customColor ? parseHexColor(settings.customColor) : null,
                  })}
                  fontSize={word.fontSize}
                  fontFamily={previewFamily}
                  fontWeight={word.highlighted ? Math.min(700, weight + 100) : weight}
                  transform={
                    word.rotation
                      ? `rotate(${word.rotation} ${word.x} ${word.y})`
                      : undefined
                  }
                >
                  {word.text}
                </text>
              ))}
            </svg>
          )}
        </div>
        {fit ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <p>{fit}</p>
            {layout.omitted.length > 0 ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-control border border-line px-3 font-semibold text-accent"
                onClick={() => {
                  const next = { ...settings, shape: "rectangle" as const };
                  setSettings(next);
                  if (!validate(next, seedInput)) {
                    publish(text, next, Number(seedInput), "Switched to a rectangle.");
                  }
                }}
              >
                Use rectangle
              </button>
            ) : null}
          </div>
        ) : null}
        {contrastWarning ? (
          <p className="mt-3 text-sm text-warning">
            Some word colors are close to this background. Choose a lighter background or another palette.
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-ink-soft">
          PNG matches this preview. The SVG file uses a font stack and does not embed the webfont.
        </p>
      </section>

      <div className="order-3 space-y-4 lg:col-start-1">
        <details open className="surface-card p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold text-ink">Word filters</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-ink">
              Minimum frequency
              <input
                type="number"
                min={1}
                max={20}
                value={Number.isFinite(settings.minFrequency) ? settings.minFrequency : ""}
                onChange={(event) => patch({ minFrequency: event.target.valueAsNumber })}
                className={inputClass}
              />
            </label>
            <label className="text-sm text-ink">
              Maximum words
              <input
                type="number"
                min={10}
                max={200}
                value={Number.isFinite(settings.maxWords) ? settings.maxWords : ""}
                onChange={(event) => patch({ maxWords: event.target.valueAsNumber })}
                className={inputClass}
              />
            </label>
            <label className="text-sm text-ink">
              Minimum word length
              <input
                type="number"
                min={1}
                max={20}
                value={Number.isFinite(settings.minLength) ? settings.minLength : ""}
                onChange={(event) => patch({ minLength: event.target.valueAsNumber })}
                className={inputClass}
              />
            </label>
            <label className="text-sm text-ink">
              Layout seed
              <input
                type="text"
                inputMode="numeric"
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink-soft">
            The same seed and settings draw the same cloud. Regenerate picks the next seed.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={settings.excludeCommon}
                onChange={(event) => patch({ excludeCommon: event.target.checked })}
              />
              Exclude common words such as the, and, is, to, and of
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={settings.ignoreCase}
                onChange={(event) => patch({ ignoreCase: event.target.checked })}
              />
              Ignore case
            </label>
          </div>
          <label className="mt-3 block text-sm text-ink">
            Custom excluded words
            <textarea
              value={settings.excludedWords}
              onChange={(event) => patch({ excludedWords: event.target.value })}
              placeholder="comma or space separated"
              className="mt-1.5 min-h-16 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm text-ink">
            Custom highlighted words
            <textarea
              value={settings.highlightedWords}
              onChange={(event) => patch({ highlightedWords: event.target.value })}
              placeholder="words to emphasize"
              className="mt-1.5 min-h-16 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"
            />
          </label>
        </details>

        <details open className="surface-card p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold text-ink">Shape and size</summary>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Word cloud shape">
            {CLOUD_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                aria-pressed={settings.shape === shape}
                onClick={() => patch({ shape })}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-control border px-3 text-sm font-semibold",
                  settings.shape === shape
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink",
                )}
              >
                {SHAPE_LABELS[shape]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Canvas aspect ratio">
            {CLOUD_ASPECTS.map((aspect) => (
              <button
                key={aspect}
                type="button"
                aria-pressed={settings.aspect === aspect}
                onClick={() => patch({ aspect })}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-control border px-3 text-sm font-semibold",
                  settings.aspect === aspect
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink",
                )}
              >
                {ASPECT_LABELS[aspect]}
              </button>
            ))}
          </div>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink">Cloud alignment</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {CLOUD_ALIGNS.map((align) => (
                <label key={align} className="inline-flex min-h-11 items-center gap-2 text-sm capitalize text-ink">
                  <input
                    type="radio"
                    name="cloud-align"
                    checked={settings.align === align}
                    onChange={() => patch({ align })}
                  />
                  {align}
                </label>
              ))}
            </div>
          </fieldset>
        </details>

        <details className="surface-card p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold text-ink">Typography</summary>
          <label className="mt-4 block text-sm text-ink">
            Font
            <select
              value={settings.font}
              onChange={(event) => patch({ font: event.target.value as CloudSettings["font"] })}
              className={inputClass}
            >
              {CLOUD_FONTS.map((font) => (
                <option key={font} value={font}>
                  {FONT_PRESETS[font].label}
                </option>
              ))}
            </select>
          </label>
          {settings.font === "display" ? (
            <p className="mt-2 text-xs text-ink-soft">Fraunces is available in semibold and bold.</p>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-ink">
              Minimum size
              <input type="number" min={10} max={64} value={Number.isFinite(settings.minFont) ? settings.minFont : ""} onChange={(event) => patch({ minFont: event.target.valueAsNumber })} className={inputClass} />
            </label>
            <label className="text-sm text-ink">
              Maximum size
              <input type="number" min={18} max={140} value={Number.isFinite(settings.maxFont) ? settings.maxFont : ""} onChange={(event) => patch({ maxFont: event.target.valueAsNumber })} className={inputClass} />
            </label>
            <label className="text-sm text-ink">
              Weight
              <select
                value={settings.fontWeight}
                onChange={(event) => patch({ fontWeight: Number(event.target.value) as 400 | 600 | 700 })}
                className={inputClass}
              >
                <option value={400}>Regular</option>
                <option value={600}>Semibold</option>
                <option value={700}>Bold</option>
              </select>
            </label>
            <label className="text-sm text-ink">
              Spacing
              <input type="number" min={0} max={32} value={Number.isFinite(settings.spacing) ? settings.spacing : ""} onChange={(event) => patch({ spacing: event.target.valueAsNumber })} className={inputClass} />
            </label>
          </div>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink">Rotation</legend>
            <div className="mt-2 flex flex-col gap-2">
              {CLOUD_ROTATIONS.map((rotation) => (
                <label key={rotation} className="inline-flex min-h-11 items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="cloud-rotation"
                    checked={settings.rotation === rotation}
                    onChange={() => patch({ rotation })}
                  />
                  {rotation === "horizontal"
                    ? "Horizontal only"
                    : rotation === "mixed"
                      ? "Horizontal and vertical"
                      : "Slight random rotation"}
                </label>
              ))}
            </div>
          </fieldset>
        </details>

        <details open className="surface-card p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold text-ink">Color and background</summary>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Color palette">
            {PALETTES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={settings.palette === item.id}
                onClick={() => patch({ palette: item.id, customColor: null })}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-control border px-3 text-sm font-semibold",
                  settings.palette === item.id && !settings.customColor
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink",
                )}
              >
                <span className="flex" aria-hidden>
                  {item.colors.slice(0, 3).map((color) => (
                    <span key={color} className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                  ))}
                </span>
                {item.name}
              </button>
            ))}
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={settings.randomizeColors}
              onChange={(event) => patch({ randomizeColors: event.target.checked })}
            />
            Vary colors within the palette
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-ink">
              Background
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-control border border-line bg-surface px-2">
                <input
                  type="color"
                  value={parseHexColor(settings.background) ?? "#ffffff"}
                  onChange={(event) => patch({ background: event.target.value })}
                  aria-label="Background color picker"
                  className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                  disabled={settings.transparent}
                />
                <input
                  type="text"
                  value={settings.background}
                  onChange={(event) => patch({ background: event.target.value })}
                  aria-label="Background hex color"
                  className="w-full bg-transparent text-sm"
                  disabled={settings.transparent}
                />
              </span>
            </label>
            <label className="text-sm text-ink">
              One text color
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-control border border-line bg-surface px-2">
                <input
                  type="color"
                  value={settings.customColor ?? "#122033"}
                  onChange={(event) => patch({ customColor: event.target.value })}
                  aria-label="Text color picker"
                  className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.customColor ?? ""}
                  placeholder="Palette"
                  onChange={(event) =>
                    patch({ customColor: event.target.value.trim() ? event.target.value : null })
                  }
                  aria-label="Text hex color"
                  className="w-full bg-transparent text-sm"
                />
              </span>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={settings.transparent}
                onChange={(event) => patch({ transparent: event.target.checked })}
              />
              Transparent background
            </label>
            <button
              type="button"
              onClick={() =>
                patch({
                  palette: DEFAULT_SETTINGS.palette,
                  randomizeColors: DEFAULT_SETTINGS.randomizeColors,
                  background: DEFAULT_SETTINGS.background,
                  transparent: false,
                  customColor: null,
                })
              }
              className="inline-flex min-h-11 items-center rounded-control border border-line px-3 text-sm font-semibold text-ink"
            >
              Revert palette
            </button>
          </div>
        </details>

        <section className="surface-card p-4 sm:p-5" aria-labelledby="cloud-frequency-heading">
          <h2 id="cloud-frequency-heading" className="font-display text-xl font-semibold text-ink">
            Word frequency
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            This list matches the last generated cloud. Generate after you change filters.
          </p>
          {cloud.stats.words.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No words to list.</p>
          ) : (
            <div className="mt-4 max-h-80 overflow-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {summary} {stale ? "The table matches the last generated cloud." : ""}
                </caption>
                <thead className="text-ink-soft">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">Word</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Count</th>
                    <th scope="col" className="py-2 font-medium">In cloud</th>
                  </tr>
                </thead>
                <tbody>
                  {cloud.stats.words.map((word) => (
                    <tr key={word.text} className="border-t border-line">
                      <th scope="row" className="py-2 pr-3 font-medium text-ink">
                        {word.text}
                        {word.highlighted ? <span className="ml-2 text-xs text-accent">Highlighted</span> : null}
                      </th>
                      <td className="py-2 pr-3 tabular-nums text-ink-muted">{word.count}</td>
                      <td className="py-2 text-ink-muted">{placed.has(word.text) ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
