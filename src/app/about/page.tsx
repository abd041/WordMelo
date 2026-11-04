import { createPageMetadata } from "@/lib/seo";
import { getContactEmail, getMailtoHref, siteConfig } from "@/lib/site";
import { getPublishedTools } from "@/lib/tools/registry";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "About WordMelo",
  description:
    "Learn what WordMelo is: privacy-first, browser-local writing utilities for counting, converting, styling, and generating text.",
  path: "/about",
});

export default function AboutPage() {
  const published = getPublishedTools();
  const email = getContactEmail();
  const mailto = getMailtoHref();

  return (
    <div className="pb-16 pt-10">
      <div className="container-page max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-ink">
          About WordMelo
        </h1>
        <div className="prose-wordmelo mt-6">
          <p>
            WordMelo is an online collection of writing utilities designed to
            feel calm, precise, and trustworthy. The project focuses on tools
            people actually need for everyday drafting — starting with word and
            character measurement.
          </p>
          <h2>What we believe</h2>
          <ul>
            <li>
              Useful tools should work without forcing an account or upload.
            </li>
            <li>
              Counting rules should be documented, including their limits.
            </li>
            <li>
              Planned features should never be presented as finished products.
            </li>
            <li>
              Accessibility and performance are part of quality, not extras.
            </li>
          </ul>
          <h2>What is available today</h2>
          <p>
            WordMelo currently publishes {published.length} tools:{" "}
            {published.map((tool, index) => (
              <span key={tool.id}>
                {index > 0 ? ", " : null}
                <Link href={tool.href}>{tool.name}</Link>
              </span>
            ))}
            . New tools are added only when they meet the same quality bar.
          </p>
          <h2>Who it is for</h2>
          <p>
            Students, teachers, freelancers, marketers, and anyone writing for a
            United States English audience who needs quick, private text
            measurements.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about the product can be sent through the{" "}
            <Link href="/contact">Contact</Link> page
            {email && mailto ? (
              <>
                {" "}
                or by emailing{" "}
                <a href={mailto} className="break-all">
                  {email}
                </a>
              </>
            ) : null}
            .
          </p>
          <p className="text-sm">
            Site: {siteConfig.url}
          </p>
        </div>
      </div>
    </div>
  );
}
