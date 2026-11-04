/**
 * Deterministic Unicode character maps for fancy text styles.
 * Unsupported characters are left unchanged by callers.
 */

function rangeMap(
  fromStart: number,
  fromEnd: number,
  toStart: number,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (let i = 0; i <= fromEnd - fromStart; i += 1) {
    map[String.fromCodePoint(fromStart + i)] = String.fromCodePoint(toStart + i);
  }
  return map;
}

function applyExceptions(
  map: Record<string, string>,
  exceptions: Record<string, string>,
): Record<string, string> {
  return { ...map, ...exceptions };
}

/** A–Z then a–z contiguous mathematical alphabets. */
function mathAlpha(upperStart: number, lowerStart: number): Record<string, string> {
  return {
    ...rangeMap(0x41, 0x5a, upperStart),
    ...rangeMap(0x61, 0x7a, lowerStart),
  };
}

function mathDigits(start: number): Record<string, string> {
  return rangeMap(0x30, 0x39, start);
}

export const BOLD_SERIF = {
  ...mathAlpha(0x1d400, 0x1d41a),
  ...mathDigits(0x1d7ce),
};

export const BOLD_SANS = {
  ...mathAlpha(0x1d5d4, 0x1d5ee),
  ...mathDigits(0x1d7ec),
};

export const ITALIC = applyExceptions(mathAlpha(0x1d434, 0x1d44e), {
  h: "\u210e", // Planck constant
});

export const BOLD_ITALIC = mathAlpha(0x1d468, 0x1d482);

export const SANS = mathAlpha(0x1d5a0, 0x1d5ba);

export const SANS_ITALIC = mathAlpha(0x1d608, 0x1d622);

export const SANS_BOLD_ITALIC = mathAlpha(0x1d63c, 0x1d656);

export const SCRIPT = applyExceptions(mathAlpha(0x1d49c, 0x1d4b6), {
  B: "\u212c",
  E: "\u2130",
  F: "\u2131",
  H: "\u210b",
  I: "\u2110",
  L: "\u2112",
  M: "\u2133",
  R: "\u211b",
  e: "\u212f",
  g: "\u210a",
  o: "\u2134",
});

export const BOLD_SCRIPT = mathAlpha(0x1d4d0, 0x1d4ea);

export const FRAKTUR = applyExceptions(mathAlpha(0x1d504, 0x1d51e), {
  C: "\u212d",
  H: "\u210c",
  I: "\u2111",
  R: "\u211c",
  Z: "\u2128",
});

export const BOLD_FRAKTUR = mathAlpha(0x1d56c, 0x1d586);

export const DOUBLE_STRUCK = applyExceptions(
  {
    ...mathAlpha(0x1d538, 0x1d552),
    ...mathDigits(0x1d7d8),
  },
  {
    C: "\u2102",
    H: "\u210d",
    N: "\u2115",
    P: "\u2119",
    Q: "\u211a",
    R: "\u211d",
    Z: "\u2124",
  },
);

export const MONOSPACE = {
  ...mathAlpha(0x1d670, 0x1d68a),
  ...mathDigits(0x1d7f6),
};

/** Fullwidth ASCII (U+FF01–U+FF5E mirrors U+0021–U+007E). */
export const FULLWIDTH: Record<string, string> = (() => {
  const map: Record<string, string> = {
    " ": "\u3000",
  };
  for (let cp = 0x21; cp <= 0x7e; cp += 1) {
    map[String.fromCodePoint(cp)] = String.fromCodePoint(cp + 0xfee0);
  }
  return map;
})();

export const SMALL_CAPS: Record<string, string> = {
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ꜰ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "ꜱ",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
  A: "ᴀ",
  B: "ʙ",
  C: "ᴄ",
  D: "ᴅ",
  E: "ᴇ",
  F: "ꜰ",
  G: "ɢ",
  H: "ʜ",
  I: "ɪ",
  J: "ᴊ",
  K: "ᴋ",
  L: "ʟ",
  M: "ᴍ",
  N: "ɴ",
  O: "ᴏ",
  P: "ᴘ",
  Q: "ǫ",
  R: "ʀ",
  S: "ꜱ",
  T: "ᴛ",
  U: "ᴜ",
  V: "ᴠ",
  W: "ᴡ",
  X: "x",
  Y: "ʏ",
  Z: "ᴢ",
};

