import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CaseConverterApp } from "@/components/tools/case-converter/CaseConverterApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  CASE_CONVERTER_RULES,
  CASE_MODE_EXAMPLE_SOURCE,
  CASE_MODES,
  convertCase,
} from "@/lib/tools/case-converter";

export const metadata = createPageMetadata({
  title: "Case Converter — Uppercase, Lowercase & More | WordMelo",
  description:
    "Free online case converter. Change text to uppercase, lowercase, sentence case, title case, camelCase and more. Copy or download instantly.",
  path: "/case-converter",
  keywords: [
    "case converter",
    "uppercase converter",
    "lowercase converter",
    "convert case",
    "text case converter",
    "uppercase to lowercase converter",
    "lowercase to uppercase converter",
    "sentence case converter",
    "title case converter",
    "camel case converter",
    "snake case converter",
    "kebab case converter",
  ],
});

const faqItems = [
  {
    question: "Is the Case Converter free?",
    answer:
      "Yes. WordMelo’s Case Converter is free to use in your browser and does not require an account.",
  },
  {
    question: "How do I convert uppercase to lowercase?",
    answer:
      "Paste ALL CAPS text into Original text, choose lowercase, then Copy or Download. Mode changes always reprocess your original input.",
  },
  {
    question: "How do I convert lowercase to uppercase?",
    answer:
      "Select UPPERCASE and paste or type your text. The Converted output panel updates live.",
  },
  {
    question: "Does case conversion preserve formatting?",
    answer:
      "Everyday text modes keep spaces, tabs, and line breaks. Developer formats (camelCase, PascalCase, snake_case, kebab-case) intentionally rewrite separators into identifiers.",
  },
  {
    question: "What is the difference between sentence case and Title Case?",
    answer:
      "Sentence case capitalizes sentence starts. This page’s Title Case uses WordMelo’s general headline policy. For APA, MLA, Chicago, and AP composition-title rules with style comparison, open the Title Case Converter.",
  },
  {
    question: "Can I convert text into camelCase or snake_case?",
    answer:
      "Yes. Open Developer formats and choose camelCase, PascalCase, snake_case, or kebab-case. These modes tokenize on spaces, hyphens, underscores, and camel boundaries.",
  },
  {
    question: "Is my text uploaded to a server?",
    answer:
      "No. Conversion runs locally in your browser. Drafts are not uploaded to WordMelo for casing.",
  },
  {
    question: "Does it support Unicode characters?",
    answer:
      "Accented Latin letters follow the en-US locale. Emoji are preserved. Caseless scripts may stay unchanged for inverse or alternating modes.",
  },
];

