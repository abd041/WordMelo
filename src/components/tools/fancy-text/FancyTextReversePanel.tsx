"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fancyTextToPlain } from "@/lib/tools/fancy-text";
import { copyTextToClipboard } from "@/lib/utils";

export function FancyTextReversePanel() {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deferred = useDeferredValue(input);
  const plain = useMemo(() => fancyTextToPlain(deferred), [deferred]);

  async function handleCopy() {
    if (!plain) return;
    const ok = await copyTextToClipboard(plain);
    if (ok) {
      setCopied(true);
      setError(null);
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      setError("Could not copy — check clipboard permissions");
    }
  }

  return (
    <section
      aria-labelledby="fancy-reverse-heading"
      className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="fancy-reverse-heading"
            className="font-display text-xl font-semibold text-ink"
          >
            Fancy text → plain text
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Best-effort cleanup for mathematical letters, fullwidth, circled,
            and similar mapped styles. Not every decoration is reversible.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide converter" : "Open converter"}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          <label htmlFor={inputId} className="sr-only">
            Fancy Unicode text to convert
          </label>
          <textarea
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="Paste fancy Unicode text here…"
            className="min-h-[5rem] w-full resize-y rounded-control border border-line bg-paper px-3 py-3 font-serif text-base leading-7 text-ink placeholder:text-ink-soft"
          />
          <div className="rounded-control border border-line bg-mint/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Plain preview
            </p>
            <p className="mt-2 min-h-[1.75rem] break-words text-base leading-7 text-ink">
              {plain || (
                <span className="text-ink-soft">Converted text appears here</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!plain}
              onClick={handleCopy}
              aria-label={copied ? "Plain text copied" : "Copy plain text"}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy plain text"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!input}
              onClick={() => setInput("")}
            >
              Clear
            </Button>
            {error ? (
              <p role="status" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
