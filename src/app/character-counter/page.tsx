import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CharacterCounterApp } from "@/components/tools/character-counter/CharacterCounterApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  CHARACTER_COUNTER_RULES_SUMMARY,
  analyzeCharacters,
} from "@/lib/tools/character-counter";

export const metadata = createPageMetadata({
  title: "Character Counter — With & Without Spaces | WordMelo",
  description:
    "Free online character counter. Count characters with and without spaces, letters and words instantly. Check text limits, Unicode characters and UTF-8 bytes.",
  path: "/character-counter",
  keywords: [
    "character counter",
    "character count",
    "letter counter",
    "letter count",
    "count characters online",
    "online character counter",
    "character counter with spaces",
    "character counter without spaces",
    "character limit checker",
    "how many characters is this",
    "characters remaining",
    "count letters in text",
    "unicode character counter",
    "text length checker",
    "UTF-8 byte counter",
    "grapheme counter",
    "word and character counter",
  ],
});

const faqItems = [
  {
    question: "How do I count characters online?",
    answer:
      "Paste or type into the editor. Live counts update as you write. Use the summary for characters (UTF-16), without whitespace, letters, and words, then open the Unicode inspector for graphemes, code points, and UTF-8 bytes.",
  },
  {
    question: "Are spaces included in character count?",
    answer:
      "Yes in the primary “characters” figure — it uses UTF-16 string length for the full text, including spaces. “Without whitespace” removes all Unicode whitespace (spaces, tabs, newlines, and similar) before counting.",
  },
  {
    question: "Can I count characters without spaces?",
    answer:
      "Yes. The without-whitespace metric strips every Unicode whitespace code point, not only ordinary spaces, then counts remaining UTF-16 units.",
  },
  {
    question: "What is the difference between letters and characters?",
    answer:
      "Characters measure text length (UTF-16 units, code points, or graphemes). Letters count Unicode letter code points only — digits, punctuation, symbols, and whitespace are excluded.",
  },
  {
    question: "Can I set a custom character limit?",
    answer:
      "Yes. Enter a limit, pick graphemes, code points, or UTF-16 as the metric, and watch used, remaining, and over-limit values. Your text is never truncated automatically.",
  },
  {
    question: "Why do emoji sometimes count as multiple characters?",
    answer:
      "One visible emoji can be one grapheme while spanning several Unicode code points or UTF-16 units (especially ZWJ sequences and skin-tone modifiers). Compare those metrics in the Unicode inspector.",
  },
  {
    question: "What is the difference between characters and UTF-8 bytes?",
    answer:
      "Character metrics count text units people or engines use for length. UTF-8 bytes measure encoded size — accented letters and emoji often need more than one byte.",
  },
  {
    question: "Does this tool count words too?",
    answer:
      "Yes, using the same word logic as WordMelo’s Word Counter. For reading time, speaking time, and word frequency, open the Word Counter.",
  },
  {
    question: "Can I use it for writing-length checks?",
    answer:
      "Yes. Use the custom limit checker and generic presets as drafting guides. Platform publishing rules can differ (weighted URLs, emoji, or scripts), so WordMelo does not guarantee post success anywhere.",
  },
  {
    question: "Is my text uploaded to WordMelo servers?",
    answer:
      "No. Counting, limit checks, copy, and TXT download run locally in your browser. Editor contents are not uploaded for analysis.",
  },
  {
    question: "How are line breaks counted?",
    answer:
      "A line break counts as a character. A Windows CRLF pair is two UTF-16 units. The line total treats CR, LF, and CRLF as one break: an empty editor has 0 lines, and a trailing newline adds an extra line. Paragraphs are blocks separated by a blank line.",
  },
];

