import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RandomWordGeneratorApp } from "@/components/tools/random-word/RandomWordGeneratorApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Random Word Generator — Free Words by Length & Type | WordMelo",
  description:
    "Generate random English words instantly. Filter by nouns, verbs, adjectives, word length, difficulty, or starting letters. Copy or download for free.",
  path: "/random-word-generator",
  keywords: [
    "random word generator",
    "random words",
    "random word picker",
    "generate random words",
    "random word generator online",
    "free random word generator",
    "random English words",
    "random noun generator",
    "random verb generator",
    "random adjective generator",
    "random five letter word generator",
    "random word generator by length",
    "random words starting with a letter",
    "random words ending with a letter",
    "random words without repeats",
    "random vocabulary words",
    "random words for writing",
    "random words for games",
  ],
});

const faqItems = [
  {
    question: "What is a Random Word Generator?",
    answer:
      "It selects English words from a curated vocabulary using filters you choose — useful for writing prompts, vocabulary practice, and informal games.",
  },
  {
    question: "Is this generator free?",
    answer:
      "Yes. WordMelo’s Random Word Generator is free to use in your browser with no account required.",
  },
  {
    question: "How do I generate random English words?",
    answer:
      "Choose a count, optionally set type, length, letters, and difficulty, then press Generate Random Words. Use Regenerate for another unique set with the same filters.",
  },
  {
    question: "Can I generate only nouns, verbs or adjectives?",
    answer:
      "Yes. Select Nouns, Verbs, or Adjectives under Word type. Tags come from WordNet and related open sources; some words have more than one role.",
  },
  {
    question: "Can I generate five-letter words?",
    answer:
      "Yes. Use Exact length set to 5, or apply the Five-Letter Words preset.",
  },
  {
    question: "Can I choose starting and ending letters?",
    answer:
      "Yes. Use Starts with and Ends with (A–Z). Combined filters that match nothing show a clear empty state — filters are never silently relaxed.",
  },
  {
    question: "Can I generate words without repeats?",
    answer:
      "Yes. Each result list never contains duplicates. Optionally skip words from previous rounds until the eligible pool is exhausted.",
  },
  {
    question: "How does vocabulary difficulty work?",
    answer:
      "Easy, Medium, and Hard are approximate bands based on Google-10k frequency and word length. They are a documented heuristic, not a clinical or school-validated scale.",
  },
  {
    question: "Can I use random words for writing and games?",
    answer:
      "Yes as informal prompts. Creative Writing, Vocabulary Practice, and Word Games presets apply practical filters. For curated drawing prompts and timed team play, use the Pictionary Word Generator.",
  },
  {
    question: "Where does the word list come from?",
    answer:
      "Princeton WordNet lemmas for parts of speech, Google 10k USA no-swears ranks for common coverage, and CC0 corpora lists. See the sources section on this page.",
  },
  {
    question: "Are the results truly random?",
    answer:
      "Each draw is uniform over the words that match your filters. Sampling uses crypto.getRandomValues with rejection sampling. If that source is missing, WordMelo shows an error and does not substitute a weaker generator.",
  },
  {
    question: "Does WordMelo process everything locally?",
    answer:
      "Yes. Filtering, sampling, favorites, history, copy, and download run in your browser. Generated lists are not uploaded for analysis.",
  },
];

