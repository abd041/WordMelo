import { describe, expect, it } from "vitest";
import { buildPdf, encodePdfString } from "./pdf";
import {
  CARDS_PER_PAGE,
  PAPER_SIZES,
  buildCardPrintHtml,
  buildWordListHtml,
  cardFitsPage,
  escapeHtml,
  layoutCards,
} from "./print-cards";

const words = [
  "Apple",
  "Suspension bridge",
  "A very long architectural drafting triangle with an extra extension arm",
  "Möbius strip",
  "Laptop",
  "Mountain",
  "Kettle",
  "Castle",
  "Notebook",
];

describe("printable pictionary cards", () => {
  it("places every card on a page without dropping or splitting one", () => {
    for (const count of [1, 8, 12, 20]) {
      const layout = layoutCards(
        words.slice(0, count).map((text, index) => ({
          text: words[index % words.length] ?? text,
          meta: "Easy · Tools",
        })).concat(
          Array.from({ length: Math.max(0, count - words.length) }, (_, index) => ({
            text: `Prompt ${index + 1}`,
            meta: "Hard · Buildings",
          })),
        ).slice(0, count),
        "letter",
      );
      const placed = layout.pages.flatMap((page) => page.cards);
      expect(placed).toHaveLength(count);
      expect(layout.pages.length).toBe(Math.ceil(count / CARDS_PER_PAGE));
      expect(layout.pageWidth).toBe(PAPER_SIZES.letter.width);
      expect(layout.pageHeight).toBe(PAPER_SIZES.letter.height);
      for (const page of layout.pages) {
        expect(page.cards.length).toBeLessThanOrEqual(CARDS_PER_PAGE);
        for (const card of page.cards) {
          expect(cardFitsPage(card, page)).toBe(true);
        }
      }
    }
  });

  it("uses A4 dimensions and keeps a long prompt inside the card", () => {
    const long = "Architectural drafting triangle with a hinged extension arm and measurement marks";
    const layout = layoutCards([{ text: long, meta: "Hard · Stationery" }], "a4");
    const card = layout.pages[0]?.cards[0];
    expect(layout.pageWidth).toBe(PAPER_SIZES.a4.width);
    expect(layout.pageHeight).toBe(PAPER_SIZES.a4.height);
    expect(card).toBeTruthy();
    expect(cardFitsPage(card!, layout.pages[0]!)).toBe(true);
    expect(card!.lines.join("")).toContain("Architectural");
    expect(card!.lines.length).toBeGreaterThan(1);
  });

  it("builds a print document and a PDF that contain every word", () => {
    const layout = layoutCards(
      [
        { text: "Apple", meta: "Easy · Fruits" },
        { text: "Möbius strip" },
        { text: "Train crossing a bridge", meta: "Hard · Vehicles" },
      ],
      "letter",
    );
    const html = buildCardPrintHtml(layout);
    expect(html).toContain("@page { size: letter;");
    expect(html).toContain("page-break-inside: avoid");
    expect(html).toContain("Apple");
    expect(html).toContain("Train crossing a bridge");
    expect(html).not.toContain("<nav");
    expect(html).toContain(escapeHtml("Möbius strip"));

    const pdf = Buffer.from(buildPdf(layout));
    expect(pdf.subarray(0, 8).toString("latin1")).toBe("%PDF-1.4");
    const source = pdf.toString("latin1");
    expect(source).toContain("/MediaBox [0 0 612 792]");
    for (const card of layout.pages.flatMap((page) => page.cards)) {
      expect(card.lines.join(" ")).toContain(card.text.split(" ")[0] ?? "");
      for (const line of card.lines) {
        expect(source).toContain(`(${encodePdfString(line)})`);
      }
      if (card.meta) {
        expect(encodePdfString(card.meta)).not.toContain("?");
        expect(source).toContain(`(${encodePdfString(card.meta)})`);
      }
    }
    expect(source).toContain("%%EOF");
  });

  it("returns no pages for an empty card list and escapes list html", () => {
    expect(layoutCards([], "letter").pages).toEqual([]);
    const html = buildWordListHtml(['Apple <script>', 'Hammer & nail']);
    expect(html).toContain("Apple &lt;script&gt;");
    expect(html).toContain("Hammer &amp; nail");
    expect(html).not.toContain("<script>");
  });
});
