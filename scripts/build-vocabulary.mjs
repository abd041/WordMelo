import fs from "node:fs";
import path from "node:path";

const tmp = "d:/Abdullah/SAAS/WordMelo/tmp-vocab";
const outDir = "d:/Abdullah/SAAS/WordMelo/public/data/random-words";
fs.mkdirSync(outDir, { recursive: true });

const POS = { noun: 1, verb: 2, adjective: 4 };

function parseIndex(file, flag) {
  const map = new Map();
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith(" ")) continue;
    const lemma = line.split(" ")[0];
    if (!lemma || lemma.includes("_") || lemma.includes("-") || lemma.includes(".")) {
      continue;
    }
    if (!/^[a-z]+$/.test(lemma)) continue;
    if (lemma.length < 3 || lemma.length > 14) continue;
    map.set(lemma, (map.get(lemma) || 0) | flag);
  }
  return map;
}

const words = new Map();
for (const [file, flag] of [
  ["index.noun", POS.noun],
  ["index.verb", POS.verb],
  ["index.adj", POS.adjective],
]) {
  const m = parseIndex(path.join(tmp, "package/dict", file), flag);
  for (const [w, p] of m) words.set(w, (words.get(w) || 0) | p);
}

function loadCorpora(file, key, flag) {
  const j = JSON.parse(fs.readFileSync(path.join(tmp, file), "utf8"));
  for (const item of j[key]) {
    const raw = typeof item === "string" ? item : item.present;
    if (!raw) continue;
    const w = String(raw).toLowerCase();
    if (!/^[a-z]+$/.test(w) || w.length < 3 || w.length > 14) continue;
    words.set(w, (words.get(w) || 0) | flag);
  }
}

loadCorpora("nouns.json", "nouns", POS.noun);
loadCorpora("verbs.json", "verbs", POS.verb);
loadCorpora("adjs.json", "adjs", POS.adjective);

const google = fs
  .readFileSync(path.join(tmp, "google-10000.txt"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((s) => s.toLowerCase().trim())
  .filter(Boolean);
const freqRank = new Map();
google.forEach((w, i) => {
  if (!freqRank.has(w)) freqRank.set(w, i + 1);
});

const blocklist = new Set(
  `
  damn hell sex sexy nude naked porn rape slut whore bitch bastard asshole fuck fucking shit crap dick cock pussy penis vagina breast breasts boob boobs
  sperm semen anal orgasm erotic whorehouse masturbate masturbation genitals genital whoredom
  `
    .trim()
    .split(/\s+/)
    .filter(Boolean),
);

function difficulty(word, rank) {
  const len = word.length;
  if (rank > 0 && rank <= 2500 && len <= 6) return 0;
  if (rank > 0 && rank <= 7000 && len <= 9) return 1;
  if (rank > 0 && rank <= 2500) return 1;
  if (rank === 0 && len <= 5) return 1;
  return 2;
}

const rows = [];
for (const [w, pos] of words) {
  if (blocklist.has(w)) continue;
  const rank = freqRank.get(w) || 0;
  if (w.length < 3 || w.length > 14) continue;
  if (rank === 0 && w.length > 12) continue;
  rows.push({
    w,
    p: pos,
    r: rank,
    c: rank > 0 ? 1 : 0,
    d: difficulty(w, rank),
  });
}

rows.sort((a, b) => {
  if (a.c !== b.c) return b.c - a.c;
  if (a.r !== b.r) {
    if (a.r === 0) return 1;
    if (b.r === 0) return -1;
    return a.r - b.r;
  }
  return a.w.localeCompare(b.w);
});

const stats = {
  total: rows.length,
  nouns: rows.filter((x) => (x.p & POS.noun) !== 0).length,
  verbs: rows.filter((x) => (x.p & POS.verb) !== 0).length,
  adjectives: rows.filter((x) => (x.p & POS.adjective) !== 0).length,
  common: rows.filter((x) => x.c === 1).length,
  extended: rows.filter((x) => x.c === 0).length,
  easy: rows.filter((x) => x.d === 0).length,
  medium: rows.filter((x) => x.d === 1).length,
  hard: rows.filter((x) => x.d === 2).length,
};

const payload = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  encoding: {
    p: "bitflags noun=1 verb=2 adjective=4",
    r: "google-10000-english-usa-no-swears 1-based rank; 0=not in list",
    c: "1=common (in google-10k), 0=extended",
    d: "0=easy 1=medium 2=hard (documented heuristic)",
  },
  stats,
  words: rows.map((x) => [x.w, x.p, x.r, x.c, x.d]),
};

fs.writeFileSync(path.join(outDir, "vocabulary.json"), JSON.stringify(payload));
fs.copyFileSync(
  path.join(tmp, "package/LICENSE"),
  path.join(outDir, "LICENSE-WORDNET.txt"),
);
fs.writeFileSync(path.join(outDir, "stats.json"), JSON.stringify(stats, null, 2));

console.log(JSON.stringify(stats, null, 2));
console.log("bytes", fs.statSync(path.join(outDir, "vocabulary.json")).size);
