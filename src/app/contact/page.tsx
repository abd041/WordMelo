import { createPageMetadata } from "@/lib/seo";
import { getContactEmail, getMailtoHref, siteConfig } from "@/lib/site";
import Link from "next/link";

const contactEmail = getContactEmail();

export const metadata = createPageMetadata({
  title: "Contact",
  description: contactEmail
    ? `Contact WordMelo at ${contactEmail} about the product, privacy questions, or feedback on writing tools.`
    : "Contact WordMelo about the product, privacy questions, or feedback on writing tools.",
  path: "/contact",
});

export default function ContactPage() {
  const email = getContactEmail();
  const mailto = getMailtoHref();

  return (
    <div className="pb-16 pt-10">
      <div className="container-page max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-ink">
          Contact
        </h1>
        <div className="prose-wordmelo mt-6">
          <p>
            We welcome thoughtful feedback about WordMelo tools, accessibility,
            and documentation.
          </p>

          {email && mailto ? (
            <>
              <h2>Email</h2>
              <p>
                Reach us at{" "}
                <a href={mailto} className="break-all">
                  {email}
                </a>
                . Please include enough detail for us to understand the issue or
                suggestion.
              </p>
            </>
          ) : (
            <div className="not-prose mt-8 rounded-card border border-line bg-surface p-6 shadow-soft">
              <h2 className="font-sans text-lg font-semibold text-ink">
                Contact email not configured yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                A working contact address has not been set in site configuration
                (`siteConfig.contactEmail`).
              </p>
            </div>
          )}

          <h2>Before you write</h2>
          <ul>
            <li>
              For privacy practices, see the{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </li>
            <li>
              For usage terms, see the <Link href="/terms">Terms of Use</Link>.
            </li>
            <li>
              For the live tool, open the{" "}
              <Link href="/word-counter">Word Counter</Link>.
            </li>
          </ul>
          <p className="text-sm">
            Site: {siteConfig.url}
          </p>
        </div>
      </div>
    </div>
  );
}