export const CIRCLED: Record<string, string> = {
  ...rangeMap(0x41, 0x5a, 0x24b6),
  ...rangeMap(0x61, 0x7a, 0x24d0),
  "0": "⓪",
  "1": "①",
  "2": "②",
  "3": "③",
  "4": "④",
  "5": "⑤",
  "6": "⑥",
  "7": "⑦",
  "8": "⑧",
  "9": "⑨",
};

export const NEGATIVE_CIRCLED: Record<string, string> = {
  ...rangeMap(0x41, 0x5a, 0x1f150),
  // lowercase falls back to uppercase forms (no distinct lowercase set)
  ...Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [
      String.fromCodePoint(0x61 + i),
      String.fromCodePoint(0x1f150 + i),
    ]),
  ),
  "0": "⓿",
  "1": "❶",
  "2": "❷",
  "3": "❸",
  "4": "❹",
  "5": "❺",
  "6": "❻",
  "7": "❼",
  "8": "❽",
  "9": "❾",
};

export const SQUARED: Record<string, string> = {
  ...rangeMap(0x41, 0x5a, 0x1f130),
  ...Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [
      String.fromCodePoint(0x61 + i),
      String.fromCodePoint(0x1f130 + i),
    ]),
  ),
};

export const NEGATIVE_SQUARED: Record<string, string> = {
  ...rangeMap(0x41, 0x5a, 0x1f170),
  ...Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [
      String.fromCodePoint(0x61 + i),
      String.fromCodePoint(0x1f170 + i),
    ]),
  ),
};

export const PARENTHESIZED: Record<string, string> = {
  ...rangeMap(0x61, 0x7a, 0x249c),
  ...Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [
      String.fromCodePoint(0x41 + i),
      String.fromCodePoint(0x249c + i),
    ]),
  ),
  "1": "⑴",
  "2": "⑵",
  "3": "⑶",
  "4": "⑷",
  "5": "⑸",
  "6": "⑹",
  "7": "⑺",
  "8": "⑻",
  "9": "⑼",
  // No dedicated parenthesized digit zero in this Unicode block.
};

export const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  A: "ᴬ",
  B: "ᴮ",
  D: "ᴰ",
  E: "ᴱ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  R: "ᴿ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
};

export const SUBSCRIPT: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

/** Upside-down / flip map (applied after reversing grapheme order). */
export const UPSIDE_DOWN: Record<string, string> = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ᴉ",
  j: "ɾ",
  k: "ʞ",
  l: "l",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  A: "∀",
  B: "𐐒",
  C: "Ɔ",
  D: "ᗡ",
  E: "Ǝ",
  F: "Ⅎ",
  G: "⅁",
  H: "H",
  I: "I",
  J: "ſ",
  K: "⋊",
  L: "˥",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Ό",
  R: "ᴚ",
  S: "S",
  T: "⊥",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z",
  "0": "0",
  "1": "Ɩ",
  "2": "ᄅ",
  "3": "Ɛ",
  "4": "ㄣ",
  "5": "ϛ",
  "6": "9",
  "7": "ㄥ",
  "8": "8",
  "9": "6",
  ".": "˙",
  ",": "'",
  "'": ",",
  '"': "„",
  "?": "¿",
  "!": "¡",
  "&": "⅋",
  "_": "‾",
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "{": "}",
  "}": "{",
  "<": ">",
  ">": "<",
};

export const COMBINING = {
  underline: "\u0332",
  doubleUnderline: "\u0333",
  strikethrough: "\u0336",
  overline: "\u0305",
  slash: "\u0338",
  dotBelow: "\u0323",
  diaeresisBelow: "\u0324",
} as const;
