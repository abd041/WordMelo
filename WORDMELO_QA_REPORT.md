# WordMelo QA report

Date: November 5, 2026. Environment: Windows, Node (local), Next.js 15.5.29 dev server at `http://localhost:3000`, Cursor browser.

## Commands

| Command | Result |
|---|---|
| `npm run lint` | Pass. No ESLint warnings or errors. `next lint` deprecation notice only. |
| `npm run typecheck` | Pass (`tsc --noEmit`). |
| `npm run test` | **297 passed**, 23 files. Includes 3 new registry tests. |
| `npm run build` | Pass. Exit 0. Compiled in 22.0s, lint and types checked, 23/23 static pages. Homepage first-load JS about 115 kB. First build attempt failed with `EPERM` on `.next/trace` while `next dev` held the folder; dev was stopped and the build was rerun. |

## Browser checks (this pass)

Desktop homepage at `http://localhost:3000/`:

- Title: `Free Online Text & Writing Tools | WordMelo`. One H1.
- Search `lorem` hid the popular row and left only Lorem Ipsum Generator.
- Counting & analysis combined with `lorem` showed: “No tools match that search and category.”
- Reset restored popular tools, all ten tools, and the All category.
- Typing `one two three` in the homepage counter updated to **3 words**, **13 characters**, **1 sec** reading time (deferred update).
- 390px viewport: `scrollWidth` 390, `clientWidth` 390, no horizontal overflow.
- Mobile menu opened (label became Close menu), showed Tools, About, Contact, and search. Escape closed it.

Not re-clicked in this pass: every tool’s copy/download/timer flow. Those remain covered by existing unit tests and the earlier pre-deployment route audit, not by a fresh end-to-end pass today.

## Accessibility

Automated Lighthouse accessibility **100** on homepage, Word Counter, and Lorem Ipsum is a **prior lab result**, not re-run after this homepage change. This pass confirmed labels, `aria-pressed` on category buttons, Escape on the mobile menu, and a named directory search. Full manual screen-reader and 200% zoom passes were **not** repeated.

## Performance

Not re-measured after this change. Prior local lab (not field data):

- Homepage: performance 92, LCP 2.8s, CLS 0, TBT 170ms.
- Word Counter: 96, LCP 2.5s.
- Lorem Ipsum: 97, LCP 2.5s, TBT 40ms.

INP field data: **not tested**.

## Known limitations

- Homepage Lighthouse was not re-run, so the effect of the extra tool cards on LCP is unknown.
- Category chips can sit under the sticky header if the page is scrolled; a click then needs the control in view. That is existing sticky-header behavior, not a broken filter.
- GTM is the requested script pair, without the official noscript iframe.
- PostCSS/Next audit warnings remain. Next 16 was not forced.
- External rankings, AdSense approval, and real-user Core Web Vitals cannot be claimed from this repo.
