import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CursiveGeneratorApp } from "@/components/tools/cursive-generator/CursiveGeneratorApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  CURSIVE_FONTS,
  CURSIVE_SAMPLE_NAME,
  CURSIVE_SAMPLE_TEXT,
  CURSIVE_UNICODE_STYLES,
  getCursiveUnicodeStyle,
} from "@/lib/tools/cursive-generator";

export const metadata = createPageMetadata({
  title: "Cursive Generator — Copy & Paste Text & Fonts | WordMelo",
  description:
    "Create cursive text and handwriting online. Copy stylish Unicode fonts, design names with real script typefaces, and download cursive lettering as PNG.",
  path: "/cursive-generator",
  keywords: [
    "cursive generator",
    "cursive font generator",
    "cursive text generator",
    "cursive maker",
    "cursive writing generator",
    "cursive name generator",
    "cursive fonts copy and paste",
    "cursive font generator copy and paste",
    "fancy cursive font generator",
    "cursive handwriting generator",
    "convert text to cursive",
    "names in cursive",
  ],
});

const faqItems = [
  {
    question: "How do I convert text to cursive?",
    answer:
      "Open Copy & Paste Cursive, type your words, then copy Mathematical Script or Bold Mathematical Script. For an image, switch to Handwriting Studio and download PNG.",
  },
  {
    question: "Can I copy and paste cursive fonts?",
    answer:
      "Yes for Unicode mathematical script styles. They paste as special characters. Handwriting fonts export as PNG images, not system font installers.",
  },
  {
    question: "How do I write my name in cursive?",
    answer:
      "Select Name Mode, enter a name, copy a Unicode design, or open Handwriting Studio to customize a font and download a PNG.",
  },
  {
    question: "Is the Cursive Generator free?",
    answer:
      "Yes. It is free to use in your browser with no account required.",
  },
  {
    question: "Can I download cursive handwriting?",
    answer:
      "Yes. Handwriting Studio exports WordMelo-cursive-writing.png with your font, size, color, alignment, and background — including real transparency.",
  },
  {
    question: "What is the difference between cursive text and handwriting fonts?",
    answer:
      "Unicode cursive is copyable text made of mathematical script characters. Handwriting fonts are real OFL typefaces rendered for preview and PNG export.",
  },
  {
    question: "Why do some cursive characters look different?",
    answer:
      "Apps choose their own fonts for Unicode script code points. Missing glyphs may look plain. PNG handwriting stays consistent because letterforms are in the image.",
  },
  {
    question: "Does cursive work on Instagram or TikTok?",
    answer:
      "Unicode script often works in bios and captions, but support varies. Where special characters fail, upload a handwriting PNG instead. Compatibility is not guaranteed.",
  },
  {
    question: "Can I change font size and color?",
    answer:
      "Yes in Handwriting Studio — plus background, alignment, spacing, layout presets, and standard or high-resolution PNG export.",
  },
  {
    question: "Is my text uploaded to a server?",
    answer:
      "No. Conversion, font rendering, and PNG export run locally in your browser.",
  },
];

function example(styleId: string, text = CURSIVE_SAMPLE_TEXT): string {
  return getCursiveUnicodeStyle(styleId)?.transform(text) ?? text;
}

