# WordMelo improvements

Date: November 5, 2026.

The site was already a production Next.js app with ten tools, SEO metadata, tests, GTM, and Vercel Analytics. This pass did **not** rebuild tool pages, change public URLs, or add a backend. The justified gap was homepage discovery.

## Changes

### Homepage discovery

`src/components/home/FeaturedTools.tsx`

- **Popular tools**: six real registry tools (Word Counter, Character Counter, Case Converter, Title Case Converter, Random Word Generator, Fancy Text Generator). No usage counts.
- **All tools**: every published tool, still driven by `getPublishedTools()`.
- **Category filters** use the existing categories: Counting & analysis, Case & conversion, Styling & formatting, Generators. Buttons use `aria-pressed`.
- Search and category apply together. Empty state explains that nothing matched. **Reset** clears both.
- Escape clears the directory search.
- Placeholder is `Search free text tools...`. The field has a visually hidden label.
- The old “only Word Counter” spotlight and the empty “more tools on the way” line are gone. Planned tools still render only if `getPlannedTools()` is non-empty.

`src/components/home/Hero.tsx`

- Supporting copy now covers counting, conversion, titles, and word generation. The live Word Counter stays and still calls `computeTextStats`.

`src/components/layout/SiteSearch.tsx`

- Header and mobile-menu search placeholder aligned to `Search free text tools...`.

### Tests

`src/lib/tools/registry.test.ts`

- Ten distinct published routes.
- Every tool belongs to a known category.
- Empty search returns all tools; `lorem` matches the generator; nonsense returns none.

## Intentionally unchanged

- Public URLs, domain, sitemap, robots, canonicals, JSON-LD.
- GTM `GTM-MR6GRV4J` and `<Analytics />`.
- Tool algorithms, Pictionary dictionary, and legal contact email.
- No AdSense script and no fake ad boxes.
- No new paid dependencies.

## Why this shape

A full visual rebuild would risk regressions on tools that already share a design system, pass unit tests, and were previously Lighthouse-checked. Category filtering and a core-tools row improve discovery without duplicating counting logic or inventing pages.
