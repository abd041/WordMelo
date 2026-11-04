# Title Case Converter — Rules and Sources

Verified: **2026-11-05** (premium upgrade re-audit)  
Contact: abdullahrauf440@gmail.com  
Locale: US English titles and headlines

This document summarizes WordMelo’s implemented capitalization policies in original language. It does **not** reproduce copyrighted style-manual chapters.

Automatic capitalization cannot resolve every grammatical ambiguity or proper-name convention. Words such as *as*, *for*, *to*, *up*, and *out* may be particles, prepositions, or other parts of speech depending on context; WordMelo applies the documented default for each style without a full language parser. Review important titles before publication.

---

## Styles implemented

| Style ID | Label | Edition / scope |
| --- | --- | --- |
| `general` | General Title Case | WordMelo editorial convenience |
| `apa7` | APA Title Case | APA Style 7th edition |
| `mla9` | MLA Title Case | MLA Handbook 9th edition |
| `chicago18` | Chicago Title Case | Chicago Manual of Style 18th edition |
| `ap-composition` | AP Composition Titles | AP Stylebook composition-title guidance |
| `sentence` | Sentence Case | Comparison mode |

AP **news headlines** commonly use sentence case in many newsrooms. WordMelo’s AP mode is scoped to **composition titles** (books, films, songs, works of art, etc.), not AP headline sentence case.

---

## APA 7 — Title case

**Sources**

- https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case  
- Publication Manual §6.17 (referenced by APA Style site; last updated July 2022 on the public page)

**Implemented**

- Capitalize the first word of a title/heading and of a subtitle.
- Capitalize the first word after a colon, em dash, or end punctuation that starts a new heading segment.
- Capitalize major words: nouns, verbs, adjectives, adverbs, pronouns, and **all words of four or more letters**.
- Lowercase only minor words of three letters or fewer: short conjunctions, short prepositions, and articles — except when they are first in a title/subtitle/segment.
- Capitalize the second part of hyphenated major words (e.g., Self-Report).

**Not implemented as APA sentence case**

APA reference-list titles of articles/books often use **sentence case**. This tool’s APA mode is **title case** for titles and headings, not APA sentence-case reference titles.

**Limitations**

- No full POS tagger; “major” vs “minor” for short words uses APA’s published minor-word lists plus length ≥ 4.
- Proper nouns not in user exceptions rely on input cues / editorial review.

---

## MLA 9 — Title-style capitalization

**Sources**

- MLA Handbook, 9th ed., guidance summarized via university library guides citing pp. 54+ (Douglas College; Pitt CC; Holy Family).
- Official handbook: https://style.mla.org/

**Implemented**

- Capitalize first and last words of a title or subtitle.
- Capitalize principal words: nouns, pronouns, verbs, adjectives, adverbs, and subordinating conjunctions.
- Do **not** capitalize articles, prepositions (any length), coordinating conjunctions, or “to” in infinitives — unless first/last of title/subtitle.
- Capitalize both parts of hyphenated compounds in English titles.

**Ambiguity**

Some words (after, before, since, as) can be prepositions or subordinating conjunctions. Without semantic parsing, WordMelo lowercases them when they appear in the shared preposition list and capitalizes clear subordinators (although, because, if, than, that, though, unless, whether, while, once). Editors should review edge cases.

---

## Chicago 18 — Title case

**Sources**

- CMOS 18 preface / public change notes: capitalizing prepositions of **more than four letters** (five or more) in titles.
- https://www.chicagomanualofstyle.org/book/ed18/frontmatter/pref.html  
- CMOS Q&A confirming 18th-edition preposition policy (8.160 / 8.161 family).
- Hyphenated compounds with prefixes: subsequent elements capitalized (e.g., Anti-Intellectual) — secondary summaries of §8.162.

**Implemented**

- First and last words of a title/subtitle capitalized.
- Articles and coordinating conjunctions lowercased unless first/last.
- Prepositions of **four letters or fewer** lowercased; prepositions of **five or more letters** capitalized (About, Through, Between, Without, …; with/from/into/onto/over stay lowercase when used as prepositions).
- First word after a colon in titles capitalized.
- Hyphenated segments: capitalize subsequent meaningful parts (including after common prefixes).

**Explicitly not Chicago 17**

Chicago 17 generally lowercased prepositions regardless of length. Tests lock Chicago 18 behavior (e.g., About capitalized, with lowercase).

---

## AP — Composition titles (scoped)

**Sources**

- Widely circulated AP Stylebook composition-title rules via university brand guides (e.g., NC State Brand; Missouri State brand updates summarizing AP).
- https://brand.ncsu.edu/editorial-style/composition-titles/

**Implemented (composition titles only)**

- Capitalize all words except articles; prepositions of three or fewer letters; conjunctions of three or fewer letters — unless first or last.
- Capitalize prepositions and conjunctions of four or more letters.
- Capitalize “to” in infinitives.

**Limitations / disclosure**

- Full AP Stylebook is subscription content; implementation follows publicly documented composition-title summaries.
- **Not** AP news-headline sentence case.
- Phrasal-verb edge cases and rare part-of-speech flips may need human review.

---

## General Title Case (WordMelo)

Convenience mode for everyday headlines:

- Capitalize first and last words.
- Lowercase a fixed small-word list unless first/last.
- Capitalize after colons.
- Capitalize each hyphen segment.
- Not a substitute for APA/MLA/Chicago/AP.

---

## Sentence case

- Lowercase letters in the line, then capitalize the first letter of the string and the first letter after `.` `!` `?` (and common Unicode end punctuation).
- Useful comparison only.

---

## Shared policies

### Subtitles

Colon (`:`), em dash (`—`), and en dash used as a break (`–` when spaced as a title break) start a new segment whose first word is capitalized for APA/MLA/Chicago/AP/General.

### Acronyms

Optional preservation of known initialisms (HTML, CSS, API, NASA, …) and already-all-caps tokens of length ≥ 2. Not every uppercase run is treated as an acronym when preservation is off.

### Brand / custom exceptions

User-defined match → preferred spelling, whole-token, case-insensitive match. Optional `localStorage` persistence for the dictionary only — never for title text.

### Unicode

Latin casing uses `en-US`. Non-Latin scripts are preserved. Emoji and symbols pass through. No claim of multilingual style-guide compliance.

---

## Test coverage (high level)

Automated Vitest suites in `convert.test.ts` cover:

- APA 7 major-word / ≥4-letter / colon / hyphen policies
- MLA 9 first/last, prepositions, infinitive *to*, hyphen compounds
- Chicago 18 five-or-more-letter prepositions (including *A Room with a View About Design*) and explicit non–Chicago-17 checks
- AP composition-title scope (not news headline sentence case)
- General + sentence modes
- Cross-style differentiation for *with* / *about*
- Acronyms, brand exceptions, whole-token matching
- Batch line order and blank-line preservation
- Highlight segments (changed tokens only; punctuation unmarked; repeated words)

Unsupported / editorial-review cases remain: full POS disambiguation, proprietary Stylebook edge cases, and non-English title conventions.
