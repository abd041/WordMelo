import { JsonLd } from "@/components/seo/JsonLd";
import { PictionaryApp } from "@/components/tools/pictionary/PictionaryApp";
import { PictionaryGuide } from "@/components/tools/pictionary/PictionaryGuide";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolShell } from "@/components/tools/ToolShell";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import {
  PICTIONARY_DESCRIPTION,
  PICTIONARY_FAQS,
  PICTIONARY_H1,
  PICTIONARY_INTRO,
  PICTIONARY_KEYWORDS,
  PICTIONARY_PATH,
  PICTIONARY_TITLE,
} from "@/lib/tools/pictionary/page-copy";
import { PROMPT_STATS } from "@/lib/tools/pictionary/stats";

export const metadata = {
  ...createPageMetadata({
    title: PICTIONARY_TITLE,
    description: PICTIONARY_DESCRIPTION,
    path: PICTIONARY_PATH,
    keywords: [...PICTIONARY_KEYWORDS],
  }),
  twitter: {
    card: "summary" as const,
    title: PICTIONARY_TITLE,
    description: PICTIONARY_DESCRIPTION,
  },
};

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
        item: absoluteUrl(PICTIONARY_PATH),
      },
    ],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WordMelo Pictionary Word Generator",
    url: absoluteUrl(PICTIONARY_PATH),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate curated drawing prompts for objects, plants, places, and nature, then play a timed team game or print word cards in your browser.",
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
        <ToolHeader title={PICTIONARY_H1} description={PICTIONARY_INTRO} privacyNote="Free in your browser. No signup, and prompts stay on your device." />

        <ul className="mt-4 flex flex-wrap gap-2 text-sm text-ink-muted">
          <li className="rounded-control border border-line bg-surface px-3 py-1.5">{PROMPT_STATS.total} curated prompts</li>
          <li className="rounded-control border border-line bg-surface px-3 py-1.5">Free to play</li>
          <li className="rounded-control border border-line bg-surface px-3 py-1.5">No signup required</li>
          <li className="rounded-control border border-line bg-surface px-3 py-1.5">Easy, Medium &amp; Hard</li>
          <li className="rounded-control border border-line bg-surface px-3 py-1.5">Team game included</li>
        </ul>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ink-soft">
          Independent free tool — not affiliated with any commercial Pictionary trademark holder.
        </p>

        <div className="mt-6 sm:mt-8">
          <PictionaryApp />
        </div>

        <PictionaryGuide />

        <ToolFAQ title="Frequently asked questions" items={[...PICTIONARY_FAQS]} />

        <RelatedTools
          currentToolId="pictionary-word-generator"
          preferredIds={["random-word-generator", "random-letter-generator"]}
          limit={2}
        />
      </ToolShell>
    </>
  );
}
