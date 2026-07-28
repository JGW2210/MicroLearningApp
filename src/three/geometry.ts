import * as THREE from 'three';
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
  inclusion: 0.16,
  endospore: 0.55,
  flagellum: 2.4,
  pili: 2.45,
  fimbriae: 2.4,
};

/**
 * Push every vertex along its own normal by a smooth, position-dependent
 * amount, turning a regular surface into an irregular one.
 *
 * Used where a crisp mathematical boundary misrepresents the biology: a capsule
 * is a loose gel that fades into the medium rather than a shell with an edge,
 * and a nucleoid is a lobed mass rather than a tidy ellipsoid. Deterministic —
 * the same surface always roughens the same way, so nothing shimmers between
 * frames or differs between the hero and the main scene.
 */
export function roughen(geo: THREE.BufferGeometry, amplitude: number, frequency: number) {
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nrm, i);
    // Three offset sine lobes: smooth, seamless in every direction, and cheap.
    // Averaged, so `w` stays within ±1 and `amplitude` is the true worst-case
    // displacement — which is what lets callers budget it against a hard limit
    // like the membrane a nucleoid must not poke through.
    const w =
      (Math.sin(p.x * frequency + 1.7) * Math.cos(p.y * frequency * 0.9 + 0.4) +
        Math.sin(p.y * frequency * 1.3 + 2.9) * Math.cos(p.z * frequency * 1.1 + 1.2) +
        Math.sin(p.z * frequency * 0.8 + 0.6) * Math.cos(p.x * frequency * 1.2 + 2.3)) /
      3;
    pos.setXYZ(i, p.x + n.x * w * amplitude, p.y + n.y * w * amplitude, p.z + n.z * w * amplitude);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * Envelope layers that are walls rather than volumes. These have a real
 * thickness to show at the cut face; the capsule and the cytoplasm are
 * open regions and get a single bounding surface instead.
 */
export function isWall(kind: StructureKind): boolean {
  return (
    kind === 'outer-membrane' ||
    kind === 'peptidoglycan' ||
    kind === 'mycolic-acid' ||
    kind === 'cell-membrane'
  );
}

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
