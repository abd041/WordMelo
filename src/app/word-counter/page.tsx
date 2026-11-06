import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolInstructions } from "@/components/tools/ToolInstructions";
import { ToolShell } from "@/components/tools/ToolShell";
import { WordCounterApp } from "@/components/tools/word-counter/WordCounterApp";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { WORD_COUNTER_RULES_SUMMARY } from "@/lib/tools/word-counter/rules";

export const metadata = createPageMetadata({
  title: "Free Word Counter Online – Words & Characters | WordMelo",
  description:
    "Count words, characters, sentences, paragraphs and reading time instantly with WordMelo's free online Word Counter. Private, accurate and easy to use.",
  path: "/word-counter",
  keywords: [
    "word counter",
    "free word counter",
    "word counter online",
    "word count checker",
    "character counter",
    "essay word counter",
    "reading time calculator",
  ],
});

const faqItems = [
  {
    question: "Is my text uploaded to WordMelo servers?",
    answer:
      "No. The Word Counter processes text in your browser. Editor contents are not sent to WordMelo servers, analytics endpoints, or third-party APIs for counting.",
  },
  {
    question: "What counts as a word?",
    answer:
      "WordMelo prefers the browser’s Intl.Segmenter word segmentation when available. Word-like segments (including many contractions, numbers, and hyphenated compounds) are counted. Fallback mode splits on whitespace and trims edge punctuation. Mixed-language and informal text can still be ambiguous.",
  },
  {
    question: "How are reading and speaking times calculated?",
    answer: `Reading time uses about ${siteConfig.readingWordsPerMinute} words per minute. Speaking time uses about ${siteConfig.speakingWordsPerMinute} words per minute. Both estimates round up to the nearest second and are practical averages, not personalized measurements.`,
  },
  {
    question: "Why is there a grapheme count as well as character counts?",
    answer:
      "JavaScript string length counts UTF-16 code units. Grapheme counting uses Intl.Segmenter when available to better reflect user-perceived characters, especially for emoji sequences and combining marks.",
  },
  {
    question: "How accurate is the page estimate?",
    answer: `The optional page estimate divides word count by ${siteConfig.wordsPerPageEstimate}, a common rough figure for double-spaced manuscript pages. Actual printed or paginated length depends on font, margins, spacing, and layout.`,
  },
  {
    question: "Are spaces included in the character count?",
    answer:
      "The Characters card labeled “With spaces” includes spaces, tabs, and line breaks. “Without spaces” removes whitespace. Graphemes are a separate count of perceived characters, which matters for emoji.",
  },
  {
    question: "How are hyphenated words counted?",
    answer:
      "A hyphenated compound such as well-known is usually one word when the browser’s word segmenter treats it as a single word-like token. Contractions such as don't are also usually one word. Punctuation alone is not counted.",
  },
  {
    question: "Can I count words in an essay?",
    answer:
      "Yes. Paste the essay, set a word goal such as 500 or 1,000, and watch the remaining count. The tool does not enforce a school’s rules about titles, citations, or footnotes.",
  },
  {
    question: "Does WordMelo store my text?",
    answer:
      "Counting stays in your browser. Autosave is off until you turn it on. If you enable it, the draft is written to this browser’s local storage and can be deleted from the same control. WordMelo does not upload the draft for analysis.",
  },
  {
    question: "Is the word counter free, and does it work on mobile?",
    answer:
      "Yes. The Word Counter is free and does not require an account. The editor and statistics work on phones as well as desktops.",
  },
  {
    question: "Why might WordMelo and Microsoft Word show different counts?",
    answer:
      "Applications disagree on hyphenated compounds, numbers, contractions, and text inside fields Word cannot see in a paste. WordMelo counts the text in the editor with the rules listed on this page. Compare the same pasted passage, not a file that still contains notes or text boxes.",
  },
];

