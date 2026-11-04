import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PictionaryApp } from "@/components/tools/pictionary/PictionaryApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { PROMPT_STATS } from "@/lib/tools/pictionary";

export const metadata = createPageMetadata({
  title: "Pictionary Word Generator — Free Words to Draw | WordMelo",
  description:
    "Generate random Pictionary words with easy, medium, and hard difficulty. Enjoy family-friendly drawing prompts, categories, a timer, and team scoring.",
  path: "/pictionary-word-generator",
  keywords: [
    "pictionary word generator",
    "pictionary words",
    "random pictionary words",
    "pictionary word list",
    "random word generator for pictionary",
    "pictionary drawing prompts",
    "pictionary game word generator",
    "easy pictionary words",
    "medium pictionary words",
    "hard pictionary words",
    "pictionary words for kids",
    "family friendly pictionary words",
    "pictionary word generator with timer",
    "online pictionary word generator",
  ],
});

const faqItems = [
  {
    question: "What is a Pictionary Word Generator?",
    answer:
      "It creates drawing prompts for a sketch-and-guess game. WordMelo uses an independent curated list of non-living subjects and is not an official Pictionary product.",
  },
  {
    question: "Is this drawing-word generator free?",
    answer:
      "Yes. Quick generation and the local team game are free in your browser with no account required.",
  },
  {
    question: "How do I generate random drawing prompts?",
    answer:
      "Open Quick Word Generator, choose difficulty and categories, then press Generate Prompt. Use Next Prompt for another eligible word.",
  },
  {
    question: "What is the difference between Easy, Medium and Hard?",
    answer:
      "Easy covers simple familiar objects, Medium needs modest detail, and Hard covers more complex drawable structures — based on drawing complexity, not word rarity.",
  },
  {
    question: "Can I choose drawing categories?",
    answer:
      "Yes. Filter by fruits, plants, landscapes, buildings, vehicles, household items, technology, shapes, weather, tools, and more — all non-living subjects.",
  },
  {
    question: "How do I play with teams?",
    answer:
      "Open Play Pictionary, set team names if you like, start a game, reveal the prompt only to the drawer, run the timer, and mark Correct or Skip to advance rounds.",
  },
  {
    question: "How does the timer work?",
    answer:
      "Choose 30, 60, 90, or 120 seconds. Start, pause, and resume as needed. Time-up pauses play without awarding points. An optional beep is muted by default.",
  },
  {
    question: "Can I avoid repeated prompts?",
    answer:
      "Yes. No-repeat session skips prompt IDs already used until the eligible pool is exhausted, then you can reset.",
  },
  {
    question: "Are the prompts family-friendly?",
    answer:
      "They are curated to exclude humans, animals, alcohol, gambling, weapons, music performance, and similar themes. Filtering is best-effort and is not a religious certification.",
  },
  {
    question: "Can teachers use the tool in classrooms?",
    answer:
      "Yes as a practical drawing-prompt helper with Easy filters and shorter timers. Supervise as needed — WordMelo does not certify age ratings.",
  },
  {
    question: "Does the tool require an account?",
    answer: "No. Everything runs locally in your browser.",
  },
  {
    question: "Is WordMelo affiliated with the official Pictionary game?",
    answer:
      "No. WordMelo is an independent free tool and is not affiliated with or endorsed by any commercial Pictionary trademark holder.",
  },
];

