import type { StructureKind } from '@/types/content';

/** Default shell radius per structure kind, used when data omits an explicit one. */
export const defaultRadius: Record<StructureKind, number> = {
  capsule: 2.75,
  'outer-membrane': 2.35,
  lps: 2.5,
  'mycolic-acid': 2.45,
  peptidoglycan: 2.2,
  'teichoic-acid': 2.4,
  'cell-membrane': 1.9,
  cytoplasm: 1.75,
  nucleoid: 0.9,
  ribosomes: 1.5,
  plasmid: 1.1,
  flagellum: 2.4,
  pili: 2.45,
  fimbriae: 2.4,
};

/**
 * Envelope layers: the continuous shells swept around the whole body, as
 * opposed to discrete contents and surface features. They are what the
 * cross-section slices, and what the body's bends have to be wide enough to
 * carry without the sweep folding through itself.
 */
export function isShell(kind: StructureKind): boolean {
  return (
    kind === 'capsule' ||
    kind === 'outer-membrane' ||
    kind === 'peptidoglycan' ||
    kind === 'mycolic-acid' ||
    kind === 'cell-membrane' ||
    kind === 'cytoplasm'
  );
}

/** Distribute `count` points evenly on a sphere of `radius` (Fibonacci lattice). */
export function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = Math.max(count, 1);
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return pts;
}

/** Deterministic scatter of `count` points inside a sphere (for ribosomes etc.). */
export function fibonacciVolume(count: number, maxRadius: number): [number, number, number][] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = 1 - t * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // Vary the radial fraction deterministically so points fill the volume.
    const frac = 0.32 + 0.6 * ((i * 0.61803398875) % 1);
    const rad = maxRadius * frac;
    pts.push([Math.cos(theta) * r * rad, y * rad, Math.sin(theta) * r * rad]);
  }
  return pts;
}