export default function RandomWordGeneratorPage() {
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
        name: "Random Word Generator",
        item: absoluteUrl("/random-word-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Random Word Generator",
    url: absoluteUrl("/random-word-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate random English words with filters for length, part of speech, difficulty, and letters — processed locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Random Word Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Random Word Generator"
          description="Generate random English words instantly. Choose nouns, verbs, adjectives, word length, and difficulty, or use quick presets for writing and games."
          privacyNote="Words are generated locally in your browser and are not uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <RandomWordGeneratorApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is a Random Word Generator?</h2>
            <p>
              A random word generator draws English vocabulary from a prepared
              list using rules you set. WordMelo filters the eligible pool first,
              then samples unique words without replacement so every result
              matches your criteria.
            </p>
          </div>

          <div>
            <h2>How to generate random words</h2>
            <ol>
              <li>Choose how many words you need (1–100).</li>
              <li>Optionally set word type, length, and letters.</li>
              <li>Open Advanced filters for difficulty and coverage if needed.</li>
              <li>
                Press Generate Random Words — or start from a preset and edit
                afterward.
              </li>
              <li>Copy one word, copy all, or download a UTF-8 TXT file.</li>
            </ol>
          </div>

          <div>
            <h2>Generate random nouns, verbs and adjectives</h2>
            <p>
              Word-type filters use Princeton WordNet lemmas plus open corpora
              supplements. Many English words have more than one grammatical
              role; when sources justify it, a word can match more than one
              category. Categories are never invented from simple suffix rules.
            </p>
          </div>

          <div>
            <h2>Random words by length</h2>
            <p>
              Length means letter count for alphabetic entries (3–14 letters in
              the shipped vocabulary). Choose Any, Exact, or Min–max. Hyphenated
              and multi-word expressions are excluded so length filters stay
              predictable.
            </p>
            <div className="not-prose mt-4 overflow-x-auto rounded-[1rem] border border-line">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead className="bg-mint/40 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Goal</th>
                    <th className="px-3 py-2.5 font-semibold">Suggested filter</th>
                  </tr>
                </thead>
                <tbody className="bg-surface text-ink-muted">
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Five-letter words</td>
                    <td className="px-3 py-2.5">Exact length = 5</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Short prompts</td>
                    <td className="px-3 py-2.5">Min 3 · Max 6</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Longer vocabulary</td>
                    <td className="px-3 py-2.5">Min 7 · Max 12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2>Generate five-letter words</h2>
            <p>
              Use Exact length = 5 or the Five-Letter Words preset. Example
              workflow: Common vocabulary → Exact 5 → Generate 10. Words such as{" "}
              <em>apple</em>, <em>river</em>, or <em>light</em> appear only when
              they exist in the filtered pool — labeled examples here, not a live
              draw.
            </p>
          </div>

          <div>
            <h2>Random words beginning or ending with letters</h2>
            <p>
              Starts with and Ends with accept a single A–Z letter. Combine them
              with nouns, length, and difficulty — for example adjectives ending
              in Y, or six-letter nouns starting with B. Empty pools are explained
              instead of quietly relaxing filters.
            </p>
          </div>

          <div>
            <h2>Random words for creative writing</h2>
            <p>
              The Creative Writing preset leans on medium-difficulty common words
              in a practical length range. Use results as prompt seeds: place a
              character next to a noun, invent a conflict from a verb, or open a
              scene with an unexpected adjective.
            </p>
          </div>

          <div>
            <h2>Random words for vocabulary practice</h2>
            <p>
              The Vocabulary Practice preset generates common English words suited
              to general learning drills — flashcards, sentence writing, or
              synonym/antonym exercises. Pair Easy or Medium difficulty with Common
              coverage for everyday study; switch to Extended when you want rarer
              lemmas.
            </p>
          </div>

          <div>
            <h2>Random words for games</h2>
            <p>
              The Word Games preset produces general noun prompts for informal
              play. For starting letters instead of full words, open the{" "}
              <Link href="/random-letter-generator">
                Random Letter Generator
              </Link>
              . For a dedicated drawing-prompt tool with timer and team scoring,
              open the{" "}
              <Link href="/pictionary-word-generator">
                Pictionary Word Generator
              </Link>
              . Keep the tone appropriate for your group — Random Word Generator
              filtering is best-effort and is not a certified child-safe list.
            </p>
          </div>

          <div>
            <h2>How WordMelo selects words randomly</h2>
            <p>
              Eligible words are filtered first. Then WordMelo samples uniformly
              without replacement using <code>crypto.getRandomValues</code> with
              rejection sampling. If that source is missing, no words are
              generated. If you ask for more unique words than remain, you get
              every available match plus a clear count message — never silent
              repeats.
            </p>
          </div>

          <div>
            <h2>Where do the words come from?</h2>
            <p>
              The shipped dataset merges WordNet 3.0 lemmas (WordNet license),
              Google 10,000 English USA no-swears ranks (MIT), and dariusk/corpora
              noun/verb/adjective lists (CC0). Common coverage follows Google-10k
              ranks; Extended adds rarer WordNet lemmas. Full provenance is in{" "}
              <code>DATA_SOURCES.md</code> for this tool.
            </p>
          </div>

          <div>
            <h2>Privacy and limitations</h2>
            <p>
              Generation, filtering, favorites, recent history, copy, and TXT
              download run in your browser. Offline use works after the page and
              vocabulary asset have loaded. Difficulty bands are approximate.
              Offensive-term filtering is best-effort, not a child-safety
              certification. Syllable filtering is not offered because the dataset
              does not include reliable syllable metadata.
            </p>
            <p>
              After brainstorming, continue with the{" "}
              <Link href="/alphabetizer">Alphabetizer</Link> to sort the words, the{" "}
              <Link href="/word-counter">Word Counter</Link>,{" "}
              <Link href="/case-converter">Case Converter</Link>,{" "}
              <Link href="/fancy-text-generator">Fancy Text Generator</Link>,{" "}
              <Link href="/cursive-generator">Cursive Generator</Link>, or the{" "}
              <Link href="/lorem-ipsum-generator">Lorem Ipsum Generator</Link>{" "}
              when you need layout placeholder text instead of English
              vocabulary prompts.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools
          currentToolId="random-word-generator"
          preferredIds={[
            "random-letter-generator",
            "pictionary-word-generator",
            "word-counter",
            "character-counter",
          ]}
          limit={6}
        />
      </ToolShell>
    </>
  );
}
