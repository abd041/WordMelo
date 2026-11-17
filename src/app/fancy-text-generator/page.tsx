import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { FancyTextGeneratorApp } from "@/components/tools/fancy-text/FancyTextGeneratorApp";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { getFancyStyleById, getFancyStyleCount } from "@/lib/tools/fancy-text";
import {
  FANCY_DESCRIPTION,
  FANCY_FAQS,
  FANCY_H1,
  FANCY_INTRO,
  FANCY_PATH,
  FANCY_TITLE,
} from "@/lib/tools/fancy-text/page-copy";

export const metadata = createPageMetadata({
  title: FANCY_TITLE,
  description: FANCY_DESCRIPTION,
  path: FANCY_PATH,
  keywords: [
    "fancy text generator",
    "fancy font generator",
    "fancy fonts copy and paste",
    "copy and paste fonts",
    "cool text generator",
    "stylish text generator",
    "aesthetic fonts",
    "unicode text generator",
    "instagram fonts",
    "fancy text for instagram",
    "stylish name generator",
  ],
});

const EXAMPLE_PLAIN = "Hello";

function example(styleId: string): string {
  return getFancyStyleById(styleId)?.transform(EXAMPLE_PLAIN) ?? EXAMPLE_PLAIN;
}

export default function FancyTextGeneratorPage() {
  const styleCount = getFancyStyleCount();
  const rows = [
    ["Bold", example("bold-sans")],
    ["Italic", example("italic")],
    ["Script", example("script")],
    ["Gothic", example("fraktur")],
    ["Double-struck", example("double-struck")],
    ["Circled", example("circled")],
    ["Fullwidth", example("fullwidth")],
    ["Small caps", example("small-caps")],
  ];

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
        item: absoluteUrl(FANCY_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Fancy Text Generator",
    url: absoluteUrl(FANCY_PATH),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: FANCY_DESCRIPTION,
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
          title={FANCY_H1}
          description={FANCY_INTRO}
          privacyNote="Runs in your browser. Typed text is not uploaded."
        />

        <FancyTextGeneratorApp />

        <div className="ad-region" aria-hidden="true" />

        <section
          aria-labelledby="fancy-platforms"
          className="overflow-hidden rounded-[1.15rem] border border-line bg-surface"
        >
          <div className="prose-wordmelo max-w-none px-5 py-6 sm:px-8 sm:py-8">
            <h2 id="fancy-platforms" className="!mt-0">
              Fancy Text for Instagram, TikTok, and Discord
            </h2>
            <p>
              People usually want a short bio, display name, or nickname, not a
              restyled article. Mathematical bold and script styles are the most
              common choices for an Instagram bio or a TikTok name. Gothic and
              double-struck styles are a better fit for a Discord nickname or a
              gaming tag. Paste the result, then look at it on the device you
              will actually publish from.
            </p>
            <p>
              WordMelo is not affiliated with those apps. A style that looks
              right here can still be rejected by a username field, trimmed by a
              character limit, or drawn as an empty box. Keep a plain copy of
              the name.
            </p>

            <h2>Popular Unicode Text Styles</h2>
            <p>
              The tool above includes {styleCount} styles. Here is “{EXAMPLE_PLAIN}” in a few of them:
            </p>
            <div className="not-prose my-5 overflow-x-auto rounded-control border border-line">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead className="bg-mint/50 text-ink">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Style</th>
                    <th className="px-3 py-2.5 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  {rows.map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-3 py-2.5">{label}</td>
                      <td className="px-3 py-2.5 text-base">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>How to Use the Fancy Text Generator</h2>
            <ol>
              <li>Type a name, bio, or caption, or load the Demo, Name, Bio, or Caption example.</li>
              <li>Browse with search or a category. Favorites and recently copied styles stay on this device.</li>
              <li>Press Copy on the card you want. If the clipboard is blocked, the exact characters are selected for a manual copy.</li>
              <li>Paste into the app. Use the profile preview when you want a rough length check, and the name builder when you want a star or bracket around the first line.</li>
            </ol>
            <p>
              Need the letters in a normal case first? Use the{" "}
              <Link href="/case-converter">Case Converter</Link> or the{" "}
              <Link href="/title-case-converter">Title Case Converter</Link>,
              then come back. The{" "}
              <Link href="/character-counter">Character Counter</Link> is useful
              when a bio has a hard limit. For handwriting you can download as a
              picture, use the{" "}
              <Link href="/cursive-generator">Cursive Generator</Link>.
            </p>

            <h2>Fancy Text vs Regular Fonts</h2>
            <p>
              A font changes how the same letter is drawn. This generator
              changes which letter you are copying. A bold style does not apply
              CSS bold to “A”; it copies a different Unicode character that
              looks bold. That is why you do not install anything, and why a
              search engine, a spreadsheet, or a screen reader may treat the
              word as unfamiliar symbols rather than the original word.
            </p>
            <p>
              Use fancy text for short labels. Leave articles, addresses, and
              anything someone must search or hear in plain text.
            </p>

            <h2>Where Fancy Text May Not Work</h2>
            <ul>
              <li>Letters outside basic Latin, including Arabic and Urdu, stay as you typed them. The styles do not invent a styled form for every writing system.</li>
              <li>Emoji, spaces, and line breaks are kept. Punctuation is styled only when that style has a mapping.</li>
              <li>Combining styles such as underline attach a mark to Latin letters and digits. They can look uneven, and some apps strip the mark.</li>
              <li>Upside-down text and extra spacing are visual effects. The plain-text converter does not promise to undo them.</li>
              <li>Missing glyphs show up as boxes. Username fields, email, and many games reject the characters entirely.</li>
              <li>Screen readers may spell the characters one by one or skip them. Do not rely on fancy text for instructions.</li>
            </ul>
          </div>
        </section>

        <ToolFAQ title="Frequently Asked Questions" items={[...FANCY_FAQS]} />

        <RelatedTools
          currentToolId="fancy-text-generator"
          preferredIds={[
            "word-counter",
            "character-counter",
            "case-converter",
            "title-case-converter",
            "cursive-generator",
          ]}
          limit={5}
        />
      </ToolShell>
    </>
  );
}
