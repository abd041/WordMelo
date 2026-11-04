import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RandomLetterApp } from "@/components/tools/random-letter/RandomLetterApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Random Letter Generator — Pick Letters A to Z | WordMelo",
  description:
    "Pick random letters A–Z instantly. Generate vowels, consonants, unique sequences, or spin an alphabet wheel. Free, customizable, and easy to use.",
  path: "/random-letter-generator",
  keywords: [
    "random letter generator",
    "random letter picker",
    "random alphabet generator",
    "generate random letters",
    "random letters A to Z",
    "random letter generator online",
    "random letter generator free",
    "random vowel generator",
    "random consonant generator",
    "random letters without repeats",
    "random letter generator wheel",
    "random letter sequence generator",
    "alphabet letter picker",
    "random uppercase letter generator",
    "random lowercase letter generator",
    "random alphabet order",
    "random letters for classroom practice",
    "random letters for word games",
  ],
});

const faqItems = [
  {
    question: "How do I generate a random letter from A to Z?",
    answer:
      "Open Instant Letter Picker, keep the A–Z pool, and press Generate Random Letter. Space or G also generates when focus is not in an input field.",
  },
  {
    question: "Is the Random Letter Generator free?",
    answer:
      "Yes. Instant picks, batches, the alphabet wheel, copy, and TXT download are free in your browser with no account required.",
  },
  {
    question: "Can I generate multiple letters?",
    answer:
      "Yes. Multiple Letters mode supports 1–100 letters with space, comma, newline, or joined formats, plus Copy All and TXT download.",
  },
  {
    question: "Can I generate vowels only?",
    answer:
      "Yes. Choose Vowels for A, E, I, O, U. Optionally enable Count Y as a vowel under Advanced options; by default Y is a consonant.",
  },
  {
    question: "Can I generate consonants only?",
    answer:
      "Yes. Consonants mode uses the 21 non-vowel letters under the default Y-as-consonant rule.",
  },
  {
    question: "How do I avoid repeating letters?",
    answer:
      "Use Unique within batch for one Multiple Letters result, or No repeats this session to skip previously drawn base letters until you reset. Exhausted pools show a clear message instead of recycling letters.",
  },
  {
    question: "Can I exclude specific letters?",
    answer:
      "Yes. Open Exclude letters and toggle any A–Z letters. Exclusions apply after the base pool — for example vowels minus A.",
  },
  {
    question: "Can I shuffle the alphabet?",
    answer:
      "Yes. Use the Alphabet Shuffle preset or Shuffle pool in Multiple Letters to list every eligible letter exactly once in random order.",
  },
  {
    question: "How does the alphabet wheel choose a letter?",
    answer:
      "The letter is selected with the same unbiased sampler first; the wheel only animates to that predetermined segment. Reduced-motion users get an immediate update. The result is always shown in plain text.",
  },
  {
    question: "Does WordMelo generate letters locally?",
    answer:
      "Yes. Letter generation, history, copy, and download run locally in your browser. Custom pools and results are not uploaded.",
  },
];