export default function PictionaryWordGeneratorPage() {
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
        name: "Pictionary Word Generator",
        item: absoluteUrl("/pictionary-word-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Pictionary Word Generator",
    url: absoluteUrl("/pictionary-word-generator"),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate curated family-friendly drawing prompts and play timed team rounds locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pictionary Word Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Pictionary Word Generator — Random Words to Draw"
          description="Generate fun drawing prompts in seconds. Choose easy, medium, or hard words, explore family-friendly categories, or play a timed drawing game with teams."
          privacyNote="Prompts and scores stay local in your browser and are not uploaded."
        />

        <p className="mt-2 max-w-3xl text-xs text-ink-soft">
          Independent free tool — not affiliated with any commercial Pictionary
          trademark holder. Curated non-living drawing prompts ({PROMPT_STATS.total}).
        </p>

        <div className="mt-7 sm:mt-8">
          <PictionaryApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl space-y-9">
          <div>
            <h2>What is a Pictionary Word Generator?</h2>
            <p>
              It supplies drawing prompts for a sketch-and-guess activity. One
              player draws while others guess. WordMelo is an independent helper
              with a curated non-living-subject list — not an official Pictionary
              product or licensed word pack.
            </p>
          </div>

          <div>
            <h2>How to generate random drawing words</h2>
            <ol>
              <li>Open Quick Word Generator.</li>
              <li>Pick Easy, Medium, Hard, or Mixed.</li>
              <li>Optionally open Categories and select a few.</li>
              <li>Press Generate Prompt, then Next Prompt as needed.</li>
              <li>Copy the prompt if you want it on another device.</li>
            </ol>
          </div>

          <div>
            <h2>How to play a drawing-and-guessing game</h2>
            <ol>
              <li>Open Play Pictionary and start a game.</li>
              <li>Pass the device to the drawer and Reveal Prompt.</li>
              <li>Hide the prompt, start the timer, and begin drawing.</li>
              <li>Mark Correct when teammates guess, or Skip / Next Round.</li>
              <li>End Game for a score summary.</li>
            </ol>
          </div>

          <div>
            <h2>Easy, medium and hard Pictionary words</h2>
            <p>
              Difficulty reflects drawing complexity. This build includes{" "}
              {PROMPT_STATS.easy} easy, {PROMPT_STATS.medium} medium, and{" "}
              {PROMPT_STATS.hard} hard prompts.
            </p>
            <div className="not-prose mt-4 overflow-x-auto rounded-[1rem] border border-line">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead className="bg-mint/40 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Category</th>
                    <th className="px-3 py-2.5 font-semibold">Easy</th>
                    <th className="px-3 py-2.5 font-semibold">Medium</th>
                    <th className="px-3 py-2.5 font-semibold">Hard</th>
                  </tr>
                </thead>
                <tbody className="bg-surface text-ink-muted">
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Fruits &amp; vegetables</td>
                    <td className="px-3 py-2.5">Apple</td>
                    <td className="px-3 py-2.5">Bell pepper</td>
                    <td className="px-3 py-2.5">Romanesco broccoli</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Buildings</td>
                    <td className="px-3 py-2.5">House</td>
                    <td className="px-3 py-2.5">Lighthouse</td>
                    <td className="px-3 py-2.5">Suspension bridge</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Technology</td>
                    <td className="px-3 py-2.5">Laptop</td>
                    <td className="px-3 py-2.5">Projector</td>
                    <td className="px-3 py-2.5">Solar panel system</td>
                  </tr>
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5">Landscapes</td>
                    <td className="px-3 py-2.5">Mountain</td>
                    <td className="px-3 py-2.5">Waterfall</td>
                    <td className="px-3 py-2.5">Terraced rice fields</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Examples are labeled samples from the curated dataset, not a live draw.
            </p>
          </div>

          <div>
            <h2>Drawing prompt categories</h2>
            <p>
              Allowed categories include fruits and vegetables, plants, landscapes,
              buildings, rooms and furniture, vehicles, household items, stationery,
              technology, shapes, weather, and tools. Humans, animals, alcohol,
              gambling, weapons, and music-performance prompts are excluded.
            </p>
          </div>

          <div>
            <h2>Pictionary words for family games</h2>
            <p>
              The dataset is curated for family and classroom drawing games under a
              documented non-living-subject policy. It is not a religious
              certification or universal scholarly ruling. Supervise as needed for
              your group.
            </p>
          </div>

          <div>
            <h2>How to use the game timer</h2>
            <p>
              Choose 30, 60, 90, or 120 seconds. Remaining time is calculated from a
              deadline clock so pause/resume stays accurate. Hidden tabs pause the
              timer. Expiration never auto-awards points.
            </p>
          </div>

          <div>
            <h2>Playing with two teams</h2>
            <p>
              Custom team names are optional. Correct awards one point to the
              drawing team and advances the round. Manual +/− corrects mistakes.
              There are no wagers or stakes.
            </p>
          </div>

          <div>
            <h2>How to prevent repeated drawing words</h2>
            <p>
              No-repeat tracks prompt IDs for the session. When the eligible pool
              is empty, reset the session or widen filters. WordMelo never falls
              back to an unrestricted dictionary.
            </p>
          </div>

          <div>
            <h2>Using drawing prompts in classrooms</h2>
            <p>
              Teachers can start with Easy prompts, short timers, and Focus mode.
              Students still draw on paper or a board — the tool only supplies
              prompts and scores.
            </p>
          </div>

          <div>
            <h2>Related tools</h2>
            <p>
              For general vocabulary (not drawing-only), try the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>.
              For single-letter picks, use the{" "}
              <Link href="/random-letter-generator">
                Random Letter Generator
              </Link>
              . Shape drafts with the{" "}
              <Link href="/word-counter">Word Counter</Link> or{" "}
              <Link href="/case-converter">Case Converter</Link>.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools currentToolId="pictionary-word-generator" />
      </ToolShell>
    </>
  );
}