export default function CaseConverterPage() {
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
        name: "Case Converter",
        item: absoluteUrl("/case-converter"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Case Converter",
    url: absoluteUrl("/case-converter"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Convert text to uppercase, lowercase, sentence case, title case, camelCase, snake_case, and more locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Case Converter" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Case Converter — Uppercase, Lowercase & More"
          description="Convert uppercase to lowercase, build Title Case headlines, or shape camelCase identifiers — then copy or download instantly. Processing stays in your browser."
          privacyNote="Runs locally in your browser — text is not uploaded."
        />

        <CaseConverterApp />

        <div className="ad-region" aria-hidden="true" />

        <section
          aria-labelledby="case-guide"
          className="overflow-hidden rounded-[1.15rem] border border-line bg-surface"
        >
          <div className="border-b border-line bg-mint/40 px-5 py-4 sm:px-7">
            <p
              id="case-guide"
              className="font-display text-2xl font-semibold text-ink"
            >
              Case conversion guide
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Practical notes for everyday text and developer formats.
            </p>
          </div>

          <div className="prose-wordmelo max-w-none px-5 py-6 sm:px-7 sm:py-7">
            <h2 className="!mt-0">What is a Case Converter?</h2>
            <p>
              A case converter changes letter capitalization. Use it to fix caps
              lock, normalize pasted text, prepare headlines, or build code-style
              identifiers without retyping.
            </p>

            <h2>How to use the Case Converter</h2>
            <ol>
              <li>Paste or type into Original text.</li>
              <li>Choose a mode. The converted panel updates from that original text.</li>
              <li>Copy the result, download a TXT file, or use the output as the next input.</li>
            </ol>

            <h2>Convert uppercase to lowercase</h2>
            <p>
              Paste all-caps text, choose <strong>lowercase</strong>, then copy
              or download. Spaces and line breaks stay put. Example:{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                THIS IS MY SAMPLE TEXT
              </code>{" "}
              becomes{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                {convertCase("THIS IS MY SAMPLE TEXT", "lowercase")}
              </code>
              . Inverse case is the other fix for caps lock: it swaps whatever
              is already upper or lower, instead of forcing every letter down.
            </p>

            <h2>Convert lowercase to uppercase</h2>
            <p>
              Select <strong>UPPERCASE</strong> and type or paste your draft.
              Example:{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                {CASE_MODE_EXAMPLE_SOURCE}
              </code>{" "}
              becomes{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                {convertCase(CASE_MODE_EXAMPLE_SOURCE, "uppercase")}
              </code>
              .
            </p>

            <h2>Types of text case</h2>
            <p>
              Live examples for “{CASE_MODE_EXAMPLE_SOURCE}” using this page’s
              converter:
            </p>
            <div className="not-prose my-4 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="bg-mint/50 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Mode</th>
                    <th className="px-3 py-2.5 font-semibold">Group</th>
                    <th className="px-3 py-2.5 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {CASE_MODES.map((mode) => (
                    <tr key={mode.id}>
                      <td className="px-3 py-2.5 font-medium text-ink">
                        {mode.label}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {mode.group === "everyday"
                          ? "Everyday text"
                          : "Developer"}
                      </td>
                      <td className="px-3 py-2.5 font-serif text-base text-ink">
                        {convertCase(CASE_MODE_EXAMPLE_SOURCE, mode.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Sentence case vs Title Case</h2>
            <p>
              Sentence case reads like prose. It lowercases the draft, then
              capitalizes the first letter after sentence endings. A short list
              keeps Dr., Mr., and similar abbreviations from starting a new
              sentence. It cannot recover names or acronyms from all caps:{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                NASA OPENED AN OFFICE.
              </code>{" "}
              becomes{" "}
              <code className="rounded bg-mint px-1.5 py-0.5 text-sm text-ink">
                {convertCase("NASA OPENED AN OFFICE.", "sentence")}
              </code>
              .
            </p>
            <p>
              Title Case on this page capitalizes major words for everyday
              headlines. Capitalize Each Word capitalizes every word, including
              small words such as “of” and “the”. Formal APA, MLA, Chicago, and
              AP title rules belong on the{" "}
              <Link href="/title-case-converter">Title Case Converter</Link>.
            </p>

            <h2>Case conversion for developers</h2>
            <p>
              camelCase, PascalCase, snake_case, and kebab-case rebuild phrase
              text into identifier tokens. Spaces and many punctuation marks
              become separators — formatting is intentionally lossy.
            </p>

            <h2>When to use a case converter</h2>
            <ul>
              <li>Fix a paragraph typed with caps lock on.</li>
              <li>Turn a lowercase draft into uppercase for a label or heading.</li>
              <li>Shape a headline, then check APA-style rules in the Title Case Converter if the style guide matters.</li>
              <li>Turn a phrase into camelCase, PascalCase, snake_case, or kebab-case.</li>
            </ul>
            <p>
              Alternating case flips letters across the whole draft, not word by
              word. Punctuation and digits stay in place and do not move the
              pattern.
            </p>

            <h2>Does case conversion preserve formatting?</h2>
            <p>
              Everyday text modes preserve whitespace. Developer formats change
              word and character counts because separators are rewritten. See the
              note under Converted output when counts differ.
            </p>

            <h2>How Unicode case conversion works</h2>
            <ul>
              {CASE_CONVERTER_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p>
              After you normalize case, check length with the{" "}
              <Link href="/character-counter">Character Counter</Link> or the{" "}
              <Link href="/word-counter">Word Counter</Link>. Style a short bio
              with the{" "}
              <Link href="/fancy-text-generator">Fancy Text Generator</Link>, or
              gather prompts with the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools
          currentToolId="case-converter"
          preferredIds={[
            "title-case-converter",
            "word-counter",
            "character-counter",
            "fancy-text-generator",
          ]}
          limit={6}
        />
      </ToolShell>
    </>
  );
}
