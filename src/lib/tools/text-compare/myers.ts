export interface ScriptItem {
  type: "equal" | "delete" | "insert";
  aIndex: number;
  bIndex: number;
}

/**
 * Myers shortest-edit script.
 * Stops when the edit distance or visited-cell budget is exceeded.
 */
export function myersDiff(
  lengthA: number,
  lengthB: number,
  equals: (aIndex: number, bIndex: number) => boolean,
  maxDistance: number,
): { script: ScriptItem[]; limited: boolean } {
  if (lengthA === 0 && lengthB === 0) return { script: [], limited: false };
  const max = lengthA + lengthB;
  const ceiling = Math.max(0, Math.min(maxDistance, max));
  const offset = ceiling + 1;
  const size = 2 * ceiling + 3;
  let v = new Int32Array(size);
  v.fill(-1);
  v[offset + 1] = 0;
  const trace: Int32Array[] = [];
  let visits = 0;
  const visitBudget = 1_500_000;

  for (let d = 0; d <= ceiling; d += 1) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      const kIndex = offset + k;
      const down = k === -d || (k !== d && v[kIndex - 1]! < v[kIndex + 1]!);
      let x = down ? v[kIndex + 1]! : v[kIndex - 1]! + 1;
      let y = x - k;
      while (x < lengthA && y < lengthB && equals(x, y)) {
        x += 1;
        y += 1;
        visits += 1;
        if (visits > visitBudget) {
          return { script: [], limited: true };
        }
      }
      v[kIndex] = x;
      if (x >= lengthA && y >= lengthB) {
        return { script: backtrack(trace, offset, lengthA, lengthB, d, equals), limited: false };
      }
    }
    const next = new Int32Array(size);
    next.set(v);
    v = next;
  }

  return { script: [], limited: true };
}

function backtrack(
  trace: Int32Array[],
  offset: number,
  lengthA: number,
  lengthB: number,
  dEnd: number,
  equals: (aIndex: number, bIndex: number) => boolean,
): ScriptItem[] {
  const script: ScriptItem[] = [];
  let x = lengthA;
  let y = lengthB;
  for (let d = dEnd; d >= 0; d -= 1) {
    const v = trace[d]!;
    const k = x - y;
    const kIndex = offset + k;
    const down = k === -d || (k !== d && v[kIndex - 1]! < v[kIndex + 1]!);
    const prevK = down ? k + 1 : k - 1;
    const prevX = v[offset + prevK]!;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x -= 1;
      y -= 1;
      script.push({ type: "equal", aIndex: x, bIndex: y });
      if (!equals(x, y)) break;
    }
    if (d === 0) break;
    if (down) {
      y -= 1;
      script.push({ type: "insert", aIndex: x, bIndex: y });
    } else {
      x -= 1;
      script.push({ type: "delete", aIndex: x, bIndex: y });
    }
  }
  script.reverse();
  return script;
}
