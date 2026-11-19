import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { AlphabetizerApp } from "@/components/tools/alphabetizer/AlphabetizerApp";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  ALPHABETIZER_DESCRIPTION,
  ALPHABETIZER_FAQS,
  ALPHABETIZER_H1,
  ALPHABETIZER_KEYWORDS,
  ALPHABETIZER_PATH,
  ALPHABETIZER_SUBTITLE,
  ALPHABETIZER_TITLE,
} from "@/lib/tools/alphabetizer/page-copy";

export const metadata = createPageMetadata({
  title: ALPHABETIZER_TITLE,
  description: ALPHABETIZER_DESCRIPTION,
  path: ALPHABETIZER_PATH,
  keywords: [...ALPHABETIZER_KEYWORDS],
});

export default function AlphabetizerPage() {
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
        name: "Alphabetizer",
        item: absoluteUrl(ALPHABETIZER_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Alphabetizer",
    url: absoluteUrl(ALPHABETIZER_PATH),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: ALPHABETIZER_DESCRIPTION,
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Alphabetizer" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title={ALPHABETIZER_H1}
          description={ALPHABETIZER_SUBTITLE}
          privacyNote="Your list stays in your browser — nothing is uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <AlphabetizerApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl">
          <h2>What Is an Alphabetizer?</h2>
          <p>
            An alphabetizer puts a list into a chosen order. The usual job is
            A–Z: banana, Apple, and cherry become Apple, banana, cherry. The
            same workspace can reverse that order, sort numbers, sort by length,
            sort names by last word, reverse the current sequence, or shuffle
            the lines. It is a list tool, not a case converter and not a
            comparison of two documents.
          </p>

          <h2>How to Alphabetize a List Online</h2>
          <ol>
            <li>Paste one item per line into Your List, or choose comma or semicolon splitting for a simple delimited paste.</li>
            <li>Leave Alphabetical A–Z selected, or pick another method.</li>
            <li>Open Advanced options if you need to drop blanks, drop duplicates, or ignore A, An, and The.</li>
            <li>Press Sort My List. Ctrl+Enter and Cmd+Enter do the same from the input box.</li>
            <li>Copy the Sorted Results or download a text or CSV file.</li>
          </ol>

          <h2>Alphabetical Order A–Z vs Z–A</h2>
          <p>
            A–Z uses English collation. Letters are compared in dictionary
            order. Capitalization is a tie-breaker, not the primary key, so
            Apple still lands with the A words. Accents stay distinct. Z–A is
            that same comparison in reverse. It is not the same as Reverse
            current order, which only flips the sequence you pasted.
          </p>

          <h2>How to Alphabetize Names by Last Name</h2>
          <p>
            Last name A–Z takes the last whitespace-separated word on the line
            and ignores trailing punctuation, so “David Wilson,” still sorts as
            Wilson. “Mary Ann” sorts under Ann. That is a practical heuristic
            for simple given-name plus family-name lists. It does not infer
            every culture’s family-name convention, and suffixes such as Jr.
            can be treated as the last word.
          </p>

          <h2>Sorting Numbers vs Sorting Text</h2>
          <p>
            Alphabetical order treats “10” as coming before “2” because 1 comes
            before 2 as a character. Numeric smallest-to-largest reads signed
            decimals after surrounding spaces, so -3, 0, 2.5, 10. Lines that
            are not numbers stay after the numeric values and are ordered
            alphabetically. They are never converted to zero. Natural A–Z is
            for labels such as file1, file2, and file10, where the digits are
            compared as numbers inside the text.
          </p>

          <h2>How to Remove Duplicate Lines</h2>
          <p>
            Remove duplicate lines keeps the first original occurrence and drops
            later matches. Comparison uses the trimmed line. If Ignore
            capitalization is off, Apple and apple both stay. If it is on, the
            later apple is removed. Unique-only is the same action as this
            option; there is not a second duplicate switch.
          </p>

          <h2>Common Uses for an Alphabetizer</h2>
          <ul>
            <li>Student word lists and classroom vocabulary.</li>
            <li>Attendance or contact names.</li>
            <li>Reading lists and bibliographies you already have as plain text.</li>
            <li>Classroom activities that need A–Z or a shuffled order.</li>
            <li>Product lists and inventory names.</li>
            <li>Reference lists and glossary terms.</li>
            <li>A simple spreadsheet column pasted as lines.</li>
            <li>Notes you want in a stable order before you edit them.</li>
          </ul>
          <p>
            After you sort, check length in the{" "}
            <Link href="/word-counter">Word Counter</Link>, compare two drafts
            in <Link href="/text-compare">Text Compare</Link>, or fix letter
            case in the <Link href="/case-converter">Case Converter</Link>. For
            a fresh set of English words to sort, use the{" "}
            <Link href="/random-word-generator">Random Word Generator</Link>.
          </p>
        </section>

        <ToolFAQ title="Frequently asked questions" items={[...ALPHABETIZER_FAQS]} />

        <RelatedTools
          currentToolId="alphabetizer"
          preferredIds={[
            "text-compare",
            "word-counter",
            "case-converter",
            "random-word-generator",
          ]}
          limit={4}
        />
      </ToolShell>
    </>
  );
}
