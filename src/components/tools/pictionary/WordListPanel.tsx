"use client";

import { useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import { FilterControls } from "@/components/tools/pictionary/FilterControls";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_FILTERS,
  PICTIONARY_PROMPTS,
  WORD_LIST_SIZES,
  buildWordListHtml,
  drawPromptList,
  formatPromptList,
  getCategoryLabel,
  printHtmlDocument,
  type PromptFilters,
  type WordListSize,
} from "@/lib/tools/pictionary";
import { copyTextToClipboard, downloadTextFile } from "@/lib/utils";

export function WordListPanel() {
  const [filters, setFilters] = useState<PromptFilters>({ ...DEFAULT_FILTERS, noRepeat: true });
  const [size, setSize] = useState<WordListSize>(10);
  const [words, setWords] = useState<ReturnType<typeof drawPromptList> | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  function generate() {
    setWords(drawPromptList(PICTIONARY_PROMPTS, filters, size));
    setCopied(false);
    setCopyError(null);
  }

  async function copyAll() {
    if (!words || words.prompts.length === 0) return;
    const ok = await copyTextToClipboard(formatPromptList(words.prompts));
    if (ok) {
      setCopied(true);
      setCopyError(null);
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      setCopyError("Could not copy. Check clipboard permissions and try again.");
    }
  }

  function download() {
    if (!words || words.prompts.length === 0) return;
    downloadTextFile("pictionary-word-list.txt", `${formatPromptList(words.prompts)}\n`);
  }

  function printList() {
    if (!words || words.prompts.length === 0) return;
    printHtmlDocument(buildWordListHtml(formatPromptList(words.prompts).split("\n")));
  }

  return (
    <details className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft sm:p-5">
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        Generate a Pictionary Word List
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Build a unique list from the same curated prompts, then copy, download, or print it.
      </p>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-ink">How many words</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WORD_LIST_SIZES.map((count) => (
            <label
              key={count}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-control border px-3 text-sm font-semibold ${
                size === count ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink"
              }`}
            >
              <input
                type="radio"
                name="pictionary-list-size"
                className="sr-only"
                checked={size === count}
                onChange={() => setSize(count)}
              />
              {count}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <FilterControls idPrefix="pictionary-list" filters={filters} onChange={setFilters} />
      </div>

      <Button type="button" className="mt-4" onClick={generate}>
        Generate list
      </Button>

      {words?.message ? (
        <p role="status" className="mt-3 text-sm text-ink-muted">
          {words.message}
        </p>
      ) : null}
      {copyError ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {copyError}
        </p>
      ) : null}

      {words && words.prompts.length > 0 ? (
        <div className="mt-4">
          <ol className="space-y-2">
            {words.prompts.map((prompt, index) => (
              <li
                key={prompt.id}
                className="flex min-w-0 flex-col gap-1 rounded-control border border-line bg-surface px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="min-w-0 break-words font-medium text-ink">
                  <span className="mr-2 text-ink-soft">{index + 1}.</span>
                  {prompt.text}
                </span>
                <span className="text-xs text-ink-muted sm:shrink-0">
                  <span className="capitalize">{prompt.difficulty}</span>
                  <span className="mx-1">·</span>
                  {getCategoryLabel(prompt.category)}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void copyAll()}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              Copy all
            </Button>
            <Button type="button" variant="secondary" onClick={download}>
              <Download className="h-4 w-4" aria-hidden />
              Download TXT
            </Button>
            <Button type="button" variant="secondary" onClick={printList}>
              <Printer className="h-4 w-4" aria-hidden />
              Print word list
            </Button>
          </div>
        </div>
      ) : null}
    </details>
  );
}
