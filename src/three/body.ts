import * as THREE from 'three';
import type { BodyShape } from '@/types/content';
import { VIEW_DIR } from './focus';

/**
 * A resolved cell body: a centreline curve (null for cocci) expressed in world
 * space, oriented so the long axis reads broadside to the default camera.
 * Every envelope layer is swept around this curve; contents and surface features
 * are distributed relative to it.
 */
export interface CellBody {
  kind: BodyShape['kind'];
  curve: THREE.Curve<THREE.Vector3> | null;
  length: number;
  radius: number;
  /** Orientation basis: long axis, screen-up, depth. */
  ex: THREE.Vector3;
  ey: THREE.Vector3;
  ez: THREE.Vector3;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Build the orientation basis so elongated cells lie across the view. */
function basis() {
  const ez = VIEW_DIR.clone(); // toward camera (depth)
  const ex = new THREE.Vector3().crossVectors(ez, UP).normalize(); // screen-right = long axis
  const ey = new THREE.Vector3().crossVectors(ex, ez).normalize(); // screen-up
  return { ex, ey, ez };
}

export function buildBody(shape: BodyShape): CellBody {
  const { ex, ey, ez } = basis();
  const radius = shape.radius;
  const kind = shape.kind;
  const at = (a: number, b: number, c: number) =>
    new THREE.Vector3()
      .addScaledVector(ex, a)
      .addScaledVector(ey, b)
      .addScaledVector(ez, c);

  let curve: THREE.Curve<THREE.Vector3> | null = null;
  let length = 0;

  if (kind === 'coccus') {
    curve = null;
  } else if (kind === 'bacillus' || kind === 'coccobacillus') {
    const L = shape.length ?? (kind === 'coccobacillus' ? radius * 1.3 : radius * 3);
    curve = new THREE.LineCurve3(at(-L / 2, 0, 0), at(L / 2, 0, 0));
    length = L;
  } else if (kind === 'vibrio') {
    const L = shape.length ?? radius * 3.4;
    const arc = Math.PI * (shape.curvature ?? 0.55);
    const R = L / arc;
    const pts: THREE.Vector3[] = [];
    const seg = 28;
    for (let i = 0; i <= seg; i++) {
      const a = -arc / 2 + arc * (i / seg);
      pts.push(at(Math.sin(a) * R, -(Math.cos(a) * R) + R * Math.cos(arc / 2), 0));
    }
    curve = new THREE.CatmullRomCurve3(pts);
    length = L;
  } else if (kind === 'spirillum' || kind === 'spirochete') {
    const turns = shape.turns ?? (kind === 'spirochete' ? 4 : 2.2);
    const amp = shape.amplitude ?? radius * (kind === 'spirochete' ? 1.5 : 2.1);
    const L = shape.length ?? radius * (kind === 'spirochete' ? 7 : 5.2);
    // Mostly planar, like a textbook spirochaete drawing: a strong wave across
    // the screen with only shallow depth. A full-depth helix would lose whole
    // coils to the cross-section cut instead of being sliced lengthwise.
    const DEPTH = 0.28;
    const pts: THREE.Vector3[] = [];
    const seg = 90;
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const a = t * turns * Math.PI * 2;
      pts.push(at(-L / 2 + L * t, Math.sin(a) * amp, Math.cos(a) * amp * DEPTH));
    }
    curve = new THREE.CatmullRomCurve3(pts);
    length = L;
  }

  return { kind, curve, length, radius, ex, ey, ez };
}

export function isElongated(body: CellBody): boolean {
  return body.curve !== null;
}

/** Endpoints of the centreline (for caps and polar features like flagella). */
export function bodyEnds(body: CellBody): { a: THREE.Vector3; b: THREE.Vector3 } {
  if (!body.curve) return { a: new THREE.Vector3(), b: new THREE.Vector3() };
  return { a: body.curve.getPointAt(0), b: body.curve.getPointAt(1) };
}

/** Tube segments used when sweeping this body. */
export function tubeSegments(body: CellBody): number {
  if (body.kind === 'spirochete') return 200;
  if (body.kind === 'spirillum' || body.kind === 'vibrio') return 120;
  return 48;
}

/**
 * Points (with outward normals) on the body surface at a given radius — used for
 * spikes, LPS, pili. Cocci use a Fibonacci sphere; elongated cells ring the tube.
 */
