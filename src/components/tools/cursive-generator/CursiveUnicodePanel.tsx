"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Heart, PenLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  CURSIVE_SAMPLE_NAME,
  CURSIVE_SAMPLE_TEXT,
  CURSIVE_STYLE_GROUPS,
  CURSIVE_UNICODE_STYLES,
  generateAllCursiveStyles,
  pushRecentCopiedStyleId,
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
    <li className="flex flex-col rounded-[1.05rem] border border-line bg-paper/80 p-4 sm:p-5">
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

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="primary"
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
          size="sm"
          variant="secondary"
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
    const nextRecent = pushRecentCopiedStyleId(recent, id);
    setRecent(nextRecent);
    writeRecentCopiedStyleIds(nextRecent);
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
      <ul className="grid gap-3 lg:grid-cols-2">
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
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Phrase or name focus"
        className="grid grid-cols-2 gap-2 sm:inline-flex sm:w-auto"
      >
        {(
          [
            ["phrase", "Phrase", "Full lines and captions"],
            ["name", "Name Mode", "Short personalizations"],
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

      {nameMode ? (
        <p className="rounded-control border border-accent/25 bg-accent-soft/60 px-3 py-2 text-sm text-ink">
          Name Mode is for a short name. Mathematical Script and Bold
          Mathematical Script are the letters you can copy and paste. Name
          Designs add a flourish. Handwriting Studio downloads the same name
          as a PNG.
        </p>
      ) : null}

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
        </div>
      </section>

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
              "rounded-control border px-3 py-1.5 text-sm font-medium transition-colors",
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

      {feedback ? (
        <FeedbackMessage tone={feedback.tone} message={feedback.message} />
      ) : null}

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
