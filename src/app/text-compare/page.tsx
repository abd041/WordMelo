import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { TextCompareApp } from "@/components/tools/text-compare/TextCompareApp";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  TEXT_COMPARE_DESCRIPTION,
  TEXT_COMPARE_FAQS,
  TEXT_COMPARE_H1,
  TEXT_COMPARE_KEYWORDS,
  TEXT_COMPARE_PATH,
  TEXT_COMPARE_SUBTITLE,
  TEXT_COMPARE_TITLE,
} from "@/lib/tools/text-compare/page-copy";

export const metadata = createPageMetadata({
  title: TEXT_COMPARE_TITLE,
  description: TEXT_COMPARE_DESCRIPTION,
  path: TEXT_COMPARE_PATH,
  keywords: [...TEXT_COMPARE_KEYWORDS],
});

export default function TextComparePage() {
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
        name: "Text Compare",
        item: absoluteUrl(TEXT_COMPARE_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Text Compare Tool",
    url: absoluteUrl(TEXT_COMPARE_PATH),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: TEXT_COMPARE_DESCRIPTION,
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Text Compare" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title={TEXT_COMPARE_H1}
          description={TEXT_COMPARE_SUBTITLE}
          privacyNote="Your text stays in your browser — nothing is uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <TextCompareApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl">
          <h2>What Is a Text Compare Tool?</h2>
          <p>
            A text compare tool places two pieces of writing next to each other
            and marks what changed. It can show a word that was replaced, a
            line that was added, or a character that was deleted. The result is
            a literal comparison of the text you pasted. It does not decide
            whether the new version is better, and it does not detect copied
            work from the web.
          </p>

          <h2>How to Compare Two Texts Online</h2>
          <ol>
            <li>Paste the earlier version into Original text.</li>
            <li>Paste the later version into Modified text.</li>
            <li>Leave Words selected, or switch to Lines or Characters.</li>
            <li>Press Compare Text. Use side-by-side or unified view.</li>
            <li>Copy the summary or download a text, diff, or HTML report.</li>
          </ol>

          <h2>Word-Level vs Line-Level vs Character-Level Comparison</h2>
          <p>
            Word-by-word comparison is the default. It is the useful choice for
            a rewritten sentence, because a changed word stays visible without
            marking the whole line. Punctuation stays in the result.
          </p>
          <p>
            Line-by-line comparison treats each line as one unit. Use it for
            lists, notes, and small configuration snippets where a changed line
            should stand out. Line numbers can stay visible, and the downloaded
            diff uses plus and minus markers.
          </p>
          <p>
            Character-level comparison marks individual changes, including emoji
            and combining characters, when the passage is short. Longer text
            switches to a word comparison and says so, instead of locking the
            page on a character-by-character scan.
          </p>

          <h2>Common Uses for Text Comparison</h2>
          <ul>
            <li>Comparing article drafts after an edit.</li>
            <li>Checking an edited document you copied out of a file.</li>
            <li>Reviewing a rewritten paragraph.</li>
            <li>Comparing notes from two versions of the same meeting.</li>
            <li>Finding what changed in text you pasted twice.</li>
            <li>Comparing a small code or configuration snippet.</li>
          </ul>

          <h2>Tips for Comparing Text Accurately</h2>
          <ul>
            <li>Turn on Ignore capitalization when only letter case changed and you still want those words counted as matches. The editors keep the original spelling.</li>
            <li>Ignore whitespace when extra spaces should not count as a change. The displayed text still includes the spaces you pasted.</li>
            <li>Ignore empty lines when a blank line is formatting rather than content.</li>
            <li>Use word comparison for prose, line comparison for lists and config, and character comparison for a short string where one letter matters.</li>
            <li>
              If you only need a length check, use the{" "}
              <Link href="/word-counter">Word Counter</Link> or the{" "}
              <Link href="/character-counter">Character Counter</Link>. To change
              case before you compare, use the{" "}
              <Link href="/case-converter">Case Converter</Link> or the{" "}
              <Link href="/title-case-converter">Title Case Converter</Link>.
            </li>
          </ul>
          <p>
            Similarity is 2 × matching units ÷ (units in Text A + units in Text
            B). The units follow the mode and the ignore options. Two empty
            boxes score 100 because nothing differs. The percentage is not a
            plagiarism result. Reordered blocks are shown as a removal plus an
            addition. Each side is compared up to the first 80,000 characters,
            and a longer paste is labeled partial. If the texts differ in too
            many places to align, the page withholds the score and says the
            comparison is approximate. The downloaded diff is a line-based
            unified diff of the included text.
          </p>
        </section>

        <ToolFAQ title="Frequently asked questions" items={[...TEXT_COMPARE_FAQS]} />

        <RelatedTools
          currentToolId="text-compare"
          preferredIds={[
            "word-counter",
            "character-counter",
            "case-converter",
            "title-case-converter",
          ]}
          limit={4}
        />
      </ToolShell>
    </>
  );
}
