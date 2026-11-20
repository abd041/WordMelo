/** Code-point units. Default English passages are BMP, so this matches graphemes. */
export function units(text: string): string[] {
  return Array.from(text);
}

export function joinUnits(parts: string[]): string {
  return parts.join("");
}

export function popUnit(text: string): string {
  const parts = units(text);
  parts.pop();
  return joinUnits(parts);
}

export function commonPrefixLength(left: string[], right: string[]): number {
  const limit = Math.min(left.length, right.length);
  let index = 0;
  while (index < limit && left[index] === right[index]) index += 1;
  return index;
}
