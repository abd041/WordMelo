import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { LoremIpsumApp } from "@/components/tools/lorem-ipsum/LoremIpsumApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  createSeededRandomInt,
  documentToHtmlBody,
  documentToMarkdown,
  documentToPlainText,
  generateLorem,
} from "@/lib/tools/lorem-ipsum";
import { countWords } from "@/lib/tools/word-counter/count";

export const metadata = createPageMetadata({
  title: "Lorem Ipsum Generator – Free Dummy Text | WordMelo",
  description:
    "Generate free Lorem Ipsum dummy text by paragraphs, sentences, words, or characters. Preview layouts and copy or download plain text, HTML, and Markdown.",
  path: "/lorem-ipsum-generator",
  keywords: [
    "lorem ipsum generator",
    "lorem ipsum",
    "dummy text generator",
    "placeholder text generator",
    "lorem ipsum text",
    "generate lorem ipsum",
    "lorem ipsum paragraphs",
    "lorem ipsum sentences",
    "lorem ipsum words",
    "lorem ipsum HTML",
    "lorem ipsum Markdown",
    "lorem ipsum copy and paste",
    "dummy text for websites",
    "placeholder text for UI design",
    "lorem ipsum for web design",
  ],
});

const demoWords = generateLorem({
  mode: "words",
  quantity: 12,
  classicOpening: true,
  randomInt: createSeededRandomInt(11),
});
const demoPlain = documentToPlainText(demoWords);
const demoHtml = documentToHtmlBody(demoWords);
const demoMd = documentToMarkdown(demoWords);
const demoWordCount = countWords(demoPlain);

const faqItems = [
  {
    question: "What is Lorem Ipsum?",
    answer:
      "Lorem Ipsum is traditional placeholder text used in printing and digital design so layouts can be judged without readable English distracting from typography and spacing.",
  },
  {
    question: "Is the Lorem Ipsum Generator free?",
    answer:
      "Yes. Generation, presets, typography preview, copy, and downloads are free in your browser with no account required.",
  },
  {
    question: "How do I generate Lorem Ipsum text?",
    answer:
      "Choose paragraphs, sentences, words, characters, or lists, set a quantity, optionally keep the classic opening, then press Generate. Copy or download as plain text, HTML, or Markdown.",
  },
  {
    question: "Can I generate exactly 100 words?",
    answer:
      "Yes. Words mode returns that many words, up to 5,000. If the classic opening is on, those opening words count toward the total instead of being added on top.",
  },
  {
    question: "Can I generate exact character lengths?",
    answer:
      "Yes. Characters mode targets exact UTF-16 units (JavaScript string length). Prefer complete words may undershoot and is labeled approximate — never exact.",
  },
  {
    question: "Can I generate HTML paragraphs?",
    answer:
      "Yes. Switch to HTML for escaped <p> markup. Use Clean HTML or Styled HTML for download, and Code view or Rendered preview in the studio.",
  },
  {
    question: "Can I download Markdown text?",
    answer:
      "Yes. Markdown export uses WordMelo-lorem-ipsum.md with blank-line paragraph separation. Format switching does not regenerate words.",
  },
  {
    question: "Can I preview different typography styles?",
    answer:
      "Yes. Open Typography preview studio to adjust layout presets, font size, line height, alignment, and paragraph spacing without changing the generated text.",
  },
  {
    question: "Is Lorem Ipsum real Latin?",
    answer:
      "It has roots in Cicero’s public-domain De Finibus, but the familiar scrambled typesetting form is not authentic classical Latin prose. Treat it as visual filler only.",
  },
  {
    question: "Should I use Lorem Ipsum on a live website?",
    answer:
      "No. Use it for mockups and prototypes, then replace it with real content before launch.",
  },
  {
    question: "Can I generate a bulleted or numbered list?",
    answer:
      "Yes. Lists mode builds an exact number of items and exports them as plain text, a ul or ol element, or Markdown list syntax.",
  },
  {
    question: "Can I repeat the same placeholder text?",
    answer:
      "Yes. Enter a seed, then use the same mode, amount, and length. Copy link saves those settings in the address bar. The canonical page stays /lorem-ipsum-generator.",
  },
  {
    question: "Can I use this Lorem Ipsum in a commercial project?",
    answer:
      "Yes. The text is placeholder filler for mockups. Replace it with your own copy before you publish a real page.",
  },
  {
    question: "Is generation processed locally?",
    answer:
      "Yes. Generation, preview, copy, and downloads run in your browser. WordMelo does not upload generated placeholder text.",
  },
];

