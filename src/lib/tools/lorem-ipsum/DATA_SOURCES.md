# Lorem Ipsum Generator — Data Sources

Verified: **2026-11-05**  
Contact: abdullahrauf440@gmail.com

This document describes WordMelo’s placeholder-text sources and generation rules. It does **not** claim that generated pseudo-Latin is authentic classical Latin grammar.

---

## Classic passage

**Text:** Traditional Lorem Ipsum opening beginning *“Lorem ipsum dolor sit amet…”*

**Provenance:** The familiar typesetting dummy paragraph is a mid-20th-century printer’s rearrangement of material ultimately derived from Cicero, *De Finibus Bonorum et Malorum* (45 BC). Cicero’s Latin is in the **public domain**. The conventional scrambled opening used by designers worldwide is treated here as traditional industry placeholder text, not as a modern proprietary corpus.

**WordMelo use:** Stored in `classic.ts` as `CLASSIC_LOREM_PASSAGE` for the “Start with classic Lorem Ipsum” option. Short requests may abbreviate the opening; the UI reports when abbreviation occurs.

**Not used:** Competitor websites’ unique corpora, HTML, CSS, or marketing copy.

---

## Vocabulary strategy

**File:** `vocabulary.ts` → `LOREM_VOCABULARY`

Independently curated list of Latin-root tokens commonly associated with traditional Lorem-style filler (e.g. *consectetur*, *adipiscing*, *vestibulum*). Assembled for WordMelo; **not** copied from any competitor’s downloadable dictionary or source dump.

**UI English kit:** `UI_LABELS` and `UI_FORM_PHRASES` are original plain-English strings for Button Labels and Form Descriptions presets. They are intentionally **not** Lorem Ipsum.

---

## Generation rules

- Modes: paragraphs, sentences, words, exact UTF-16 characters.
- Paragraph length bands (approximate word targets): short 25–45, medium 50–90, long 100–160, or variable.
- Classic opening prepends/uses the classic passage when enabled and quantity permits — only on the first paragraph / opening slice, never duplicated across every block.
- Sentence variation: mixed length bands, light connector/lead/trail structures, and bounded retries to avoid identical neighboring sentences/paragraphs (max ~3–12 RNG retries; no infinite loops).
- Output formats (plain / HTML / Markdown) serialize one stored document — switching format does not regenerate words.
- Randomness: `crypto.getRandomValues` with rejection sampling when available; tests inject a seeded RNG.

---

## Character metric

Exact-character mode counts **UTF-16 code units** (`String.length` in JavaScript). The placeholder vocabulary is ASCII Latin-root text, so UTF-16 units, Unicode code points, and grapheme clusters coincide for generated Lorem output.

**Prefer complete words** (optional): stop on a whole-word boundary and may undershoot the target. Undersized output is labeled approximate (`exactUtf16: false`) — never presented as exact length.

Exact natural-language sentence quality is **not** guaranteed under tight character budgets.

---

## Known limitations

- Pseudo-Latin is for visual layout only — not authentic Ciceronian grammar.
- Strict exact-character mode may truncate mid-word to meet the length contract.
- Prefer-complete-words may return fewer UTF-16 units than requested.
- Extremely large quantities are capped (see `QUANTITY_LIMITS` in `types.ts`).
- UI English presets are a separate text kind from Lorem Ipsum.