export default function CursiveGeneratorPage() {
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
        name: "Cursive Generator",
        item: absoluteUrl("/cursive-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Cursive Generator",
    url: absoluteUrl("/cursive-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Create copyable Unicode cursive text and download handwritten cursive writing as PNG — processed locally in your browser.",
  };

  const unicodeAlphabets = CURSIVE_UNICODE_STYLES.filter(
    (style) => style.isMathematicalScript,
  );
  const decorativeStyles = CURSIVE_UNICODE_STYLES.filter(
    (style) => !style.isMathematicalScript,
  );

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cursive Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Cursive Generator — Create Cursive Text & Handwriting"
          description="Turn words and names into beautiful cursive. Copy Unicode script text, preview real handwriting fonts, or download personalized lettering as a PNG."
          privacyNote="Runs locally in your browser — text is not uploaded."
        />

        <CursiveGeneratorApp />

        <div className="ad-region" aria-hidden="true" />

        <section
          aria-labelledby="cursive-guide"
          className="space-y-4"
        >
          <div className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6">
            <h2
              id="cursive-guide"
              className="font-display text-2xl font-semibold text-ink"
            >
              What is a Cursive Generator?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              A cursive generator turns plain words into script-style lettering.
              WordMelo offers two complementary workflows: copyable Unicode
              mathematical script, and a Handwriting Studio that renders real OFL
              cursive fonts for PNG download.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                How to convert text into cursive
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                <li>Open Copy & Paste Cursive.</li>
                <li>
                  Type a phrase such as{" "}
                  <code className="rounded bg-mint px-1.5 py-0.5 text-ink">
                    {CURSIVE_SAMPLE_TEXT}
                  </code>
                  .
                </li>
                <li>
                  Copy Mathematical Script:{" "}
                  <span className="font-serif text-base text-ink">
                    {example("script")}
                  </span>
                </li>
              </ol>
            </article>

            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                How to make cursive handwriting
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                <li>Open Handwriting Studio.</li>
                <li>
                  Choose one of {CURSIVE_FONTS.length} self-hosted OFL fonts.
                </li>
                <li>
                  Adjust size, color, and background, then download{" "}
                  <code className="rounded bg-mint px-1.5 py-0.5 text-ink">
                    WordMelo-cursive-writing.png
                  </code>
                  .
                </li>
              </ol>
            </article>
          </div>

          <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6">
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Cursive fonts you can copy and paste
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Only Mathematical Script and Bold Mathematical Script are genuine
              Unicode alphabets. Decorative designs wrap those alphabets — they
              are not extra fonts.
            </p>
            <div className="mt-4 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-mint/50 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Style</th>
                    <th className="px-3 py-2.5 font-semibold">Kind</th>
                    <th className="px-3 py-2.5 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[...unicodeAlphabets, ...decorativeStyles].map((style) => (
                    <tr key={style.id}>
                      <td className="px-3 py-2.5 font-medium text-ink">
                        {style.name}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {style.isMathematicalScript
                          ? "Unicode alphabet"
                          : "Decorative design"}
                      </td>
                      <td className="px-3 py-2.5 font-serif text-base text-ink">
                        {style.transform("Hello")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Create your name in cursive
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Use Name Mode for short personalizations. Example for{" "}
                <code className="rounded bg-mint px-1.5 py-0.5 text-ink">
                  {CURSIVE_SAMPLE_NAME}
                </code>
                :
              </p>
              <p className="mt-3 font-serif text-2xl text-ink">
                {example("script", CURSIVE_SAMPLE_NAME)}
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                Open Handwriting from any card to turn the same name into a PNG
                with color and background controls.
              </p>
            </article>

            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Unicode cursive vs handwriting fonts
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
                <li>
                  <strong className="text-ink">Unicode</strong> — editable text
                  after paste; each app draws the characters differently.
                </li>
                <li>
                  <strong className="text-ink">Handwriting PNG</strong> —
                  consistent letterforms, custom color/background, not editable
                  as plain text.
                </li>
              </ul>
            </article>
          </div>

          <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6">
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Compare handwriting fonts
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              All seven fonts are OFL-licensed, self-hosted Latin WOFF2 subsets.
            </p>
            <div className="mt-4 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-mint/50 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Font</th>
                    <th className="px-3 py-2.5 font-semibold">Feel</th>
                    <th className="px-3 py-2.5 font-semibold">Best for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {CURSIVE_FONTS.map((font) => (
                    <tr key={font.id}>
                      <td className="px-3 py-2.5 font-medium text-ink">
                        {font.label}
                      </td>
                      <td className="px-3 py-2.5 capitalize text-ink-muted">
                        {font.category}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {font.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                How to download cursive writing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Choose a font and layout, pick Standard or High-res PNG, then
                download. Transparent backgrounds use a checkerboard only in
                preview — the file has a true alpha channel. SVG/PDF are omitted
                until fonts can travel portably.
              </p>
            </article>

            <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Where can you use cursive text?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Bios, display names, captions, invitation mockups, and personal
                lettering. Platform support for Unicode script varies; image
                uploads work wherever pictures are allowed. This is not a
                signature authenticator or tattoo designer.
              </p>
            </article>
          </div>

          <article className="rounded-[1.15rem] border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6">
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Cursive accessibility and compatibility
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
              <li>
                Unicode mathematical script is strongest for basic Latin;
                unsupported characters are preserved unchanged.
              </li>
              <li>
                Handwriting fonts are Latin-focused subsets for performance.
              </li>
              <li>
                Fancy Unicode can be hard for screen readers — WordMelo keeps
                plain labels on every control.
              </li>
              <li>
                Preview and PNG aim to match closely; browser hinting can still
                differ slightly.
              </li>
            </ul>
            <p className="mt-4 text-sm text-ink-muted">
              For broader Unicode styling, try the{" "}
              <Link href="/fancy-text-generator">Fancy Text Generator</Link>.
              Normalize casing with the{" "}
              <Link href="/case-converter">Case Converter</Link>, check length
              with the <Link href="/word-counter">Word Counter</Link>, or brainstorm
              with the{" "}
              <Link href="/random-word-generator">Random Word Generator</Link>.
            </p>
          </article>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools currentToolId="cursive-generator" />
      </ToolShell>
    </>
  );
}
