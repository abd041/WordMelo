"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Heart, PenLine } from "lucide-react";
import { CursiveAlphabet } from "@/components/tools/cursive-generator/CursiveAlphabet";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  CURSIVE_NAME_EXAMPLES,
  CURSIVE_SAMPLE_NAME,
  CURSIVE_SAMPLE_TEXT,
  CURSIVE_STYLE_GROUPS,
  CURSIVE_UNICODE_STYLES,
  CURSIVE_WORD_EXAMPLES,
  generateAllCursiveStyles,
  getCursiveUnicodeStyle,
  pushRecentCopiedStyleId,
  rememberedStyleId,
  readFavoriteStyleIds,
  readRecentCopiedStyleIds,
  toggleFavoriteStyleId,
  writeFavoriteStyleIds,
  writeRecentCopiedStyleIds,
  type CursiveStyleGroup,
  type CursiveUnicodeStyle,
} from "@/lib/tools/cursive-generator";
import { countCharactersWithSpaces } from "@/lib/tools/word-counter/count";
import { cn, copyTextToClipboard } from "@/lib/utils";

type FilterId = "all" | "favorites" | "recent" | CursiveStyleGroup;

interface CursiveUnicodePanelProps {
  text: string;
  onTextChange: (value: string) => void;
  nameMode: boolean;
  onNameModeChange: (enabled: boolean) => void;
  onOpenHandwriting: (text: string) => void;
}

