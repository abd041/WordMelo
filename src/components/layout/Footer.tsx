import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { getPublishedTools } from "@/lib/tools/registry";
import { getContactEmail, getMailtoHref, siteConfig } from "@/lib/site";

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const published = getPublishedTools();
  const email = getContactEmail();
  const mailto = getMailtoHref();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            Free online text and writing tools for everyday drafts. Start with a
            private Word Counter — no account required.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Tools
          </h2>
          <ul className="mt-3 space-y-2">
            {published.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={tool.href}
                  className="text-sm text-ink-muted hover:text-accent"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#tools" className="text-sm text-ink-muted hover:text-accent">
                All tools
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Site
          </h2>
          <ul className="mt-3 space-y-2">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Contact
          </h2>
          <ul className="mt-3 space-y-2">
            {email && mailto ? (
              <li>
                <a
                  href={mailto}
                  className="break-all text-sm text-ink-muted hover:text-accent"
                >
                  {email}
                </a>
              </li>
            ) : null}
            <li>
              <Link
                href="/contact"
                className="text-sm text-ink-muted hover:text-accent"
              >
                Contact page
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Built for writers in the United States and beyond.</p>
        </div>
      </div>
    </footer>
  );
}
