/** Deterministic integer in [0, maxExclusive). Mulberry32. */
export function createSeededRandom(seed: number): (maxExclusive: number) => number {
  let state = seed >>> 0;
  return (maxExclusive: number) => {
    const max = Math.floor(maxExclusive);
    if (max <= 1) return 0;
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    const unit = ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    return Math.floor(unit * max);
  };
}
