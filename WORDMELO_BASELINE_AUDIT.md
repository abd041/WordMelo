# WordMelo baseline audit

Date: November 5, 2026. Source of truth is the repository at `D:\Abdullah\SAAS\WordMelo`, not a live ranking report.

This baseline describes the site **before** the homepage discovery changes in this pass. Prior production checks (lint, typecheck, 294 Vitest tests, production build, and local Lighthouse) are from the pre-deployment audit already recorded in `PRE_DEPLOYMENT_AUDIT.md`.

## Architecture

- Next.js **15.5.29** App Router, React **19**, TypeScript strict, Tailwind CSS 3.4, Vitest 3.0.5.
- Frontend-only tools. User text is processed in the browser.
- Domain constant: `https://wordmelo.com` in `src/lib/site.ts`.
- Tool catalog: `src/lib/tools/registry.ts`. Pages are real App Router routes, not a generated `/tools/[slug]` catch-all.
- Homepage word counter uses `computeTextStats` from `src/lib/tools/word-counter/count.ts` (same module as the dedicated tool).
- Analytics already present: Vercel Web Analytics (`@vercel/analytics`) and Google Tag Manager `GTM-MR6GRV4J` via `next/script` `afterInteractive` in `src/app/layout.tsx`. Privacy policy discloses both.
- No AdSense script. An empty `ad-region` exists on the homepage and is not a fake ad.
- No backend, database, or authentication.

## Published routes

| Route | Purpose |
|---|---|
| `/` | Homepage, directory, mini Word Counter |
| `/word-counter` | Word, character, sentence, paragraph, reading/speaking time, frequency |
| `/character-counter` | UTF-16, code points, graphemes, UTF-8 bytes, limit checker |
| `/case-converter` | Case and identifier conversions |
| `/title-case-converter` | APA, MLA, Chicago, AP composition titles |
| `/fancy-text-generator` | Unicode style variants |
| `/cursive-generator` | Unicode cursive and handwriting PNG |
| `/random-word-generator` | Filtered English word lists |
| `/pictionary-word-generator` | Drawing prompts and local timed game |
| `/random-letter-generator` | Letters, vowels, consonants, wheel |
| `/lorem-ipsum-generator` | Placeholder text studio |
| `/about` | About, lists published tools |
| `/contact` | Contact, `abdullahrauf440@gmail.com` |
| `/privacy` | Privacy policy |
| `/terms` | Terms of use |

Sitemap and robots include these public URLs. Homepage canonical has no trailing slash. There is no separate `/tools` index page; the directory is `/#tools`.

## Baseline issues (priority)

| Priority | Issue |
|---|---|
| P1 | Directory search existed, but there was no category filter and no distinct “popular / core tools” group. Search placeholder did not match the requested “Search free text tools...”. |
| P1 | When search returned only Word Counter, the directory replaced the grid with a single spotlight. That made one-result search look different from every other result. |
| P2 | Copy said more utilities were “on the way” even when the planned-tool list was empty. |
| P2 | Prior local Lighthouse on the homepage was **92** performance, LCP **2.8s**, CLS **0**, TBT **170ms**. Word Counter **96**, Lorem Ipsum **97**. Accessibility, Best Practices, and SEO were **100** on those lab runs. These are lab results, not field Core Web Vitals. |
| Warning | `npm audit` reports Next-nested PostCSS advisories. Forcing a fix would jump to Next.js 16. Not applied. |
| Not a defect | GTM snippet is the two `next/script` blocks requested earlier, not the official noscript iframe. |

## What was already solid

- Ten published tools, unique hrefs, categories on every tool.
- Shared counting logic, Unicode tests, title-case and generator tests.
- One H1 pattern, canonicals on `https://wordmelo.com`, sitemap without fake priorities, robots allow `/`.
- Mobile header already closes on Escape and locks body scroll while open.
- No fabricated ratings, user counts, or AdSense tags.

## Baseline test result

Before the three new registry tests: **294 passed** (22 files), lint clean, typecheck clean, production build succeeded. See `PRE_DEPLOYMENT_AUDIT.md`.