export default function WordCounterPage() {
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
        name: "Word Counter",
        item: absoluteUrl("/word-counter"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Word Counter",
    url: absoluteUrl("/word-counter"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Count words, characters, sentences, paragraphs, reading time, speaking time, and word frequency locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Word Counter" },
        ]}
      >
        <ToolHeader
          title="Free Online Word Counter"
          description="Count words, characters, sentences, and paragraphs as you type. Check a word goal, keyword density, reading time, and an English readability estimate — privately in your browser."
        />

        <WordCounterApp />

        <div className="ad-region" aria-hidden="true" />

        <ToolInstructions
          steps={[
            "Paste or type your text into the editor.",
            "Review live statistics as the draft updates.",
            "Use Copy, Download TXT, or Clear when you are finished.",
            "Optionally load sample text to explore the counters.",
          ]}
        />

        <section
          aria-labelledby="word-counter-guide"
          className="surface-card p-6 sm:p-8"
        >
          <div className="prose-wordmelo max-w-none">
            <h2 id="word-counter-guide">What is a word counter?</h2>
            <p>
              A word counter measures how much text you have written. Writers,
              students, editors, and marketers use counters to check assignment
              limits, estimate reading effort, and keep drafts within a target
              length.
            </p>

            <h2>How to count words online with WordMelo</h2>
            <p>
              Open the editor above, paste your draft, and read the live
              statistics panel. Nothing is submitted to a form endpoint for
              counting. You can copy the text back out, download a TXT file, or
              clear the editor when you are done.
            </p>

            <h2>What counts as a word?</h2>
            <p>
              Word boundaries look simple in everyday English and become harder
              with punctuation, emoji, hyphenation, and other scripts. WordMelo
              documents its approach instead of claiming universal linguistic
              perfection:
            </p>
            <ul>
              {WORD_COUNTER_RULES_SUMMARY.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>

            <h2>Words vs characters</h2>
            <p>
              Word count helps with essay limits and speaking estimates.
              Character count matters for captions, SMS-style drafts, and
              length budgets. For a dedicated letter counter, Unicode metrics,
              and a custom character-limit checker, open the{" "}
              <Link href="/character-counter">Character Counter</Link>. This
              Word Counter still reports characters with spaces, characters
              without spaces, and graphemes alongside reading-time tools.
            </p>

            <h2>Reading time explained</h2>
            <p>
              Adult silent reading speed varies widely by difficulty and
              familiarity. WordMelo uses approximately{" "}
              {siteConfig.readingWordsPerMinute} words per minute as a practical
              average for general English prose. Dense academic writing often
              takes longer; light narrative may take less.
            </p>

            <h2>Speaking time explained</h2>
            <p>
              Presentation pacing also varies. The speaking estimate uses about{" "}
              {siteConfig.speakingWordsPerMinute} words per minute — a common
              planning figure for clear spoken delivery. Rehearse aloud when
              timing is critical.
            </p>

            <h2>How keyword density is calculated</h2>
            <p>
              Each row is a word or a short phrase from your draft. Density is
              that phrase’s count divided by the number of words, or by the
              number of adjacent two-word or three-word sequences. Hiding stop
              words removes entries such as “the” from the table. It does not
              shrink the denominator, so the percentage remains a share of the
              whole draft. A higher percentage is not a ranking recommendation.
            </p>

            <h2>How readability scores are estimated</h2>
            <p>
              Reading ease and grade level use the Flesch formulas with an
              estimated syllable count for English spelling. Very short or very
              simple sentences can produce a grade below 1. Scores are hidden
              when the draft is mostly another writing system, because the
              formulas were not designed for that text. They do not judge
              whether the writing is good.
            </p>

            <h2>Word counter for students and writers</h2>
            <ul>
              <li>Students can check an essay or assignment against a word goal.</li>
              <li>Writers can watch article, story, and manuscript length.</li>
              <li>Creators can estimate reading time for a page or caption.</li>
              <li>Professionals can measure an email, report, or talk.</li>
            </ul>
            <p>
              Schools, publishers, and clients set their own length rules.
              WordMelo does not claim an ideal article length.
            </p>

            <h2>Practical use cases</h2>
            <ul>
              <li>Checking essay, personal statement, or scholarship limits.</li>
              <li>Estimating blog post reading time before publishing.</li>
              <li>Timing talks, pitches, and classroom presentations.</li>
              <li>Reviewing repeated words with keyword density.</li>
              <li>Quickly measuring pasted email or documentation drafts.</li>
            </ul>

            <h2>Normalize casing or style a short bio</h2>
            <p>
              Fix accidental caps with the{" "}
              <Link href="/case-converter">Case Converter</Link>, the{" "}
              <Link href="/title-case-converter">Title Case Converter</Link> for
              editorial headline capitalization, open the{" "}
              <Link href="/fancy-text-generator">Fancy Text Generator</Link> to
              create copy-and-paste Unicode styles for names and bios, brainstorm
              with the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>,
              or fill layouts with the{" "}
              <Link href="/lorem-ipsum-generator">Lorem Ipsum Generator</Link>.
            </p>
          </div>
        </section>

        <ToolFAQ items={faqItems} />

        <RelatedTools currentToolId="word-counter" />
      </ToolShell>
    </>
  );
}
