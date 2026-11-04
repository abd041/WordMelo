import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { FancyTextGeneratorApp } from "@/components/tools/fancy-text/FancyTextGeneratorApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  getFancyStyleById,
  getFancyStyleCount,
} from "@/lib/tools/fancy-text";

export const metadata = createPageMetadata({
  title: "Fancy Text Generator — Copy & Paste Fonts | WordMelo",
  description:
    "Generate fancy text and stylish Unicode fonts for Instagram, TikTok, Discord and more. Explore free copy-and-paste styles instantly with WordMelo.",
  path: "/fancy-text-generator",
  keywords: [
    "fancy text generator",
    "fancy font generator",
    "fancy text copy and paste",
    "stylish text generator",
    "fancy fonts copy and paste",
    "cool text generator",
    "unicode text generator",
    "aesthetic text generator",
    "fancy letters generator",
    "instagram fonts",
    "tiktok fonts",
    "discord fonts",
    "fancy names",
  ],
});

const EXAMPLE_PLAIN = "Hello World";

function example(styleId: string): string {
  return getFancyStyleById(styleId)?.transform(EXAMPLE_PLAIN) ?? EXAMPLE_PLAIN;
}

const faqItems = [
  {
    question: "Is this a real font installer?",
    answer:
      "No. WordMelo creates Unicode character sequences that look stylish in many apps. It does not install font files. What you copy is text made of special symbols, not a TrueType or OpenType font.",
  },
  {
    question: "Will fancy text work on Instagram, TikTok, and Discord?",
    answer:
      "Many mathematical letter styles, fullwidth text, and decorative frames paste into Instagram bios, TikTok names, and Discord nicknames. Support depends on each app’s font coverage — always preview after pasting.",
  },
  {
    question: "Why do some letters stay plain?",
    answer:
      "Most letter styles map basic Latin letters and digits only. Punctuation, emoji, and non-Latin scripts stay unchanged so text is not deleted. Combining styles attach marks to remappable characters.",
  },
  {
    question: "Can I convert fancy text back to normal letters?",
    answer:
      "Yes, with limits. Open Fancy text → plain text on this page to reverse supported mathematical, fullwidth, circled, and similar mappings. Upside-down order, unknown symbols, and many decorations are not fully reversible.",
  },
  {
    question: "Is my text uploaded to WordMelo?",
    answer:
      "No. Generation runs in your browser. Favorites and recently copied style IDs stay in local storage on this device — your typed text is not sent for styling.",
  },
  {
    question: "Are fancy Unicode styles accessible?",
    answer:
      "Decorative Unicode can be hard for screen readers to announce clearly. Prefer plain text for important information. Treat fancy letters as accents for names and short social labels.",
  },
];