export default function RandomLetterGeneratorPage() {
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
        name: "Random Letter Generator",
        item: absoluteUrl("/random-letter-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Random Letter Generator",
    url: absoluteUrl("/random-letter-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Pick random English letters A–Z with vowel and consonant pools, exclusions, unique batches, and an alphabet wheel — processed locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Random Letter Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Random Letter Generator — Pick Random Letters A to Z"
          description="Generate random letters instantly. Choose vowels, consonants, or custom letters, create unique sequences, or spin an interactive alphabet wheel."
          privacyNote="Letter picks stay local in your browser and are not uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <RandomLetterApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is a Random Letter Generator?</h2>
            <p>
              A random letter generator (or alphabet letter picker) selects
              letters from a pool so each eligible letter is equally likely on an
              independent draw. WordMelo focuses on English A–Z for classrooms,
              drills, and informal word games — not full vocabulary words.
            </p>
          </div>

          <div>
            <h2>How to generate a random letter</h2>
            <ol>
              <li>Choose Instant Letter Picker, Multiple Letters, or Alphabet Wheel.</li>
              <li>Set the pool (A–Z, vowels, consonants, or custom) and case.</li>
              <li>Press Generate, Spin, or Shuffle — then copy or download results.</li>
            </ol>
          </div>

          <div>
            <h2>Generate random letters A to Z</h2>
            <p>
              The default pool is the full English alphabet. Instant mode shows
              one large letter with Focus Mode for classroom screens. Shortcuts:
              Space or G to generate, C to copy, Esc to leave focus.
            </p>
          </div>

          <div>
            <h2>Random vowels and consonants</h2>
            <p>
              Vowels default to A, E, I, O, U. Consonants are the remaining 21
              letters, with Y as a consonant unless you enable Count Y as a
              vowel. Pool counts update live so eligibility stays accurate.
            </p>
          </div>

          <div>
            <h2>Generate multiple letters</h2>
            <p>
              Request 1–100 letters. Choose space-separated, comma-separated, one
              per line, or a joined sequence. Copy All and Download TXT use that
              exact format — no UI labels or decoration.
            </p>
          </div>

          <div>
            <h2>Random letters without repeats</h2>
            <p>
              Unique within batch prevents duplicate base letters in one Multiple
              Letters result. No repeats this session excludes previously drawn
              bases until you reset. If the pool is exhausted, WordMelo shows a
              clear message instead of silently recycling letters. Uppercase and
              lowercase are display variants — A and a count as the same base.
            </p>
          </div>

          <div>
            <h2>Alphabet Wheel</h2>
            <p>
              Spin an interactive wheel with readable letter labels. The winner is
              chosen with the shared sampler first; animation lands on that exact
              segment. Keyboard users can spin without relying on visuals. There
              is no sound, betting, or gambling mechanics.
            </p>
          </div>

          <div>
            <h2>Shuffle the English alphabet</h2>
            <p>
              Alphabet Shuffle lists every eligible letter once using Fisher–Yates
              with an unbiased index source — ideal for fair turn order or full
              A–Z practice.
            </p>
          </div>

          <div>
            <h2>Custom letters and exclusions</h2>
            <p>
              Enter a custom pool such as ABCDE or RSTLN. Separators are fine;
              duplicates are normalized and unsupported characters are rejected.
              Exclusions remove letters after the base pool is built.
            </p>
          </div>

          <div>
            <h2>Random letters for classroom practice</h2>
            <p>
              Example activities: name the letter, say its sound, or find a
              classroom object that starts with it. Classroom Mode and Focus Mode
              enlarge a single letter; switch to lowercase when learners are ready.
            </p>
          </div>

          <div>
            <h2>Random letters for word games</h2>
            <p>
              The Word Games preset skips Q, X, and Z while enabling session
              no-repeat — handy for categories-style rounds. This is a letter
              picker, not a full game engine. For complete English words, use the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>.
            </p>
          </div>

          <div>
            <h2>How random selection works</h2>
            <p>
              Eligible letters are filtered first. Uniform draws use{" "}
              <code>crypto.getRandomValues</code> with rejection sampling when
              available so each remaining base letter has equal chance. Mixed case
              chooses display case independently after the base letter is picked.
              Unique and no-repeat modes are conditioned draws, not independent
              1/26 probabilities.
            </p>
          </div>

          <div>
            <h2>Useful examples</h2>
            <div className="not-prose mt-3 overflow-x-auto rounded-[1rem] border border-line">
              <table className="w-full min-w-[24rem] text-left text-sm">
                <thead className="bg-mint/40 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Task</th>
                    <th className="px-3 py-2.5 font-semibold">Settings</th>
                    <th className="px-3 py-2.5 font-semibold">Expected behavior</th>
                  </tr>
                </thead>
                <tbody className="bg-surface text-ink-muted">
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Pick one random vowel</td>
                    <td className="px-3 py-2.5">Instant · Vowels · Uppercase</td>
                    <td className="px-3 py-2.5">One of A E I O U</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Generate five unique letters</td>
                    <td className="px-3 py-2.5">Multiple · 5 · unique batch</td>
                    <td className="px-3 py-2.5">Five distinct bases</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Shuffle A–Z</td>
                    <td className="px-3 py-2.5">Alphabet Shuffle preset</td>
                    <td className="px-3 py-2.5">All 26 once, randomized</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Select from A, B, C, D</td>
                    <td className="px-3 py-2.5">Custom pool: ABCD</td>
                    <td className="px-3 py-2.5">Only those four letters</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Ten lowercase letters</td>
                    <td className="px-3 py-2.5">Multiple · 10 · Lowercase</td>
                    <td className="px-3 py-2.5">a–z display forms</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Table rows are explanatory samples, not live draws.
            </p>
          </div>

          <div>
            <h2>Privacy and limitations</h2>
            <p>
              Generation runs in your browser. English A–Z is the supported
              alphabet in this release. Offline use works after the page has
              loaded. Frequency-weighted English letter selection is not included
              — draws stay uniform unless you change the pool yourself. For
              drawing prompts, try the{" "}
              <Link href="/pictionary-word-generator">
                Pictionary Word Generator
              </Link>
              .
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools currentToolId="random-letter-generator" />
      </ToolShell>
    </>
  );
}
