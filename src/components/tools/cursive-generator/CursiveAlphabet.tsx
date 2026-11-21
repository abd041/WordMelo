"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  cursiveAlphabetLine,
  cursiveLetters,
  SCRIPT_LETTERLIKE,
  type AlphabetStyleId,
} from "@/lib/tools/cursive-generator";
import { cn } from "@/lib/utils";

export function CursiveAlphabet({
  copiedId,
  onCopy,
}: {
  copiedId: string | null;
  onCopy: (value: string, label: string) => void;
}) {
  const [style, setStyle] = useState<AlphabetStyleId>("script");
  const upper = cursiveLetters(style, "upper");
  const lower = cursiveLetters(style, "lower");
  const styleName = style === "script" ? "Mathematical Script" : "Bold Mathematical Script";

  return (
    <section
      aria-labelledby="cursive-alphabet-heading"
      className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="cursive-alphabet-heading" className="font-sans text-base font-semibold text-ink">
            Cursive alphabet
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Tap a letter to copy its Unicode script form. These are copy-paste characters, not a handwriting font.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Alphabet style">
          {(
            [
              ["script", "Script"],
              ["bold-script", "Bold script"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={style === id}
              onClick={() => setStyle(id)}
              className={cn(
                "min-h-11 rounded-control border px-3 text-sm font-semibold",
                style === id
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line bg-paper text-ink-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <LetterRow
        label="Uppercase"
        letters={upper}
        styleName={styleName}
        copiedId={copiedId}
        onCopy={(letter) => onCopy(letter.cursive, `${styleName} ${letter.plain}`)}
      />
      <LetterRow
        label="Lowercase"
        letters={lower}
        styleName={styleName}
        copiedId={copiedId}
        onCopy={(letter) => onCopy(letter.cursive, `${styleName} ${letter.plain}`)}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          onClick={() => onCopy(cursiveAlphabetLine(style, "upper"), `${styleName} uppercase alphabet`)}
        >
          Copy A–Z
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-11"
          onClick={() => onCopy(cursiveAlphabetLine(style, "lower"), `${styleName} lowercase alphabet`)}
        >
          Copy a–z
        </Button>
      </div>
      {style === "script" ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          {SCRIPT_LETTERLIKE.join(", ")} use Unicode letterlike symbols because the math-script block skips those letters. They still copy as script-style characters.
        </p>
      ) : null}
    </section>
  );
}

function LetterRow({
  label,
  letters,
  styleName,
  copiedId,
  onCopy,
}: {
  label: string;
  letters: { plain: string; cursive: string }[];
  styleName: string;
  copiedId: string | null;
  onCopy: (letter: { plain: string; cursive: string }) => void;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-9 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
        {letters.map((letter) => {
          const copied = copiedId === `alphabet-${styleName} ${letter.plain}`;
          return (
            <button
              key={letter.plain}
              type="button"
              className={cn(
                "min-h-11 rounded-control border bg-paper px-1 text-lg text-ink hover:border-accent hover:bg-accent-soft",
                copied ? "border-accent bg-accent-soft" : "border-line",
              )}
              aria-label={copied ? `Copied cursive ${letter.plain}` : `Copy cursive ${letter.plain}`}
              onClick={() => onCopy(letter)}
            >
              <span aria-hidden="true">{letter.cursive}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