export default function FancyTextGeneratorPage() {
  const styleCount = getFancyStyleCount();
  const boldExample = example("bold-sans");
  const scriptExample = example("script");
  const gothicExample = example("fraktur");
  const circledExample = example("circled");

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
        name: "Fancy Text Generator",
        item: absoluteUrl("/fancy-text-generator"),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Fancy Text Generator",
    url: absoluteUrl("/fancy-text-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate fancy Unicode text styles for copy and paste into social apps. Runs locally in the browser.",
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, appJsonLd]} />
      <ToolShell
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Fancy Text Generator" },
        ]}
        className="pt-6 sm:pt-8"
      >
        <ToolHeader
          title="Fancy Text Generator — Copy & Paste Stylish Fonts"
          description="Create stylish Unicode fonts for bios, fancy names, and captions. Copy and paste into Instagram, TikTok, Discord, and other apps that accept special characters."
          privacyNote="Runs locally in your browser — text is not uploaded."
        />

        <FancyTextGeneratorApp />

        <div className="ad-region" aria-hidden="true" />

        <section
          aria-labelledby="fancy-text-guide"
          className="overflow-hidden rounded-[1.15rem] border border-line bg-surface"
        >
          <div className="border-b border-line bg-mint/40 px-5 py-4 sm:px-8 sm:py-5">
            <h2
              id="fancy-text-guide"
              className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]"
            >
              Fancy text guide
            </h2>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              Short answers for how this unicode text generator works — and when
              not to use it.
            </p>
          </div>

          <div className="prose-wordmelo max-w-none space-y-0 px-5 py-6 sm:px-8 sm:py-8">
            <h2 className="!mt-0">What is a Fancy Text Generator?</h2>
            <p>
              A fancy text generator (or fancy font generator) turns plain letters
              into Unicode symbols that look bold, script, gothic, circled, or
              otherwise decorative. You copy the result and paste it where the
              app accepts Unicode — bios, usernames, and short captions.
            </p>

            <h2>How to generate fancy text</h2>
            <ol>
              <li>Type a name, bio line, or caption in Style studio.</li>
              <li>Browse featured styles or filter by category / search.</li>
              <li>Press Copy on a card, then paste into your app.</li>
              <li>Optional: heart favorites or open decorative symbols.</li>
            </ol>

            <h2>Popular Unicode text styles</h2>
            <p>
              WordMelo ships {styleCount} distinct transformations. Examples for
              “{EXAMPLE_PLAIN}” using this page’s real mappings:
            </p>
            <div className="not-prose my-5 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-mint/50 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Style</th>
                    <th className="px-3 py-2.5 font-semibold">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-muted">
                  <tr>
                    <td className="px-3 py-2.5 text-ink">Plain</td>
                    <td className="px-3 py-2.5 font-serif text-base text-ink">
                      {EXAMPLE_PLAIN}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-ink">Bold sans</td>
                    <td className="px-3 py-2.5 font-serif text-base text-ink">
                      {boldExample}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-ink">Script</td>
                    <td className="px-3 py-2.5 font-serif text-base text-ink">
                      {scriptExample}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-ink">Gothic</td>
                    <td className="px-3 py-2.5 font-serif text-base text-ink">
                      {gothicExample}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 text-ink">Circled</td>
                    <td className="px-3 py-2.5 font-serif text-base text-ink">
                      {circledExample}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Fancy text versus actual fonts</h2>
            <p>
              Installed fonts redraw the same A–Z code points. Fancy Unicode
              substitutes different characters that merely look similar. That
              makes a stylish text generator ideal for short social labels and a
              poor fit for long articles, searchable documents, or SEO body copy.
            </p>

            <h2>Fancy text for Instagram, TikTok and Discord</h2>
            <p>
              Instagram fonts and TikTok fonts usually mean short bio or display
              name lines. Discord fonts often mean nicknames or status text.
              Keep a plain backup — some communities and bots restrict unusual
              characters, and glyph support varies by device.
            </p>

            <h2>How to choose readable fancy text</h2>
            <ul>
              <li>Prefer bold or sans styles for names people must recognize.</li>
              <li>Reserve script and gothic looks for short flourishes.</li>
              <li>Avoid styling an entire caption in mathematical letters.</li>
              <li>
                Normalize casing first with the{" "}
                <Link href="/case-converter">Case Converter</Link>, then pair
                with the <Link href="/word-counter">Word Counter</Link> if
                character limits matter.
              </li>
              <li>
                For focused cursive handwriting fonts and PNG export, use the{" "}
                <Link href="/cursive-generator">Cursive Generator</Link> instead
                of browsing every Fancy Text style.
              </li>
              <li>
                Need prompt words first? Try the{" "}
                <Link href="/random-word-generator">Random Word Generator</Link>.
              </li>
            </ul>

            <h2>Unicode compatibility</h2>
            <p>
              Missing glyphs can show as boxes. Unsupported scripts stay plain by
              design. WordMelo does not claim universal platform or language
              coverage — preview on the device where you will publish.
            </p>
          </div>
        </section>

        <ToolFAQ title="Frequently asked questions" items={faqItems} />

        <RelatedTools currentToolId="fancy-text-generator" />
      </ToolShell>
    </>
  );
}
