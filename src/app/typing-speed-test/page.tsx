import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { TypingSpeedApp } from "@/components/tools/typing-speed/TypingSpeedApp";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  TYPING_DESCRIPTION,
  TYPING_FAQS,
  TYPING_H1,
  TYPING_KEYWORDS,
  TYPING_PATH,
  TYPING_SUBTITLE,
  TYPING_TITLE,
} from "@/lib/tools/typing-speed/page-copy";

export const metadata = createPageMetadata({
  title: TYPING_TITLE,
  description: TYPING_DESCRIPTION,
  path: TYPING_PATH,
  keywords: [...TYPING_KEYWORDS],
});

export default function TypingSpeedTestPage() {
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
        name: "Typing Speed Test",
        item: absoluteUrl(TYPING_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Typing Speed Test",
    url: absoluteUrl(TYPING_PATH),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: TYPING_DESCRIPTION,
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Typing Speed Test" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title={TYPING_H1}
          description={TYPING_SUBTITLE}
          privacyNote="Typing stays in your browser — scores never leave this device."
        />

        <div className="mt-7 sm:mt-8">
          <TypingSpeedApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl">
          <h2>What Is a Typing Speed Test?</h2>
          <p>
            A typing speed test measures how quickly and accurately you can type a
            known passage in a limited time. WordMelo reports words per minute
            and keystroke accuracy from the characters you type, not from a
            document you paste. That is different from the{" "}
            <Link href="/word-counter">Word Counter</Link>, which estimates
            reading or speaking time for text you already wrote.
          </p>

          <h2>How to Test Your Typing Speed Online</h2>
          <ol>
            <li>Pick 15, 30, 60, or 120 seconds. 60 seconds is the default.</li>
            <li>Choose Words or Sentences, and Easy, Medium, or Hard.</li>
            <li>Click the passage and type what you see. The clock starts on the first character.</li>
            <li>Fix mistakes with Backspace if you want; the test ends when time runs out.</li>
            <li>Read net WPM, gross WPM, accuracy, and the mistake breakdown, then try again.</li>
          </ol>

          <h2>What Does WPM Mean?</h2>
          <p>
            WPM means words per minute. This test uses the usual five-character
            word: five typed character units count as one word, including spaces
            and punctuation. Gross WPM counts every accepted insert. Net WPM
            counts only characters that currently match the passage. If elapsed
            time is zero, both scores are zero. Net WPM is never negative.
          </p>

          <h2>How Is Typing Accuracy Calculated?</h2>
          <p>
            Accuracy is keystroke accuracy: correct inserts divided by all
            inserts, times 100. A later Backspace can repair the live passage and
            raise net WPM, but it does not remove the original incorrect
            keystroke from the accuracy denominator. The percentage cannot exceed
            100%. Corrected errors are mistakes you deleted; uncorrected errors
            are mismatches still on screen.
          </p>

          <h2>What Is a Good Typing Speed?</h2>
          <p>
            There is no single good WPM. Comfortable everyday typing, classroom
            practice, and professional transcription sit in different ranges, and
            a hard punctuation passage is not comparable to short easy words.
            Compare repeats on the same duration, mode, and difficulty. This page
            does not publish invented averages or rankings.
          </p>

          <h2>How to Improve Your Typing Speed</h2>
          <ul>
            <li>Practice a few minutes at a time rather than one exhausted sprint.</li>
            <li>Slow down until accuracy is high, then let speed follow.</li>
            <li>Keep a steady posture and watch the passage, not your fingers, as you learn touch typing.</li>
            <li>Use the same 60-second setup so personal bests stay comparable.</li>
            <li>Rest when fatigue creates extra uncorrected errors.</li>
          </ul>

          <h2>Typing Speed vs Typing Accuracy</h2>
          <p>
            Fast keystrokes with many uncorrected mistakes produce a high gross
            WPM and a weaker net score. Accurate typing with a calmer rhythm is
            usually more useful for real writing. The live WPM figure is net;
            gross WPM stays in the results so you can see the difference.
          </p>

          <h2>Why Use WordMelo&apos;s Typing Speed Test?</h2>
          <p>
            The test is free, needs no signup, and runs in your browser. You can
            choose four durations, two modes, and three difficulties that change
            the generated English. The clock uses a monotonic elapsed-time source
            and pauses if the tab is hidden, so throttled background timers cannot
            invent a faster score. Optional personal bests stay in localStorage
            on this device and never include the typed passage. WordMelo does not
            claim to be the most accurate or the fastest typing site — only that
            these formulas are the ones on the screen.
          </p>
          <p>
            After a session, count a draft in the{" "}
            <Link href="/word-counter">Word Counter</Link>, measure caption length
            with the <Link href="/character-counter">Character Counter</Link>, or
            warm up with extra English from the{" "}
            <Link href="/random-word-generator">Random Word Generator</Link>.
          </p>
        </section>

        <ToolFAQ title="Frequently asked questions" items={[...TYPING_FAQS]} />

        <RelatedTools
          currentToolId="typing-speed-test"
          preferredIds={[
            "word-counter",
            "character-counter",
            "random-word-generator",
            "alphabetizer",
          ]}
          limit={4}
        />
      </ToolShell>
    </>
  );
}
