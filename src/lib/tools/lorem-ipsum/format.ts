import type {
  GeneratedDocument,
  HtmlExportMode,
  OutputFormat,
} from "./types";
import { documentToPlainText } from "./generate";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Paragraph body only — safe for in-app rendered preview. */
export function documentToHtmlBody(doc: GeneratedDocument): string {
  return doc.paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
}

export function documentToMarkdown(doc: GeneratedDocument): string {
  return doc.paragraphs.map((p) => p.trim()).filter(Boolean).join("\n\n");
}

/** Serialize a stored document into the selected output format without regenerating. */
export function serializeDocument(
  doc: GeneratedDocument,
  format: OutputFormat,
  htmlMode: HtmlExportMode = "clean",
): string {
  if (format === "plain") {
    return documentToPlainText(doc);
  }

  if (format === "markdown") {
    return documentToMarkdown(doc);
  }

  const body = documentToHtmlBody(doc);
  const styleBlock =
    htmlMode === "styled"
      ? `<style>
body{font-family:Georgia,"Times New Roman",serif;line-height:1.7;max-width:42rem;margin:2rem auto;padding:0 1.25rem;color:#1a2332;}
p{margin:0 0 1.1em;}
</style>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>WordMelo Lorem Ipsum</title>
${styleBlock}
</head>
<body>
${body}
</body>
</html>`;
}

export function downloadFilenameFor(format: OutputFormat): string {
  if (format === "html") return "WordMelo-lorem-ipsum.html";
  if (format === "markdown") return "WordMelo-lorem-ipsum.md";
  return "WordMelo-lorem-ipsum.txt";
}
