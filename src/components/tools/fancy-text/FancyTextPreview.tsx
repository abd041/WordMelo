"use client";

import { useId, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  FANCY_STYLES,
  NAME_FRAMES,
  PLATFORM_PREVIEWS,
  buildStyledName,
  renderPlatformPreview,
} from "@/lib/tools/fancy-text";
import { cn, copyTextToClipboard } from "@/lib/utils";

interface FancyTextPreviewProps {
  text: string;
  onCopied: (label: string) => void;
  onCopyFailed: (output: string) => void;
}

export function FancyTextPreview({
  text,
  onCopied,
  onCopyFailed,
}: FancyTextPreviewProps) {
  const platformId = useId();
  const previewStyleId = useId();
  const nameStyleId = useId();
  const frameId = useId();
  const [platform, setPlatform] = useState<(typeof PLATFORM_PREVIEWS)[number]["id"]>(
    "instagram",
  );
  const [previewStyle, setPreviewStyle] = useState<string | null>(null);
  const [nameStyle, setNameStyle] = useState("script");
  const [frame, setFrame] = useState<(typeof NAME_FRAMES)[number]["id"]>("stars");
  const [copied, setCopied] = useState<"preview" | "name" | null>(null);

  const preview = useMemo(
    () => renderPlatformPreview(text, platform, previewStyle ?? undefined),
    [text, platform, previewStyle],
  );
  const nameOutput = useMemo(
    () => buildStyledName(text, nameStyle, frame),
    [text, nameStyle, frame],
  );

  async function copyValue(kind: "preview" | "name", value: string, label: string) {
    if (!value) return;
    const ok = await copyTextToClipboard(value);
    if (!ok) {
      onCopyFailed(value);
      return;
    }
    setCopied(kind);
    onCopied(label);
    window.setTimeout(() => {
      setCopied((current) => (current === kind ? null : current));
    }, 1600);
  }

  return (
    <section
      aria-labelledby="fancy-preview-heading"
      className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft sm:p-5"
    >
      <h2
        id="fancy-preview-heading"
        className="font-display text-xl font-semibold text-ink sm:text-2xl"
      >
        Profile previews
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        A visual check for common bios and names. WordMelo is not affiliated
        with Instagram, TikTok, Discord, or any game. Rendering varies by app
        and device, and some fields reject special characters.
      </p>

      <div
        role="radiogroup"
        aria-labelledby={platformId}
        className="mt-4 flex gap-2 overflow-x-auto pb-1"
      >
        <span id={platformId} className="sr-only">
          Preview platform
        </span>
        {PLATFORM_PREVIEWS.map((item) => {
          const selected = platform === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setPlatform(item.id);
                setPreviewStyle(null);
              }}
              className={cn(
                "min-h-11 shrink-0 rounded-control border px-3 text-sm font-medium",
                selected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line bg-paper text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-card border border-line bg-mint/40 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {preview.label}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{preview.note}</p>
          </div>
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <label htmlFor={previewStyleId} className="text-xs font-medium text-ink">
              Style
            </label>
            <select
              id={previewStyleId}
              value={preview.styleId}
              onChange={(event) => setPreviewStyle(event.target.value)}
              className="mt-1 h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink"
            >
              {FANCY_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 min-h-10 break-words text-xl leading-8 text-ink [overflow-wrap:anywhere]">
          {preview.output || (
            <span className="text-base text-ink-soft">Type above to preview</span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="md"
            disabled={!preview.output}
            onClick={() => copyValue("preview", preview.output, preview.label)}
          >
            {copied === "preview" ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied === "preview" ? "Copied" : "Copy preview"}
          </Button>
          <p className="text-sm text-ink-muted" aria-live="polite">
            <span className="font-medium tabular-nums text-ink">{preview.count}</span>{" "}
            characters
            {preview.limit !== null ? ` · typical limit ${preview.limit}` : ""}
            {preview.overLimit ? " · longer than that typical limit" : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <h3 className="font-display text-lg font-semibold text-ink">Stylish name</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Uses the first line of your text, an existing style, and an optional
          decoration. This does not install a font.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={nameStyleId} className="text-sm font-medium text-ink">
              Name style
            </label>
            <select
              id={nameStyleId}
              value={nameStyle}
              onChange={(event) => setNameStyle(event.target.value)}
              className="mt-1 h-11 w-full rounded-control border border-line bg-paper px-3 text-sm text-ink"
            >
              {FANCY_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={frameId} className="text-sm font-medium text-ink">
              Decoration
            </label>
            <select
              id={frameId}
              value={frame}
              onChange={(event) =>
                setFrame(event.target.value as (typeof NAME_FRAMES)[number]["id"])
              }
              className="mt-1 h-11 w-full rounded-control border border-line bg-paper px-3 text-sm text-ink"
            >
              {NAME_FRAMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 min-h-10 break-words text-xl leading-8 text-ink [overflow-wrap:anywhere]">
          {nameOutput || (
            <span className="text-base text-ink-soft">
              Add a name on the first line to build one.
            </span>
          )}
        </p>
        <Button
          type="button"
          className="mt-3"
          variant="secondary"
          disabled={!nameOutput}
          onClick={() => copyValue("name", nameOutput, "Stylish name")}
        >
          {copied === "name" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied === "name" ? "Copied" : "Copy name"}
        </Button>
      </div>
    </section>
  );
}