export default function LoremIpsumGeneratorPage() {
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
        name: "Lorem Ipsum Generator",
        item: absoluteUrl("/lorem-ipsum-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Lorem Ipsum Generator",
    url: absoluteUrl("/lorem-ipsum-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate Lorem Ipsum placeholder text as paragraphs, sentences, words, or exact UTF-16 character lengths, preview typography, and export plain text, HTML, or Markdown locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lorem Ipsum Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Lorem Ipsum Generator – Free Placeholder Text"
          description="Generate Lorem Ipsum placeholder text by paragraphs, sentences, words, or characters. Preview layouts and copy or download your text in seconds."
          privacyNote="Generation stays in your browser — nothing is uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <LoremIpsumApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is Lorem Ipsum?</h2>
            <p>
              Lorem Ipsum is the design world’s traditional dummy text. It lets
              you judge type size, measure, and spacing without the distraction
              of meaningful English copy.
            </p>
          </div>

          <div>
            <h2>What is a Lorem Ipsum Generator?</h2>
            <p>
              A lorem ipsum generator creates placeholder passages on demand —
              paragraphs, sentences, words, or a precise character budget — for
              wireframes, CMS drafts, and UI kits. WordMelo runs entirely in your
              browser.
            </p>
          </div>

          <div>
            <h2>How to generate Lorem Ipsum</h2>
            <ol>
              <li>Pick paragraphs, sentences, words, or characters.</li>
              <li>Set quantity and paragraph length when relevant.</li>
              <li>Optionally start with the classic opening.</li>
              <li>Generate, then copy or download plain text, HTML, or Markdown. Add a seed if you need the same text again.</li>
            </ol>
          </div>

          <div>
            <h2>Generate paragraphs, sentences and words</h2>
            <p>
              Paragraph mode builds multi-sentence blocks (short ≈25–45 words,
              medium ≈50–90, long ≈100–160, or variable). Sentence mode returns
              an exact punctuated count. Word mode returns an exact token count —
              verified with the{" "}
              <Link href="/word-counter">Word Counter</Link>.
            </p>
          </div>

          <div>
            <h2>Generate exact-length dummy text</h2>
            <p>
              Character mode targets <strong>exact UTF-16 units</strong>{" "}
              (JavaScript string length). Prefer complete words may stop early on
              a word boundary and reports the actual length as approximate. Cross-
              check other Unicode metrics with the{" "}
              <Link href="/character-counter">Character Counter</Link>.
            </p>
          </div>

          <div>
            <h2>Lorem Ipsum for web design</h2>
            <p>
              Drop generated paragraphs into article columns, landing heroes, and
              CMS fields before real content arrives. Use Typography preview to
              judge size and line length without exporting CSS.
            </p>
          </div>

          <div>
            <h2>Lorem Ipsum for UI mockups</h2>
            <p>
              Short word counts suit cards and list rows. Button Labels and Form
              Descriptions presets produce <strong>English UI placeholder
              copy</strong> — clearly separate from Latin-style Lorem Ipsum —
              when you need realistic control labels.
            </p>
          </div>

          <div>
            <h2>Plain text vs HTML vs Markdown</h2>
            <div className="not-prose my-4 overflow-x-auto rounded-[1.1rem] border border-line bg-surface">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">
                  Comparison of output formats
                </caption>
                <thead className="border-b border-line bg-mint/40 text-ink">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Format
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Best for
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  <tr className="border-b border-line">
                    <td className="px-3 py-2.5 font-medium text-ink">
                      Plain text
                    </td>
                    <td className="px-3 py-2.5">Editors, Figma, docs</td>
                    <td className="px-3 py-2.5">
                      Blank lines between paragraphs
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-3 py-2.5 font-medium text-ink">HTML</td>
                    <td className="px-3 py-2.5">Prototypes, CMS paste</td>
                    <td className="px-3 py-2.5">
                      Escaped <code>&lt;p&gt;</code>; clean or styled export
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-ink">
                      Markdown
                    </td>
                    <td className="px-3 py-2.5">READMEs, static sites</td>
                    <td className="px-3 py-2.5">
                      Same words; paragraph breaks only
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-muted">
              Switching formats never regenerates words — only Generate /
              Regenerate create new text. Lists mode uses a <code>&lt;ul&gt;</code>{" "}
              or <code>&lt;ol&gt;</code> in HTML and matching Markdown markers.
            </p>
          </div>

          <div>
            <h2>How to preview placeholder typography</h2>
            <p>
              Open Typography preview studio, pick a layout (article, landing,
              mobile, card), then adjust font size, line height, alignment, and
              paragraph gap. Preview never modifies the stored document.
            </p>
          </div>

          <div>
            <h2>Why designers use dummy text</h2>
            <p>
              Readable English pulls attention toward meaning. Dummy text keeps
              focus on hierarchy, measure, and whitespace until content is ready.
            </p>
          </div>

          <div>
            <h2>Lorem Ipsum vs actual website content</h2>
            <p>
              Ship with real copy, accessible wording, and localized strings.
              Keep Lorem Ipsum in design files and prototypes only.
            </p>
          </div>

          <div>
            <h2>Where Lorem Ipsum comes from</h2>
            <p>
              The roots trace to Cicero’s public-domain{" "}
              <em>De Finibus Bonorum et Malorum</em> (45 BC). The familiar “Lorem
              ipsum dolor sit amet…” opening is a traditional printer’s
              rearrangement. Provenance for WordMelo’s corpus is documented in{" "}
              <code>DATA_SOURCES.md</code>.
            </p>
          </div>

          <div>
            <h2>Static format examples</h2>
            <p>
              Deterministic 12-word sample (seeded for documentation — not a live
              random draw):
            </p>
            <p>
              <strong>Plain ({demoWordCount} words):</strong>{" "}
              <code>{demoPlain}</code>
            </p>
            <p>
              <strong>HTML body:</strong> <code>{demoHtml}</code>
            </p>
            <p>
              <strong>Markdown:</strong> <code>{demoMd}</code>
            </p>
          </div>

          <div>
            <h2>Browser-local privacy and limitations</h2>
            <p>
              Generation is local. Pseudo-Latin is not authentic grammar.
              Exact-character mode may truncate mid-word unless Prefer complete
              words is on. For meaningful English vocabulary prompts, use the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link> —
              a different tool with a different purpose.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools
          currentToolId="lorem-ipsum-generator"
          preferredIds={[
            "word-counter",
            "character-counter",
            "random-word-generator",
            "case-converter",
            "title-case-converter",
          ]}
          limit={5}
        />
      </ToolShell>
    </>
  );
}