function StyleCard({
  style,
  output,
  favored,
  copied,
  onCopy,
  onFavorite,
  onHandwriting,
}: {
  style: CursiveUnicodeStyle;
  output: string;
  favored: boolean;
  copied: boolean;
  onCopy: () => void;
  onFavorite: () => void;
  onHandwriting: () => void;
}) {
  return (
    <li className="flex min-w-0 flex-col rounded-[1.05rem] border border-line bg-paper/80 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {style.isMathematicalScript
              ? "Unicode alphabet"
              : "Decorative design"}
          </p>
          <h3 className="mt-1 font-sans text-sm font-semibold text-ink">
            {style.name}
          </h3>
        </div>
        <button
          type="button"
          aria-label={
            favored
              ? `Remove ${style.name} from favorites`
              : `Favorite ${style.name}`
          }
          aria-pressed={favored}
          onClick={onFavorite}
          className={cn(
            "rounded-control p-2 transition-colors",
            favored
              ? "text-accent"
              : "text-ink-soft hover:bg-mint/50 hover:text-ink",
          )}
        >
          <Heart
            className="h-4 w-4"
            fill={favored ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
      </div>

      <div className="mt-3 max-h-40 overflow-auto rounded-control bg-surface px-3 py-3 sm:max-h-52">
        <p
          className="break-words font-serif text-[1.35rem] leading-relaxed text-ink sm:text-[1.65rem]"
          lang="en"
        >
          {output}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          size="md"
          variant="primary"
          className="w-full min-w-0 whitespace-normal sm:w-auto"
          onClick={onCopy}
          aria-label={`Copy ${style.name}`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          type="button"
          size="md"
          variant="secondary"
          className="w-full min-w-0 whitespace-normal sm:w-auto"
          onClick={onHandwriting}
        >
          <PenLine className="h-4 w-4" aria-hidden />
          Open in Handwriting
        </Button>
      </div>
    </li>
  );
}

export function CursiveUnicodePanel({
  text,
  onTextChange,
  nameMode,
  onNameModeChange,
  onOpenHandwriting,
}: CursiveUnicodePanelProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  useEffect(() => {
    setFavorites(readFavoriteStyleIds());
    setRecent(readRecentCopiedStyleIds());
  }, []);

  useEffect(() => {
    if (nameMode) setFilter("all");
  }, [nameMode]);

  const results = useMemo(() => generateAllCursiveStyles(text), [text]);
  const charCount = countCharactersWithSpaces(text);

  const visible = useMemo(() => {
    return results.filter((row) => {
      if (filter === "all") return true;
      if (filter === "favorites") return favorites.includes(row.id);
      if (filter === "recent") return recent.includes(row.id);
      return row.group === filter;
    });
  }, [results, filter, favorites, recent]);

  const alphabetResults = visible.filter((row) => {
    const meta = CURSIVE_UNICODE_STYLES.find((s) => s.id === row.id);
    return meta?.isMathematicalScript;
  });
  const decorativeResults = visible.filter((row) => {
    const meta = CURSIVE_UNICODE_STYLES.find((s) => s.id === row.id);
    return meta && !meta.isMathematicalScript;
  });

  async function handleCopy(id: string, output: string, name: string) {
    if (!output) {
      setFeedback({ message: "Nothing to copy yet", tone: "neutral" });
      return;
    }
    const ok = await copyTextToClipboard(output);
    if (!ok) {
      setFeedback({
        message: "Could not copy — check clipboard permissions",
        tone: "error",
      });
      return;
    }
    setCopiedId(id);
    const styleId = rememberedStyleId(
      id,
      CURSIVE_UNICODE_STYLES.map((style) => style.id),
    );
    if (styleId) {
      const nextRecent = pushRecentCopiedStyleId(recent, styleId);
      setRecent(nextRecent);
      writeRecentCopiedStyleIds(nextRecent);
    }
    setFeedback({ message: `Copied ${name}`, tone: "success" });
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1600);
  }

  function handleFavorite(id: string) {
    const next = toggleFavoriteStyleId(favorites, id);
    setFavorites(next);
    writeFavoriteStyleIds(next);
  }

  const filters: { id: FilterId; label: string; count?: number }[] = [
    { id: "all", label: "All", count: results.length },
    { id: "favorites", label: "Favorites", count: favorites.length },
    { id: "recent", label: "Recent", count: recent.length },
    ...CURSIVE_STYLE_GROUPS.map((group) => ({
      id: group.id as FilterId,
      label: group.label,
      count: results.filter((r) => r.group === group.id).length,
    })),
  ];

  function renderCards(
    rows: typeof visible,
  ) {
    return (
      <ul className="grid min-w-0 gap-3 lg:grid-cols-2">
        {rows.map((row) => {
          const meta = CURSIVE_UNICODE_STYLES.find((s) => s.id === row.id)!;
          return (
            <StyleCard
              key={row.id}
              style={meta}
              output={row.output}
              favored={favorites.includes(row.id)}
              copied={copiedId === row.id}
              onCopy={() => handleCopy(row.id, row.output, row.name)}
              onFavorite={() => handleFavorite(row.id)}
              onHandwriting={() => onOpenHandwriting(text)}
            />
          );
        })}
      </ul>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div
        role="group"
        aria-label="Phrase or name focus"
        className="grid grid-cols-2 gap-2 sm:inline-flex sm:w-auto"
      >
        {(
          [
            ["phrase", "Words", "Cursive words and short phrases"],
            ["name", "Names", "Cursive name generator"],
          ] as const
        ).map(([id, label, blurb]) => {
          const active =
            (id === "name" && nameMode) || (id === "phrase" && !nameMode);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onNameModeChange(id === "name")}
              className={cn(
                "rounded-control border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line bg-surface text-ink-muted hover:bg-mint/40",
              )}
            >
              <span className="block text-sm font-semibold text-ink">
                {label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">{blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div role="group" aria-label="Word examples">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Try a word</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CURSIVE_WORD_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="min-h-11 rounded-control border border-line bg-paper px-3 text-sm font-semibold text-ink hover:border-accent hover:bg-accent-soft"
              onClick={() => {
                if (nameMode) onNameModeChange(false);
                onTextChange(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>
        </div>
        <div role="group" aria-label="Name examples" className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Try a name</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CURSIVE_NAME_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="min-h-11 rounded-control border border-line bg-paper px-3 text-sm font-semibold text-ink hover:border-accent hover:bg-accent-soft"
              onClick={() => {
                if (!nameMode) onNameModeChange(true);
                onTextChange(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>
        </div>
      </div>

      {nameMode ? (
        <p className="rounded-control border border-accent/25 bg-accent-soft/60 px-3 py-2 text-sm text-ink">
          Names copies Unicode script you can paste. Flourished cards add decoration around the same letters. Handwriting Studio turns this name into a PNG instead.
        </p>
      ) : (
        <p className="rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink-muted">
          Words copies Unicode script. It is not a handwriting font. Use Handwriting Studio when you need an image.
        </p>
      )}

      <section
        aria-labelledby="cursive-unicode-input"
        className="overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-mint/30 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="cursive-unicode-input"
              className="font-sans text-base font-semibold text-ink"
            >
              {nameMode ? "Your name" : "Your text"}
            </h2>
            <p className="text-xs text-ink-soft">
              Live Unicode cursive — copy the exact characters below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                onTextChange(
                  nameMode ? CURSIVE_SAMPLE_NAME : CURSIVE_SAMPLE_TEXT,
                )
              }
            >
              Sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!text}
              onClick={() => onTextChange("")}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <label htmlFor="cursive-unicode-textarea" className="sr-only">
            {nameMode
              ? "Name to convert to cursive"
              : "Text to convert to cursive"}
          </label>
          <textarea
            id="cursive-unicode-textarea"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            rows={nameMode ? 2 : 3}
            placeholder={
              nameMode
                ? "Enter a name…"
                : "Type or paste text for cursive fonts…"
            }
            className="w-full resize-y rounded-control border border-line bg-paper px-3 py-3 font-serif text-base leading-relaxed text-ink outline-none transition-shadow focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
            <span>{charCount.toLocaleString()} characters</span>
            <span>Processed locally — not uploaded</span>
          </div>
          <LivePreview
            text={text}
            nameMode={nameMode}
            copied={copiedId === "live-script"}
            onCopy={() => {
              const output = getCursiveUnicodeStyle("script")?.transform(text) ?? "";
              void handleCopy("live-script", output, nameMode ? "your name in cursive" : "your cursive text");
            }}
          />
        </div>
      </section>

      <CursiveAlphabet
        copiedId={copiedId}
        onCopy={(value, label) => {
          void handleCopy(`alphabet-${label}`, value, label);
        }}
      />

      {feedback ? (
        <FeedbackMessage tone={feedback.tone} message={feedback.message} />
      ) : null}

      <div
        role="toolbar"
        aria-label="Cursive style filters"
        className="flex flex-wrap gap-1.5"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "min-h-11 rounded-control border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === item.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-line bg-paper text-ink hover:bg-mint/50",
            )}
          >
            <span>
              {item.label}
              {typeof item.count === "number" ? ` (${item.count})` : ""}
            </span>
          </button>
        ))}
      </div>

      {!text.trim() ? (
        <p className="rounded-control border border-dashed border-line bg-paper px-4 py-8 text-center text-sm text-ink-muted">
          Enter text above to preview copy-and-paste cursive styles.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-control border border-dashed border-line bg-paper px-4 py-8 text-center text-sm text-ink-muted">
          No styles in this filter yet. Try All or add a favorite after copying.
        </p>
      ) : filter === "all" ? (
        <div className="space-y-6">
          {alphabetResults.length > 0 ? (
            <section aria-labelledby="unicode-alphabets-heading">
              <div className="mb-3">
                <h3
                  id="unicode-alphabets-heading"
                  className="font-sans text-sm font-semibold text-ink"
                >
                  Unicode Cursive Alphabets
                </h3>
                <p className="text-xs text-ink-soft">
                  Genuine mathematical script maps — not renamed duplicates.
                </p>
              </div>
              {renderCards(alphabetResults)}
            </section>
          ) : null}
          {decorativeResults.length > 0 ? (
            <section aria-labelledby="decorative-cursive-heading">
              <div className="mb-3">
                <h3
                  id="decorative-cursive-heading"
                  className="font-sans text-sm font-semibold text-ink"
                >
                  Decorative Cursive Designs
                </h3>
                <p className="text-xs text-ink-soft">
                  Script characters with flourishes — not separate alphabets.
                </p>
              </div>
              {renderCards(decorativeResults)}
            </section>
          ) : null}
        </div>
      ) : (
        renderCards(visible)
      )}
    </div>
  );
}

function LivePreview({
  text,
  nameMode,
  copied,
  onCopy,
}: {
  text: string;
  nameMode: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  const output = text.trim()
    ? (getCursiveUnicodeStyle("script")?.transform(text) ?? text)
    : "";
  return (
    <div className="mt-4 rounded-control border border-accent/30 bg-accent-soft/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {nameMode ? "Name in cursive" : "Live cursive preview"}
        </p>
        <Button type="button" className="min-h-11" disabled={!output} onClick={onCopy}>
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy cursive"}
        </Button>
      </div>
      <p className="mt-3 break-words font-serif text-3xl leading-tight text-ink sm:text-4xl" lang="en">
        {output || "Your cursive preview appears here."}
      </p>
      <p className="mt-2 text-xs text-ink-muted">
        Mathematical Script. Paste it as text. Open Handwriting Studio when you need a PNG.
      </p>
    </div>
  );
}
