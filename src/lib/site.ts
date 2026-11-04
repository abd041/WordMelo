/**
 * Site-wide configuration for WordMelo.
 */
export const siteConfig = {
  name: "WordMelo",
  tagline: "Clear writing tools for everyday work",
  description:
    "WordMelo is a fast, privacy-first collection of online writing utilities. Count words, analyze text, and prepare content with tools that run in your browser.",
  url: "https://wordmelo.com",
  locale: "en_US",
  language: "en",
  /** Official contact address — single source of truth for mailto links and public contact copy. */
  contactEmail: "abdullahrauf440@gmail.com",
  /**
   * Optional social / brand URLs. Only add values that are real and active.
   */
  sameAs: [] as string[],
  readingWordsPerMinute: 238,
  speakingWordsPerMinute: 150,
  /**
   * Approximate manuscript page estimate: 250 words per double-spaced page
   * (common US academic rough estimate). Documented on the Word Counter page.
   */
  wordsPerPageEstimate: 250,
} as const;

export type SiteConfig = typeof siteConfig;

/** Trimmed contact email from site configuration. */
export function getContactEmail(): string {
  return siteConfig.contactEmail.trim();
}

/** mailto: href derived from site configuration. Returns empty string if unset. */
export function getMailtoHref(subject?: string): string {
  const email = getContactEmail();
  if (!email) return "";
  if (!subject) return `mailto:${email}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