export function surfacePoints(
  body: CellBody,
  r: number,
  count: number,
): { position: THREE.Vector3; normal: THREE.Vector3 }[] {
  if (!body.curve) {
    const out: { position: THREE.Vector3; normal: THREE.Vector3 }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    const n = Math.max(count, 1);
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const normal = new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad).normalize();
      out.push({ position: normal.clone().multiplyScalar(r), normal });
    }
    return out;
  }

  const out: { position: THREE.Vector3; normal: THREE.Vector3 }[] = [];
  const rings = Math.max(6, Math.round(count / 6));
  const perRing = Math.max(4, Math.round(count / rings));
  for (let i = 0; i < rings; i++) {
    const t = (i + 0.5) / rings;
    const p = body.curve.getPointAt(t);
    const tan = body.curve.getTangentAt(t).normalize();
    const n0 = perpendicular(tan);
    const b0 = new THREE.Vector3().crossVectors(tan, n0).normalize();
    for (let j = 0; j < perRing; j++) {
      const a = (j / perRing) * Math.PI * 2 + i * 0.7;
      const normal = n0.clone().multiplyScalar(Math.cos(a)).addScaledVector(b0, Math.sin(a)).normalize();
      out.push({ position: p.clone().addScaledVector(normal, r), normal });
    }
  }
  return out;
}

/** Points inside the body volume (for ribosomes and similar granules). */
export function volumePoints(body: CellBody, maxR: number, count: number): THREE.Vector3[] {
  if (!body.curve) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const y = 1 - t * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const frac = 0.32 + 0.6 * ((i * 0.61803398875) % 1);
      const rr = maxR * frac;
      pts.push(new THREE.Vector3(Math.cos(theta) * rad * rr, y * rr, Math.sin(theta) * rad * rr));
    }
    return pts;
  }
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i * 0.61803398875) % 1;
    const p = body.curve.getPointAt(t);
    const tan = body.curve.getTangentAt(t).normalize();
    const n0 = perpendicular(tan);
    const b0 = new THREE.Vector3().crossVectors(tan, n0).normalize();
    const a = i * 2.3999;
    const rr = maxR * (0.15 + 0.7 * ((i * 0.371) % 1));
    pts.push(p.clone().addScaledVector(n0, Math.cos(a) * rr).addScaledVector(b0, Math.sin(a) * rr));
  }
  return pts;
}

/** Total scene-unit extent along the cell's longest dimension. */
export function bodyExtent(body: CellBody): number {
  return body.curve ? body.length + body.radius * 2 : body.radius * 2;
}

/**
 * Micrometres per scene unit. Scene units are arbitrary and differ per organism
 * (a coccus and a spirochaete are both drawn at a comfortable size), so this
 * conversion is what lets one scale bar stay honest across all of them.
 */
export function umPerUnit(body: CellBody, sizeUm: number): number {
  const extent = bodyExtent(body);
  return extent > 0 ? sizeUm / extent : 1;
}

/**
 * Half-extent of the body along the view axis, given the outermost layer radius.
 * The cut-depth slider is scaled by this so "half" means half of *this* cell,
 * whatever its size or shape.
 */
export function bodyDepth(body: CellBody, outerRadius: number): number {
  if (!body.curve) return outerRadius;
  let max = 0;
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    max = Math.max(max, Math.abs(body.curve.getPointAt(i / steps).dot(body.ez)));
  }
  return max + outerRadius;
}

/** Midpoint of the body (origin for cocci). */
export function bodyCenter(body: CellBody): THREE.Vector3 {
  return body.curve ? body.curve.getPointAt(0.5) : new THREE.Vector3();
}

/**
 * The pole a polar flagellar tuft grows from, and the direction pointing away
 * from the cell there.
 *
 * The curve tangent is NOT usable for this: at the end of a helix it sweeps
 * sideways along the wave, which would lay the filaments back alongside the
 * body. The axis from the body centre out to the end always points away.
 */
export function polarAxis(body: CellBody): { end: THREE.Vector3; outward: THREE.Vector3 } {
  if (!body.curve) {
    return { end: new THREE.Vector3(), outward: body.ex.clone() };
  }
  const end = body.curve.getPointAt(1);
  const outward = end.clone().sub(bodyCenter(body));
  if (outward.lengthSq() < 1e-6) outward.copy(body.ex);
  return { end, outward: outward.normalize() };
}

/** A visible point on the top surface of a layer, for anchoring callout lines. */
export function surfaceAnchor(body: CellBody, radius: number): THREE.Vector3 {
  return bodyCenter(body).addScaledVector(body.ey, radius);
}

/** A wavy interior curve for the nucleoid of elongated cells. */
export function nucleoidCurve(body: CellBody, amp: number): THREE.Curve<THREE.Vector3> | null {
  if (!body.curve) return null;
  const pts: THREE.Vector3[] = [];
  const seg = 60;
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = body.curve.getPointAt(t);
    const tan = body.curve.getTangentAt(t).normalize();
    const n0 = perpendicular(tan);
    const wobble = Math.sin(t * Math.PI * 6) * amp * (t > 0.08 && t < 0.92 ? 1 : 0.2);
    pts.push(p.clone().addScaledVector(n0, wobble));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Any unit vector perpendicular to `v`. */
function perpendicular(v: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(v.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(v, ref).normalize();
}
