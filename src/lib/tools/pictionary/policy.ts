/**
 * Halal-conscious / family drawing-prompt content policy helpers.
 * These patterns reject prohibited subjects from the curated dataset.
 * Not a religious certification.
 */

const PROHIBITED_PATTERNS: RegExp[] = [
  /\b(person|people|human|man|woman|boy|girl|child|baby|face|portrait|selfie of|family)\b/i,
  /\b(animal|dog|cat|bird|fish|horse|cow|pig|sheep|goat|lion|tiger|bear|wolf|fox|rabbit|rat|snake|spider|insect|bee|butterfly|dinosaur|unicorn|mermaid|monster)\b/i,
  /(?<!computer )\bmouse\b/i,
  /\bdragon\b(?!\s+fruit)/i,
  /(?<!glue |caulking |caulk |staple |nail |heat )\bgun\b/i,
  /\b(alcohol|beer|wine|whiskey|vodka|cocktail|bar drink|drunk|intoxicant)\b/i,
  /\b(casino|gambling|bet|poker|slot machine|roulette|wager)\b/i,
  /\b(rifle|pistol|sword|bomb|grenade|weapon|blood|kill|murder|war)\b/i,
  /\b(sex|nude|kiss|lingerie|porn)\b/i,
  /\b(guitar|piano|violin|drum|flute|trumpet|saxophone|karaoke|concert|song|music note|microphone singer)\b/i,
  /\b(zombie|vampire|ghost|devil|demon|witch|wizard character)\b/i,
  /\b(church|mosque|synagogue|temple|cathedral|minaret|altar|bible|quran|torah|crucifix)\b/i,
];

export function violatesContentPolicy(text: string): string | null {
  const normalized = text.trim();
  if (!normalized) return "empty";
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(normalized)) {
      return pattern.source;
    }
  }
  return null;
}

export function assertDatasetPolicy(
  prompts: ReadonlyArray<{ text: string; id: string }>,
): { ok: true } | { ok: false; violations: Array<{ id: string; text: string; reason: string }> } {
  const violations: Array<{ id: string; text: string; reason: string }> = [];
  for (const prompt of prompts) {
    const reason = violatesContentPolicy(prompt.text);
    if (reason) violations.push({ id: prompt.id, text: prompt.text, reason });
  }
  return violations.length === 0 ? { ok: true } : { ok: false, violations };
}
