import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { TitleCaseApp } from "@/components/tools/title-case/TitleCaseApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  STYLE_COMPARISON_TABLE,
  convertTitle,
} from "@/lib/tools/title-case";

export const metadata = createPageMetadata({
  title: "Title Case Converter — APA, MLA & Chicago | WordMelo",
  description:
    "Capitalize titles with APA, MLA and Chicago rules. Compare editorial styles, highlight changes, and convert headlines for free with WordMelo.",
  path: "/title-case-converter",
  keywords: [
    "title case converter",
    "capitalize title",
    "title capitalization",
    "headline capitalization",
    "APA title case",
    "MLA title case",
    "Chicago title case",
    "title case vs sentence case",
    "title case generator",
    "convert to title case",
  ],
});

const demoTitle = "a room with a view about design";
const demoApa = convertTitle(demoTitle, "apa7");
const demoMla = convertTitle(demoTitle, "mla9");
const demoChicago = convertTitle(demoTitle, "chicago18");
const demoAp = convertTitle(demoTitle, "ap-composition");

const faqItems = [
  {
    question: "What is title case?",
    answer:
      "Title case capitalizes major words in titles and headlines while keeping short function words lowercase according to an editorial style. It differs from sentence case, which mainly capitalizes the opening of a sentence.",
  },
  {
    question: "How do I capitalize a title?",
    answer:
      "Paste or type your title, choose APA 7, MLA 9, Chicago 18, AP composition titles, General, or Sentence Case, then copy the converted result. Switching styles always re-reads your original input.",
  },
  {
    question: "What is the difference between APA and Chicago title case?",
    answer:
      "Both capitalize major words, but preposition length differs. APA capitalizes prepositions of four or more letters (With, From). Chicago 18 capitalizes prepositions of five or more letters (About, Through) and generally keeps four-letter prepositions lowercase.",
  },
  {
    question: "How does MLA title capitalization work?",
    answer:
      "MLA 9 capitalizes first and last words and principal words, while lowercasing articles, prepositions of any length, coordinating conjunctions, and infinitive “to” unless they are first or last.",
  },
  {
    question: "Should \"and\" be capitalized in titles?",
    answer:
      "Usually no in APA, MLA, Chicago, and AP composition titles — unless “and” is the first or last word of the title or subtitle.",
  },
  {
    question: "Are prepositions capitalized?",
    answer:
      "It depends on the style. MLA generally lowercases prepositions of any length. APA and AP composition titles capitalize prepositions of four or more letters. Chicago 18 capitalizes prepositions of five or more letters.",
  },
  {
    question: "How do I capitalize a title after a colon?",
    answer:
      "Capitalize the first word of the subtitle after a colon (and after an em dash or segment break in APA). Example input: the future of writing: a practical guide.",
  },
  {
    question: "Can I convert multiple titles?",
    answer:
      "Yes. Open Batch lines, paste one title per line, convert with the selected style, then copy one line, copy all, or download WordMelo-title-case-converter.txt.",
  },
  {
    question: "Can I preserve iPhone and other brand spellings?",
    answer:
      "Yes. Enable Preserve acronyms for common initialisms, and add protected spellings such as iPhone or GitHub. Optional browser storage remembers the dictionary only — not your titles.",
  },
  {
    question: "Is my text processed locally?",
    answer:
      "Yes. Conversion, comparison, highlighting, and downloads run in your browser. Titles are not uploaded to WordMelo for capitalization.",
  },
];

