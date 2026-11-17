export const CARD_COLUMNS = 2;
export const CARD_ROWS = 4;
export const CARDS_PER_PAGE = CARD_COLUMNS * CARD_ROWS;
export const CARD_COUNTS = [8, 12, 16, 24, 32] as const;
export type CardCount = (typeof CARD_COUNTS)[number];

export const PAPER_SIZES = {
  letter: { id: "letter", label: "US Letter", width: 612, height: 792 },
  a4: { id: "a4", label: "A4", width: 595.28, height: 841.89 },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;

const MARGIN = 36;
const GAP = 12;
const PAD_X = 14;
const PAD_TOP = 28;

export interface PrintCardInput {
  text: string;
  meta?: string;
}

export interface PlacedCard extends PrintCardInput {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  lines: string[];
}

export interface CardPage {
  width: number;
  height: number;
  cards: PlacedCard[];
}

export interface CardLayout {
  paper: PaperSize;
  pageWidth: number;
  pageHeight: number;
  cardWidth: number;
  cardHeight: number;
  pages: CardPage[];
}

export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * 0.52)));
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  function pushPiece(piece: string) {
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = piece;
      return;
    }
    current = next;
  }

  for (const word of words) {
    if (word.length <= maxChars) {
      pushPiece(word);
      continue;
    }
    for (let index = 0; index < word.length; index += maxChars) {
      pushPiece(word.slice(index, index + maxChars));
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export function fitCardText(
  text: string,
  innerWidth: number,
  innerHeight: number,
): { fontSize: number; lines: string[] } {
  for (const fontSize of [22, 18, 16, 13, 11]) {
    const lines = wrapText(text, innerWidth, fontSize);
    const height = lines.length * fontSize * 1.25;
    if (height <= innerHeight) return { fontSize, lines };
  }
  return { fontSize: 11, lines: wrapText(text, innerWidth, 11) };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function layoutCards(cards: readonly PrintCardInput[], paper: PaperSize): CardLayout {
  const spec = PAPER_SIZES[paper];
  const innerW = spec.width - MARGIN * 2;
  const innerH = spec.height - MARGIN * 2;
  const cardWidth = (innerW - GAP * (CARD_COLUMNS - 1)) / CARD_COLUMNS;
  const cardHeight = (innerH - GAP * (CARD_ROWS - 1)) / CARD_ROWS;
  const pages: CardPage[] = [];

  for (let start = 0; start < cards.length; start += CARDS_PER_PAGE) {
    const slice = cards.slice(start, start + CARDS_PER_PAGE);
    pages.push({
      width: spec.width,
      height: spec.height,
      cards: slice.map((card, index) => {
        const col = index % CARD_COLUMNS;
        const row = Math.floor(index / CARD_COLUMNS);
        const metaReserve = card.meta ? 22 : 8;
        const fitted = fitCardText(card.text, cardWidth - PAD_X * 2, cardHeight - PAD_TOP - metaReserve);
        return {
          ...card,
          x: round(MARGIN + col * (cardWidth + GAP)),
          y: round(MARGIN + row * (cardHeight + GAP)),
          w: round(cardWidth),
          h: round(cardHeight),
          fontSize: fitted.fontSize,
          lines: fitted.lines,
        };
      }),
    });
  }

  return {
    paper,
    pageWidth: spec.width,
    pageHeight: spec.height,
    cardWidth: round(cardWidth),
    cardHeight: round(cardHeight),
    pages,
  };
}

export function cardFitsPage(card: PlacedCard, page: CardPage): boolean {
  const textHeight = card.lines.length * card.fontSize * 1.25;
  const room = card.meta ? card.h - PAD_TOP - 22 : card.h - PAD_TOP - 8;
  return (
    card.x >= MARGIN - 0.2 &&
    card.y >= MARGIN - 0.2 &&
    card.x + card.w <= page.width - MARGIN + 0.2 &&
    card.y + card.h <= page.height - MARGIN + 0.2 &&
    textHeight <= room + 0.5
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCardPrintHtml(layout: CardLayout, title = "Pictionary cards"): string {
  const pageRule = layout.paper === "a4" ? "A4" : "letter";
  const pages = layout.pages
    .map((page) => {
      const cards = page.cards
        .map((card) => {
          const meta = card.meta
            ? `<p class="meta">${escapeHtml(card.meta)}</p>`
            : "";
          return `<article class="card"><p class="word">${escapeHtml(card.text)}</p>${meta}</article>`;
        })
        .join("");
      return `<section class="sheet">${cards}</section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: ${pageRule}; margin: 0.5in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #111; }
  body { font-family: Georgia, "Times New Roman", serif; }
  h1 { font-size: 11pt; font-weight: 600; margin: 0 0 10pt; }
  .sheet { display: grid; grid-template-columns: 1fr 1fr; }
  .sheet + .sheet { break-before: page; page-break-before: always; }
  .card {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px dashed #444;
    min-height: 2.35in;
    padding: 0.28in;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .word { margin: 0; font-size: 22pt; line-height: 1.25; overflow-wrap: anywhere; }
  .meta { margin: 8pt 0 0; font-family: "Segoe UI", sans-serif; font-size: 9pt; letter-spacing: 0.04em; text-transform: uppercase; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${pages}
</body>
</html>`;
}

export function buildWordListHtml(lines: readonly string[], title = "Pictionary word list"): string {
  const items = lines
    .map((line) => `<li>${escapeHtml(line.replace(/^\d+\.\s*/, ""))}</li>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: letter; margin: 0.7in; }
  body { margin: 0; color: #111; font-family: Georgia, "Times New Roman", serif; }
  h1 { font-size: 16pt; margin: 0 0 12pt; }
  ol { margin: 0; padding-left: 1.2em; }
  li { margin: 0 0 6pt; font-size: 13pt; overflow-wrap: anywhere; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<ol>${items}</ol>
</body>
</html>`;
}

export function printHtmlDocument(html: string): void {
  if (typeof document === "undefined") return;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print preview");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const frame = iframe.contentDocument;
  if (!frame) {
    iframe.remove();
    return;
  }
  frame.open();
  frame.write(html);
  frame.close();
  const win = iframe.contentWindow;
  window.setTimeout(() => {
    win?.focus();
    win?.print();
    window.setTimeout(() => iframe.remove(), 1500);
  }, 150);
}
