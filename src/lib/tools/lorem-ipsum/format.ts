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

/** Body markup only — item text is escaped. Safe for a rendered preview. */
export function documentToHtmlBody(doc: GeneratedDocument): string {
  const blocks = doc.paragraphs.map((p) => p.trim()).filter(Boolean);
  if (doc.mode === "lists") {
    const tag = doc.listStyle === "ordered" ? "ol" : "ul";
    const items = blocks.map((p) => `<li>${escapeHtml(p)}</li>`).join("\n");
    return `<${tag}>\n${items}\n</${tag}>`;
  }
  return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
}

export function documentToMarkdown(doc: GeneratedDocument): string {
  const blocks = doc.paragraphs.map((p) => p.trim()).filter(Boolean);
  if (doc.mode === "lists") {
    return blocks
      .map((item, index) =>
        doc.listStyle === "ordered" ? `${index + 1}. ${item}` : `- ${item}`,
      )
      .join("\n");
  }
  return blocks.join("\n\n");
}

export function mimeTypeFor(format: OutputFormat): string {
  if (format === "html") return "text/html;charset=utf-8";
  if (format === "markdown") return "text/markdown;charset=utf-8";
  return "text/plain;charset=utf-8";
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
ul,ol{margin:0 0 1.1em;padding-left:1.4em;}
li{margin:0.35em 0;}
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
