import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { WordCloudApp } from "@/components/tools/word-cloud/WordCloudApp";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  WORD_CLOUD_DESCRIPTION,
  WORD_CLOUD_FAQS,
  WORD_CLOUD_H1,
  WORD_CLOUD_KEYWORDS,
  WORD_CLOUD_PATH,
  WORD_CLOUD_SUBTITLE,
  WORD_CLOUD_TITLE,
} from "@/lib/tools/word-cloud/page-copy";

export const metadata = createPageMetadata({
  title: WORD_CLOUD_TITLE,
  description: WORD_CLOUD_DESCRIPTION,
  path: WORD_CLOUD_PATH,
  keywords: [...WORD_CLOUD_KEYWORDS],
});

export default function WordCloudGeneratorPage() {
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
        name: "Word Cloud Generator",
        item: absoluteUrl(WORD_CLOUD_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Word Cloud Generator",
    url: absoluteUrl(WORD_CLOUD_PATH),
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
      "Create a word cloud from pasted text, adjust frequency filters, shapes, fonts, and colors, then download PNG or SVG locally in your browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Word Cloud Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title={WORD_CLOUD_H1}
          description={WORD_CLOUD_SUBTITLE}
          privacyNote="Your text stays in your browser — nothing is uploaded."
        />

        <div className="mt-7 sm:mt-8">
          <WordCloudApp />
        </div>

        <section className="prose-wordmelo mt-14 max-w-3xl">
          <h2>What Is a Word Cloud Generator?</h2>
          <p>
            A word cloud generator turns a passage into a picture of its
            vocabulary. Words that appear more often are drawn larger, and
            words that appear once stay small. The picture is a frequency view,
            not a summary of the argument. Read the frequency table beside the
            cloud when you need the exact counts.
          </p>

          <h2>How to Create a Word Cloud</h2>
          <ol>
            <li>Paste or type the text you want to picture.</li>
            <li>Set how many words to show, and whether common words stay in.</li>
            <li>Choose a shape, font, palette, and background.</li>
            <li>Press Generate. Regenerate keeps the words and changes the layout seed.</li>
            <li>Download a PNG or SVG, or copy the image when your browser allows it.</li>
          </ol>

          <h2>Popular Ways to Use Word Clouds</h2>
          <ul>
            <li>Classroom activities that ask students to notice repeated language.</li>
            <li>School projects and posters built from a poem, essay, or speech.</li>
            <li>Slides that need a visual of themes before the real headline is written.</li>
            <li>Writing analysis of a draft’s favorite words.</li>
            <li>Brainstorming sessions where quantity comes before editing.</li>
            <li>Team workshops and notes from a meeting.</li>
            <li>Survey comments and feedback, when you still plan to read the originals.</li>
            <li>Social graphics, using a downloaded PNG with a transparent background.</li>
          </ul>

          <h2>How Word Frequency Affects a Word Cloud</h2>
          <p>
            Each word’s size follows how many times it appears in the text you
            generated from. A word used ten times is larger than a word used
            once, between the minimum and maximum sizes you set. If the classic
            opening words of a language — the, and, is, to, of — would dominate
            the picture, leave common-word filtering on. Turn it off when those
            words are the point.
          </p>
          <p>
            Case is ignored by default, so “Clarity” and “clarity” count as one
            word. The cloud shows the spelling that appeared most often.
            Highlighted words are kept even when they would otherwise be filtered,
            and they use a distinct color.
          </p>

          <h2>Tips for Creating Better Word Clouds</h2>
          <ul>
            <li>Start from a passage with a real subject, not a random word list, if you want the large words to mean something.</li>
            <li>Exclude names or filler you do not want to emphasize.</li>
            <li>Keep the palette dark on a light background. The page warns when contrast gets weak.</li>
            <li>Use horizontal words when the cloud has to be read quickly. Vertical and slight rotation are optional.</li>
            <li>If a shape cannot hold every selected word, the page names the ones left out. Rectangle fits more words than a heart or diamond.</li>
            <li>
              Check exact counts in the{" "}
              <Link href="/word-counter">Word Counter</Link> or the{" "}
              <Link href="/character-counter">Character Counter</Link> before you
              treat the picture as a measurement.
            </li>
            <li>
              Need words to start from? Try the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>,
              the <Link href="/fancy-text-generator">Fancy Text Generator</Link>{" "}
              for styled copy, or the{" "}
              <Link href="/pictionary-word-generator">Pictionary Word Generator</Link>{" "}
              for drawing prompts. Those tools do a different job from this cloud.
            </li>
          </ul>
          <p>
            Counts follow word-like tokens. Apostrophes and hyphens stay inside
            words such as don’t and well-known. Punctuation alone is not a word.
            Very long passages use the first 80,000 characters.
          </p>
        </section>

        <ToolFAQ title="Frequently asked questions" items={[...WORD_CLOUD_FAQS]} />

        <RelatedTools
          currentToolId="word-cloud-generator"
          preferredIds={[
            "word-counter",
            "character-counter",
            "random-word-generator",
            "fancy-text-generator",
            "pictionary-word-generator",
          ]}
          limit={5}
        />
      </ToolShell>
    </>
  );
}
