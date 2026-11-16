/**
 * Unbiased random integer in [0, maxExclusive).
 * Uses crypto.getRandomValues with rejection sampling.
 * Does not fall back to Math.random.
 */
export type RandomIntFn = (maxExclusive: number) => number;

export class SecureRandomUnavailableError extends Error {
  constructor() {
    super("A secure random source is not available in this browser.");
    this.name = "SecureRandomUnavailableError";
  }
}

export function createCryptoRandomInt(): RandomIntFn {
  return (maxExclusive: number) => {
    if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError("maxExclusive must be a positive finite number");
    }
    const max = Math.floor(maxExclusive);
    if (max <= 0) throw new RangeError("maxExclusive must be >= 1");
    if (max === 1) return 0;

    if (typeof globalThis.crypto?.getRandomValues !== "function") {
      throw new SecureRandomUnavailableError();
    }

    const limit = 0x100000000;
    const threshold = limit - (limit % max);
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      globalThis.crypto.getRandomValues(buf);
      x = buf[0]!;
    } while (x >= threshold);
    return x % max;
  };
}

/** Deterministic RNG for tests (mulberry32). */
export function createSeededRandomInt(seed: number): RandomIntFn {
  let t = seed >>> 0;
  return (maxExclusive: number) => {
    const max = Math.floor(maxExclusive);
    if (max <= 0) throw new RangeError("maxExclusive must be >= 1");
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    const u = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    return Math.floor(u * max);
  };
}
