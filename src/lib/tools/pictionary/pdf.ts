import type { CardLayout, CardPage, PlacedCard } from "./print-cards";

const WIN_ANSI: Record<string, number> = {
  "\u00f6": 0xf6,
  "\u00d6": 0xd6,
  "\u00e9": 0xe9,
  "\u00e8": 0xe8,
  "\u00fc": 0xfc,
  "\u00e4": 0xe4,
  "\u2013": 0x96,
  "\u2014": 0x97,
  "\u2019": 0x92,
  "\u00b7": 0xb7,
};

export function encodePdfString(text: string): string {
  let out = "";
  for (const char of text) {
    if (char === "\\") {
      out += "\\\\";
      continue;
    }
    if (char === "(") {
      out += "\\(";
      continue;
    }
    if (char === ")") {
      out += "\\)";
      continue;
    }
    const code = char.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      out += char;
      continue;
    }
    const mapped = WIN_ANSI[char];
    if (mapped) {
      out += `\\${mapped.toString(8).padStart(3, "0")}`;
      continue;
    }
    out += "?";
  }
  return out;
}

function n(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function cardStream(page: CardPage, card: PlacedCard): string {
  const bottom = page.height - card.y - card.h;
  const commands = [
    "0.35 G",
    "0.8 w",
    "[3 2] 0 d",
    `${n(card.x)} ${n(bottom)} ${n(card.w)} ${n(card.h)} re S`,
    "[] 0 d",
    "0 g",
  ];
  const top = page.height - card.y;
  card.lines.forEach((line, index) => {
    const baseline = top - 36 - index * card.fontSize * 1.25;
    commands.push("BT");
    commands.push(`/F1 ${card.fontSize} Tf`);
    commands.push(`${n(card.x + 14)} ${n(baseline)} Td`);
    commands.push(`(${encodePdfString(line)}) Tj`);
    commands.push("ET");
  });
  if (card.meta) {
    commands.push("BT");
    commands.push("/F1 9 Tf");
    commands.push(`${n(card.x + 14)} ${n(bottom + 14)} Td`);
    commands.push(`(${encodePdfString(card.meta)}) Tj`);
    commands.push("ET");
  }
  return commands.join("\n");
}

export function pageContentStream(page: CardPage): string {
  return page.cards.map((card) => cardStream(page, card)).join("\n");
}

function toBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

export function buildPdf(layout: CardLayout): Uint8Array {
  const streams = layout.pages.map((page) => pageContentStream(page));
  const pageCount = Math.max(streams.length, 1);
  const blank = streams.length === 0;
  const objects: Array<{ id: number; body: string; stream?: string }> = [];

  objects.push({ id: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" });
  objects.push({ id: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" });

  const kids: number[] = [];
  let nextId = 4;
  const pageObjects: Array<{ id: number; body: string; stream?: string }> = [];
  const source = blank ? [""] : streams;
  for (const stream of source.slice(0, pageCount)) {
    const pageId = nextId;
    const contentId = nextId + 1;
    nextId += 2;
    kids.push(pageId);
    pageObjects.push({
      id: pageId,
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(layout.pageWidth)} ${n(layout.pageHeight)}] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`,
    });
    pageObjects.push({ id: contentId, body: "", stream });
  }
  objects.push({
    id: 2,
    body: `<< /Type /Pages /Count ${kids.length} /Kids [${kids.map((id) => `${id} 0 R`).join(" ")}] >>`,
  });
  objects.push(...pageObjects);
  objects.sort((a, b) => a.id - b.id);

  let content = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets[object.id] = content.length;
    if (object.stream !== undefined) {
      const stream = object.stream;
      content += `${object.id} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
    } else {
      content += `${object.id} 0 obj\n${object.body}\nendobj\n`;
    }
  }

  const startxref = content.length;
  const size = objects.length + 1;
  let xref = `xref\n0 ${size}\n`;
  xref += "0000000000 65535 f \n";
  for (let id = 1; id < size; id += 1) {
    xref += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  content += xref;
  content += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  return toBytes(content);
}

export function downloadBytes(filename: string, bytes: Uint8Array, mime: string): void {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
