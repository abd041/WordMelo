# Random Word Generator — vocabulary sources

## Included datasets

### Princeton WordNet 3.0 (via `wordnet-db` npm package)

- **Use:** Lemma lists from `index.noun`, `index.verb`, and `index.adj` for part-of-speech tagging.
- **License:** WordNet 3.0 license (permission to use, copy, modify, and distribute with the Princeton copyright notice). Full text: `public/data/random-words/LICENSE-WORDNET.txt`.
- **Modifications:** Kept single-token alphabetic lemmas (a–z only), length 3–14. Multi-word lemmas (underscores), hyphenated forms, and dotted forms were excluded. A small manual blocklist of clearly offensive terms was removed for a family-friendlier default corpus.

### Google 10,000 English (USA, no swears)

- **Source:** [first20hours/google-10000-english](https://github.com/first20hours/google-10000-english) — `google-10000-english-usa-no-swears.txt`
- **Use:** Approximate word-frequency ranks for *common* vocabulary and difficulty heuristics.
- **License:** MIT (repository license).
- **Modifications:** Used only as a ranked lookup table; words not present receive rank `0` (extended vocabulary).

### Corpora (Darius Kazemi)

- **Source:** [dariusk/corpora](https://github.com/dariusk/corpora) — `nouns.json`, `verbs.json`, `adjs.json`
- **Use:** Supplementary POS coverage for common creative-writing words.
- **License:** CC0 1.0 (public domain dedication).
- **Modifications:** Lowercased; present-tense verb forms only; alphabetic a–z filter applied.

## Generated asset

- `public/data/random-words/vocabulary.json` — compact WordMelo packaging of the merged, filtered list.
- Rebuild with: `node scripts/build-vocabulary.mjs`

## Counts (after filtering)

See `public/data/random-words/stats.json` for the latest totals (nouns / verbs / adjectives / common / extended / difficulty bands). Counts change when the build script is re-run.

## Difficulty heuristic (approximation)

Difficulty is **not** a psycholinguistic standard. It is a documented approximation:

| Band | Rule |
| --- | --- |
| Easy | In Google top ~2,500 **and** length ≤ 6 |
| Medium | In Google top ~7,000 and length ≤ 9, **or** top ~2,500 regardless of length, **or** short extended words (length ≤ 5) |
| Hard | Everything else |

## Known limitations

- POS comes from WordNet senses; many English words have multiple roles and are multi-tagged.
- Frequency ranks approximate US web English circa the Google 10k list — not a live corpus.
- Extended vocabulary includes many rare or technical WordNet lemmas.
- Offensive-term filtering is best-effort, not exhaustive child-safety certification.
- Hyphenated and multi-word expressions are excluded by policy.
- Syllable-count filtering is not offered: the packaged dataset has no reliable syllable metadata, and an untested heuristic would be inaccurate.
- Dictionary entries such as “song” or “music” may remain as ordinary English vocabulary; the product UI does not promote songwriting or music use cases.
