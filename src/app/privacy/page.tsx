import { createPageMetadata } from "@/lib/seo";
import { getContactEmail, getMailtoHref, siteConfig } from "@/lib/site";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How WordMelo handles privacy: browser-local text tools, optional local preferences, and honest limits on data collection.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const email = getContactEmail();
  const mailto = getMailtoHref("WordMelo privacy inquiry");

  return (
    <div className="pb-16 pt-10">
      <div className="container-page max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-ink">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Last updated: November 5, 2026 (Vercel Web Analytics)
        </p>
        <div className="prose-wordmelo mt-6">
          <p>
            This policy describes how WordMelo (“we”, “our”) handles information
            for the website at {siteConfig.url}. It is written to match the
            current public product (ten browser-local writing tools).
          </p>

          <h2>Browser-local tool processing</h2>
          <p>
            WordMelo’s tools run in your browser. Text you type or paste into a
            tool is processed on your device to generate counts, conversions,
            styles, random samples, or placeholder content. That tool content is
            not transmitted to WordMelo servers for processing, logging,
            analytics, or third-party analysis.
          </p>
          <p>
            WordMelo does not permanently store editor or generated contents on
            our servers unless you explicitly download or otherwise save the text
            yourself (for example, using a Download button or your browser’s own
            features). Clipboard copy uses the browser Clipboard API when
            available and stays on your device.
          </p>

          <h2>Local browser storage</h2>
          <p>
            Some tools may store non-sensitive preferences on your device using
            browser <code>localStorage</code>, for example:
          </p>
          <ul>
            <li>Favorite fancy-text or cursive styles</li>
            <li>Favorite random words or short generation history</li>
            <li>Custom title-case spelling exceptions</li>
          </ul>
          <p>
            This data stays in your browser. Clearing site data in your browser
            removes it. WordMelo does not sync these preferences to a server
            account (there is no product account system today).
          </p>

          <h2>Information we may receive automatically</h2>
          <p>
            Like most websites, hosting and network infrastructure may receive
            standard technical request data such as IP address, browser user
            agent, requested URL, and timestamps when pages are loaded. WordMelo
            does not include an authentication system or a product database for
            user accounts.
          </p>

          <h2>Vercel Web Analytics</h2>
          <p>
            WordMelo uses{" "}
            <a
              href="https://vercel.com/docs/analytics"
              rel="noopener noreferrer"
              target="_blank"
            >
              Vercel Web Analytics
            </a>{" "}
            to understand which pages are visited and how traffic arrives. This
            measures aggregated page views and referrers. It does{" "}
            <strong>not</strong> receive the text you type into WordMelo tools —
            tool content still stays in your browser for local processing.
          </p>

          <h2>Google Tag Manager</h2>
          <p>
            WordMelo also loads Google Tag Manager (container{" "}
            <code>GTM-MR6GRV4J</code>) so measurement and advertising tags
            configured in that container can run site-wide. Tags managed through
            GTM may collect standard usage and device/browser signals according
            to Google’s and each tag vendor’s policies. Tool editor contents are
            still processed locally in your browser and are not uploaded to
            WordMelo for analysis.
          </p>
          <p>
            If additional advertising or analytics products are added outside
            this setup, this policy will be updated again.
          </p>

          <h2>Cookies</h2>
          <p>
            WordMelo does not set product cookies for accounts or personalization.
            Your browser may still create temporary technical storage as part of
            normal browsing. Vercel’s analytics documentation describes how their
            product handles visitors; we do not use analytics to identify you by
            name or email.
          </p>

          <h2>Fonts and static assets</h2>
          <p>
            Site fonts may be loaded from Google Fonts (via Next.js font
            optimization) when you visit public pages. That is a separate network
            request from tool text processing and does not include the contents of
            your editor.
          </p>

          <h2>Contact</h2>
          <p>
            Privacy questions can be sent through the{" "}
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

          <h2>Changes</h2>
          <p>
            We may update this policy as WordMelo evolves. The “Last updated”
            date at the top will change when material revisions are published.
          </p>
        </div>
      </div>
    </div>
  );
}