export default function TitleCaseConverterPage() {
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
        name: "Title Case Converter",
        item: absoluteUrl("/title-case-converter"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Title Case Converter",
    url: absoluteUrl("/title-case-converter"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Capitalize titles and headlines with APA, MLA, Chicago, and AP composition-title rules, compare styles, and convert batches locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Title Case Converter" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Title Case Converter — Capitalize Titles & Headlines"
          description="Capitalize titles using APA, MLA, Chicago, and other editorial rules. Compare writing styles, review changes, and copy perfectly formatted headlines in seconds."
          privacyNote="Titles stay in your browser — nothing is uploaded for capitalization."
        />

        <div className="mt-7 sm:mt-8">
          <TitleCaseApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is a Title Case Converter?</h2>
            <p>
              A title case converter applies editorial capitalization to titles
              and headlines so major words stand out while short function words
              follow a published style. WordMelo focuses on verified APA 7, MLA
              9, Chicago 18, and AP composition-title policies — distinct from
              the general{" "}
              <Link href="/case-converter">Case Converter</Link>, which covers
              UPPERCASE, lowercase, camelCase, and everyday Title Case.
            </p>
          </div>

          <div>
            <h2>How to capitalize a title</h2>
            <ol>
              <li>Paste or type your title into the headline studio.</li>
              <li>Choose an editorial style (APA, MLA, Chicago, AP titles, or General).</li>
              <li>Review the converted result and optional change highlighting.</li>
              <li>Compare styles side by side, then copy or download.</li>
            </ol>
          </div>

          <div>
            <h2>Title Case vs Sentence Case</h2>
            <p>
              Title case capitalizes principal words for titles and headings.
              Sentence case mainly capitalizes the opening of a sentence.
              Example — title case (Chicago):{" "}
              <em>A Room with a View</em>. Sentence case:{" "}
              <em>A room with a view</em>.
            </p>
          </div>

          <div>
            <h2>APA Title Case Rules</h2>
            <p>
              APA Style 7th edition title case capitalizes major words and every
              word of four or more letters, plus the first word of a title or
              subtitle and the first word after a colon or em dash. Short
              articles, short conjunctions, and short prepositions stay
              lowercase unless they begin a segment. Use APA title case for
              paper titles and headings — not as a substitute for APA
              sentence-case reference-list titles. Official overview:{" "}
              <a
                href="https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case"
                rel="noopener noreferrer"
                target="_blank"
              >
                APA title case capitalization
              </a>
              .
            </p>
          </div>

          <div>
            <h2>MLA Title Capitalization</h2>
            <p>
              MLA Handbook 9th edition title-style capitalization capitalizes
              the first and last words of a title or subtitle and other
              principal words (nouns, pronouns, verbs, adjectives, adverbs, and
              subordinating conjunctions). Articles, prepositions of any
              length, coordinating conjunctions, and infinitive “to” stay
              lowercase unless first or last. See{" "}
              <a
                href="https://style.mla.org/"
                rel="noopener noreferrer"
                target="_blank"
              >
                MLA Style
              </a>
              .
            </p>
          </div>

          <div>
            <h2>Chicago Style Title Capitalization</h2>
            <p>
              Chicago Manual of Style 18th edition title case capitalizes
              prepositions of five or more letters (About, Through, Between)
              while shorter prepositions such as with and from generally stay
              lowercase. This differs from Chicago 17’s broader lowercase
              preposition practice. Reference:{" "}
              <a
                href="https://www.chicagomanualofstyle.org/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Chicago Manual of Style
              </a>
              .
            </p>
          </div>

          <div>
            <h2>AP Composition Title Capitalization</h2>
            <p>
              WordMelo’s AP mode follows publicly documented{" "}
              <strong>composition-title</strong> guidance: capitalize principal
              words; lowercase articles and short (≤3 letter) prepositions and
              conjunctions unless first or last; capitalize longer
              prepositions/conjunctions; capitalize infinitive “to”. It is{" "}
              <strong>not</strong> AP news-headline sentence case and is not a
              claim of full Stylebook certification. Confirm with your newsroom
              stylebook when publishing. Official reference:{" "}
              <a
                href="https://www.apstylebook.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                AP Stylebook
              </a>
              .
            </p>
          </div>

          <div>
            <h2>Which words should be capitalized in a title?</h2>
            <p>
              Across styles you usually capitalize the first word, major content
              words, and often the last word. Articles (a, an, the) and short
              coordinating conjunctions (and, but, or) are typically lowercase
              mid-title. Preposition policy is the largest practical difference
              between APA, MLA, Chicago, and AP.
            </p>
          </div>

          <div>
            <h2>Do you capitalize &quot;and&quot; in a title?</h2>
            <p>
              In APA, MLA, Chicago, and AP composition titles, “and” is normally
              lowercase unless it is the first or last word of the title or
              subtitle.
            </p>
          </div>

          <div>
            <h2>How to capitalize words after a colon</h2>
            <p>
              For titles and headings, capitalize the first word of a subtitle
              after a colon (and after an em dash / segment break in APA).
              Example input: <code>the future of writing: a practical guide</code>.
            </p>
          </div>

          <div>
            <h2>Capitalizing hyphenated words</h2>
            <p>
              APA capitalizes the second part of hyphenated major words
              (Self-Report). MLA capitalizes both parts of hyphenated compounds.
              Chicago 18 capitalizes subsequent elements after common prefixes
              (Anti-Intellectual). Always review unusual compounds.
            </p>
          </div>

          <div>
            <h2>Preserving acronyms and brand names</h2>
            <p>
              Enable Preserve acronyms for common initialisms (HTML, CSS, SEO).
              Add protected spellings for brands such as iPhone or WordMelo.
              Matching is whole-token and case-insensitive so “ebay” becomes
              “eBay” without altering “Sebay”.
            </p>
          </div>

          <div>
            <h2>Batch title capitalization</h2>
            <p>
              Switch to Batch lines, paste one title per line, convert with the
              selected style, then copy individual lines, copy all, or download{" "}
              <code>WordMelo-title-case-converter.txt</code>. Blank lines stay
              blank; order is preserved.
            </p>
          </div>

          <div>
            <h2>Why editorial styles produce different results</h2>
            <p>
              Live engine output for{" "}
              <code>{demoTitle}</code>:
            </p>
            <ul>
              <li>
                APA 7: <strong>{demoApa}</strong>
              </li>
              <li>
                MLA 9: <strong>{demoMla}</strong>
              </li>
              <li>
                Chicago 18: <strong>{demoChicago}</strong>
              </li>
              <li>
                AP composition: <strong>{demoAp}</strong>
              </li>
            </ul>
            <p>
              Notice how <em>with</em> and <em>about</em> diverge under
              preposition length rules.
            </p>
          </div>

          <div>
            <h2>Editorial style comparison</h2>
            <div className="not-prose my-4 overflow-x-auto rounded-[1.1rem] border border-line bg-surface">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">
                  Comparison of title capitalization styles
                </caption>
                <thead className="border-b border-line bg-mint/40 text-ink">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Editorial style
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Edition
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Main capitalization principle
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Preposition handling
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Best use case
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  {STYLE_COMPARISON_TABLE.map((row) => (
                    <tr key={row.style} className="border-b border-line last:border-0">
                      <td className="px-3 py-2.5 font-medium text-ink">
                        {row.style}
                      </td>
                      <td className="px-3 py-2.5">{row.edition}</td>
                      <td className="px-3 py-2.5">{row.principle}</td>
                      <td className="px-3 py-2.5">{row.prepositions}</td>
                      <td className="px-3 py-2.5">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-muted">
              Automatic capitalization cannot always resolve grammatical
              ambiguity or proper-name conventions. Review important titles
              before publication.
            </p>
          </div>

          <div>
            <h2>Browser-local privacy and limitations</h2>
            <p>
              Processing is local. The converter does not claim perfect NLP or
              universal proper-noun detection. AP mode is composition-title
              scoped. For general UPPERCASE/lowercase/camelCase transforms, use
              the <Link href="/case-converter">Case Converter</Link>. For length
              checks, try the <Link href="/word-counter">Word Counter</Link> or{" "}
              <Link href="/character-counter">Character Counter</Link>.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools currentToolId="title-case-converter" />
      </ToolShell>
    </>
  );
}
