"use client";

import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { FilterControls } from "@/components/tools/pictionary/FilterControls";
import { Button } from "@/components/ui/Button";
import {
  CARD_COUNTS,
  DEFAULT_FILTERS,
  PAPER_SIZES,
  PICTIONARY_PROMPTS,
  buildCardPrintHtml,
  buildPdf,
  downloadBytes,
  drawPromptList,
  getCategoryLabel,
  layoutCards,
  printHtmlDocument,
  type CardCount,
  type PaperSize,
  type PictionaryPrompt,
  type PromptFilters,
} from "@/lib/tools/pictionary";

export function PrintCardsPanel() {
  const [filters, setFilters] = useState<PromptFilters>({ ...DEFAULT_FILTERS, noRepeat: true });
  const [count, setCount] = useState<CardCount>(8);
  const [paper, setPaper] = useState<PaperSize>("letter");
  const [showMeta, setShowMeta] = useState(true);
  const [cards, setCards] = useState<PictionaryPrompt[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const layout = useMemo(() => {
    if (!cards || cards.length === 0) return null;
    return layoutCards(
      cards.map((card) => ({
        text: card.text,
        meta: showMeta
          ? `${card.difficulty} · ${getCategoryLabel(card.category)}`
          : undefined,
      })),
      paper,
    );
  }, [cards, paper, showMeta]);

  function generate() {
    const result = drawPromptList(PICTIONARY_PROMPTS, filters, count);
    setCards(result.prompts);
    setNotice(result.message ?? null);
  }

  function printCards() {
    if (!layout) return;
    printHtmlDocument(buildCardPrintHtml(layout));
  }

  function downloadPdf() {
    if (!layout) return;
    downloadBytes("pictionary-cards.pdf", buildPdf(layout), "application/pdf");
  }

  return (
    <section className="rounded-[1.15rem] border border-line bg-surface p-4 shadow-soft sm:p-5">
      <h2 className="font-display text-xl font-semibold text-ink">Printable Pictionary cards</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        Preview a set, then print it or download a PDF. Cards stay on one page each, with dashed cut guides and no site navigation.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Number of cards</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CARD_COUNTS.map((value) => (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-control border px-3 text-sm font-semibold ${
                  count === value ? "border-accent bg-accent-soft text-accent" : "border-line bg-paper text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="pictionary-card-count"
                  className="sr-only"
                  checked={count === value}
                  onChange={() => setCount(value)}
                />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Paper</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(PAPER_SIZES) as PaperSize[]).map((value) => (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-control border px-3 text-sm font-semibold ${
                  paper === value ? "border-accent bg-accent-soft text-accent" : "border-line bg-paper text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="pictionary-paper"
                  className="sr-only"
                  checked={paper === value}
                  onChange={() => setPaper(value)}
                />
                {PAPER_SIZES[value].label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={showMeta}
          onChange={(event) => setShowMeta(event.target.checked)}
        />
        Show difficulty and category on each card
      </label>

      <div className="mt-4">
        <FilterControls idPrefix="pictionary-print" filters={filters} onChange={setFilters} />
      </div>

      <Button type="button" className="mt-4" onClick={generate}>
        Preview cards
      </Button>
      {notice ? (
        <p role="status" className="mt-3 text-sm text-ink-muted">
          {notice}
        </p>
      ) : null}

      {layout && cards && cards.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm text-ink-muted">
            {cards.length} {cards.length === 1 ? "card" : "cards"} · {layout.pages.length}{" "}
            {layout.pages.length === 1 ? "page" : "pages"} · {PAPER_SIZES[paper].label}
          </p>
          <ol className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {cards.map((card, index) => (
              <li
                key={card.id}
                className="flex min-h-32 min-w-0 flex-col justify-center break-words rounded-control border border-dashed border-line-strong bg-paper px-4 py-4"
              >
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  Card {index + 1}
                </span>
                <span className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
                  {card.text}
                </span>
                {showMeta ? (
                  <span className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
                    <span className="capitalize">{card.difficulty}</span>
                    <span className="mx-1">·</span>
                    {getCategoryLabel(card.category)}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={printCards}>
              <Printer className="h-4 w-4" aria-hidden />
              Print cards
            </Button>
            <Button type="button" variant="secondary" onClick={downloadPdf}>
              <Download className="h-4 w-4" aria-hidden />
              Download PDF
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
