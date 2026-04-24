// Seeded PRNG so mock data is stable across reloads.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const rand = mulberry32(20260424);

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
