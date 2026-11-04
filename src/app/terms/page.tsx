import { createPageMetadata } from "@/lib/seo";
import { getContactEmail, getMailtoHref, siteConfig } from "@/lib/site";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Terms of Use",
  description:
    "Terms of Use for WordMelo writing tools, including acceptable use and service limitations.",
  path: "/terms",
});

export default function TermsPage() {
  const email = getContactEmail();
  const mailto = getMailtoHref("WordMelo terms inquiry");

  return (
    <div className="pb-16 pt-10">
      <div className="container-page max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-ink">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Last updated: November 4, 2026
        </p>
        <div className="prose-wordmelo mt-6">
          <p>
            By using {siteConfig.name} at {siteConfig.url}, you agree to these
            Terms of Use. If you do not agree, please do not use the site.
          </p>

          <h2>The service</h2>
          <p>
            WordMelo provides browser-based writing utilities (including counters,
            converters, styled-text generators, and placeholder generators such as
            the <Link href="/word-counter">Word Counter</Link>). Tools are offered
            as-is for personal and professional drafting assistance. Results are
            estimates based on documented rules and may not match every
            institutional or linguistic standard.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Do not attempt to disrupt or misuse the website infrastructure.</li>
            <li>
              Do not use the site to violate applicable laws or third-party
              rights.
            </li>
            <li>
              Do not scrape the site in a way that degrades service for others.
            </li>
          </ul>

          <h2>No professional advice</h2>
          <p>
            Word counts, timing estimates, and related outputs are informational
            tools. They are not academic, legal, medical, or professional advice.
          </p>

          <h2>Availability</h2>
          <p>
            We aim for reliable uptime but do not guarantee uninterrupted access.
            Features may change as the product grows.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Site design, branding, and original content belong to WordMelo or
            its licensors. You retain rights to text you enter into tools.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            The site and tools are provided “as is” and “as available” without
            warranties of any kind, whether express or implied, to the fullest
            extent permitted by law.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, WordMelo is not liable for
            indirect, incidental, special, consequential, or punitive damages,
            or any loss of data or profits arising from your use of the site.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent via the{" "}
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
        </div>
      </div>
    </div>
  );
}
