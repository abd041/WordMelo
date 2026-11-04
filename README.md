# WordMelo

Premium, privacy-first online writing utilities. Phase 1 ships a production-ready foundation and a complete **Word Counter**.

## Stack

- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- Vitest
- Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run build` | Production build |
| `npm run verify` | Lint + typecheck + test + build |

## Configuration

Edit `src/lib/site.ts` for site-wide settings:

- `contactEmail` — official contact address used for mailto links and public contact copy
- reading / speaking WPM and page-estimate assumptions

Production canonical origin: `https://wordmelo.com`

## Phase 1 scope

- Homepage, About, Contact, Privacy, Terms, 404
- Published tool: `/word-counter`
- Planned tools are catalogued but not routed or indexed

## Privacy

Word Counter text is processed locally in the browser and is not uploaded for counting.