export default function CharacterCounterPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Character Counter",
        item: absoluteUrl("/character-counter"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Character Counter",
    url: absoluteUrl("/character-counter"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Count characters with or without spaces, letters, words, graphemes, and UTF-8 bytes locally in your browser, with a custom character-limit checker.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Character Counter" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Character Counter"
          description="Count characters with and without whitespace, plus letters and words, as you type. Limits and Unicode details stay in your browser."
          privacyNote="Text stays in your browser — nothing is uploaded for counting."
        />

        <div className="mt-7 sm:mt-8">
          <CharacterCounterApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is a Character Counter?</h2>
            <p>
              A character counter measures how long text is so you can answer
              “how many characters is this?” before publishing or submitting.
              WordMelo’s online character counter focuses on precise length
              metrics — characters with and without spaces, letters, and Unicode
              units — while the{" "}
              <Link href="/word-counter">Word Counter</Link> focuses on words,
              reading time, and frequency.
            </p>
          </div>

          <div>
            <h2>How to count characters online</h2>
            <ol>
              <li>Paste or type into the writing workspace.</li>
              <li>
                Read the live summary: characters (UTF-16), without whitespace,
                letters, and words.
              </li>
              <li>
                Optionally set a custom character limit and choose graphemes,
                code points, or UTF-16 as the metric.
              </li>
              <li>Copy or download the exact text when you are done.</li>
            </ol>
          </div>

          <div>
            <h2>Character count with and without spaces</h2>
            <p>
              Characters with spaces use JavaScript UTF-16 string length for the
              full text. Without whitespace removes all Unicode whitespace first
              — including tabs and newlines — then counts remaining UTF-16
              units.
            </p>
            <div className="not-prose my-4 overflow-x-auto rounded-[1.1rem] border border-line bg-surface">
              <table className="w-full min-w-[18rem] text-left text-sm">
                <caption className="sr-only">
                  Example character counts with and without spaces
                </caption>
                <thead className="border-b border-line bg-mint/40 text-ink">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Example
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      With spaces
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Without whitespace
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  <tr className="border-b border-line">
                    <td className="px-3 py-2.5 font-mono text-ink">Hello World</td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {analyzeCharacters("Hello World").charactersWithSpaces}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {analyzeCharacters("Hello World").charactersWithoutSpaces}
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-3 py-2.5 font-mono text-ink">Hello, world!</td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {analyzeCharacters("Hello, world!").charactersWithSpaces}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {analyzeCharacters("Hello, world!").charactersWithoutSpaces}
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-3 py-2.5 font-mono text-ink">Hi there</td>
                    <td className="px-3 py-2.5 tabular-nums">8</td>
                    <td className="px-3 py-2.5 tabular-nums">7</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-mono text-ink">A{"\u00A0"}B</td>
                    <td className="px-3 py-2.5 tabular-nums">3</td>
                    <td className="px-3 py-2.5 tabular-nums">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2>How to count letters in text</h2>
            <p>
              The letter count uses Unicode letter properties (
              <code>\p{"{L}"}</code>), so accented Latin letters and many
              non-Latin scripts count as letters. Digits, punctuation, symbols,
              and combining marks are counted separately — not treated as
              letters.
            </p>
          </div>

          <div>
            <h2>Character count vs word count</h2>
            <p>
              Character count answers length constraints and microcopy budgets.
              Word count answers essay length, reading effort, and vocabulary
              analysis. Use this Character Counter for limits and Unicode
              detail; open the{" "}
              <Link href="/word-counter">Word Counter</Link> when reading or
              speaking time matters. If the draft is stuck in the wrong
              capitalization, change it with the{" "}
              <Link href="/case-converter">Case Converter</Link>. For a headline,
              use the{" "}
              <Link href="/title-case-converter">Title Case Converter</Link> and
              count the result again.
            </p>
          </div>

          <div>
            <h2>How to use the custom character limit checker</h2>
            <p>
              Enter a limit such as 160, choose the count metric, and watch used
              / remaining / over-limit values. Example: limit 160, used 125 → 35
              remaining (about 78% progress). If used is 180 → 20 over limit —
              remaining stays at 0, never a confusing negative. Text is never
              auto-deleted when you exceed the limit.
            </p>
          </div>

          <div>
            <h2>Why emoji counts can differ</h2>
            <p>
              A family emoji or flag can appear as one visible character
              (grapheme) while spanning multiple code points and UTF-16 units.
              Skin-tone modifiers and ZWJ sequences belong in those advanced
              metrics when the browser supports grapheme segmentation.
            </p>
          </div>

          <div>
            <h2>Graphemes, code points and UTF-16</h2>
            <p>
              <strong>Visible characters (graphemes)</strong> are what people
              usually mean by “a character.”{" "}
              <strong>Unicode code points</strong> count each scalar value.{" "}
              <strong>UTF-16 units</strong> match JavaScript{" "}
              <code>String.length</code> (emoji above the BMP use two units).
              WordMelo labels these separately so the same number never means
              two different rules.
            </p>
          </div>

          <div>
            <h2>UTF-8 bytes versus characters</h2>
            <p>
              UTF-8 byte count matters for storage, APIs, and some network
              payloads. An ASCII letter is one byte; many accented letters and
              emoji need more. Byte length is not a substitute for grapheme or
              code-point writing limits.
            </p>
          </div>

          <div>
            <h2>Character limits in everyday writing</h2>
            <p>
              Use generic presets (100, 160, 280, 500, 1,000, 2,200) as drafting
              guides. Platform publishing rules can weight URLs, emoji, or
              scripts differently — WordMelo does not invent platform-branded
              guarantees.
            </p>
          </div>

          <div>
            <h2>SEO title and meta-description length</h2>
            <p>
              The SEO title and meta description presets are flexible writing
              guides. Google does not guarantee one fixed character limit for
              title links or snippets; display depends on pixel width, device,
              and query context. A green progress bar does not guarantee full
              Google display.
            </p>
          </div>

          <div>
            <h2>Privacy and counting limitations</h2>
            <p>
              Processing is browser-local. Visible grapheme counts always use{" "}
              <code>Intl.Segmenter</code> when available — including large
              pastes — and never silently switch to code-point counts under the
              same label. If Segmenter is missing, grapheme stats report
              unavailable while code-point and UTF-16 metrics remain. For word
              frequency and reading-time estimates, open the{" "}
              <Link href="/word-counter">Word Counter</Link>. To highlight
              edits between two pastes, use{" "}
              <Link href="/text-compare">Text Compare</Link>. To measure keyboard
              speed rather than pasted length, use the{" "}
              <Link href="/typing-speed-test">Typing Speed Test</Link>.
            </p>
            <ul className="mt-3 text-sm text-ink-muted">
              {CHARACTER_COUNTER_RULES_SUMMARY.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools
          currentToolId="character-counter"
          preferredIds={[
            "word-counter",
            "typing-speed-test",
            "case-converter",
            "title-case-converter",
            "lorem-ipsum-generator",
          ]}
          limit={6}
        />
      </ToolShell>
    </>
  );
}
