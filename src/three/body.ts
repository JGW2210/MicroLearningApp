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

/**
 * The bacterial chromosome as a **closed, supercoiled circular loop** — the form
 * drawn in textbooks.
 *
 * A relaxed circle is wound about its own path (plectonemic writhe), so the
 * strand crosses over itself the way a twisted rubber band does, then the whole
 * loop is fitted to the cell: squeezed into the sphere of a coccus, or stretched
 * along the axis of a rod. The curve is closed, so there are no loose ends.
 *
 * @param extent   half-length available along the cell's long axis
 * @param girth    half-width available across it
 * @param spacing  distance between successive supercoils along the loop
 */
export function supercoiledLoop(
  body: CellBody,
  extent: number,
  girth: number,
  spacing: number,
): { curve: THREE.Curve<THREE.Vector3>; coil: number; segments: number } {
  // Ramanujan's ellipse perimeter — used to keep the coil density even whatever
  // the cell's proportions.
  const a0 = Math.max(extent, 1e-4);
  const b0 = Math.max(girth, 1e-4);
  const perimeter =
    Math.PI * (3 * (a0 + b0) - Math.sqrt((3 * a0 + b0) * (a0 + 3 * b0)));
  const writhe = Math.max(8, Math.round(perimeter / Math.max(spacing, 1e-4)));
  // A helix reads best when its amplitude is about half its pitch.
  const coil = spacing * 0.55;

  const pts: THREE.Vector3[] = [];
  const seg = Math.min(1600, writhe * 18);
  for (let i = 0; i < seg; i++) {
    const t = i / seg;
    const a = t * Math.PI * 2;
    // Base ellipse...
    const along = Math.cos(a) * extent;
    const across = Math.sin(a) * girth;
    // ...with the strand wound tightly about that path, so it coils over and
    // under itself the way a twisted closed loop does.
    const w = a * writhe;
    const radial = Math.cos(w) * coil;
    const depth = Math.sin(w) * coil;
    pts.push(
      new THREE.Vector3()
        .addScaledVector(body.ex, along + radial * Math.cos(a))
        .addScaledVector(body.ey, across + radial * Math.sin(a))
        .addScaledVector(body.ez, depth),
    );
  }
  // closed = true joins the ends, giving a genuine circular chromosome.
  return { curve: new THREE.CatmullRomCurve3(pts, true), coil, segments: seg };
}

/**
 * Where a plasmid sits: scattered around the chromosome inside the cytoplasm.
 * Positions fan out by the golden angle so no two ever coincide, however many
 * plasmids an organism carries.
 */
export function plasmidAnchor(body: CellBody, index: number, radius: number): THREE.Vector3 {
  const angle = index * 2.39996;
  const ring = radius * (0.46 + 0.2 * ((index * 0.37) % 1));
  const along = body.curve
    ? body.length * (0.16 + 0.2 * ((index * 0.61803) % 1)) * (index % 2 === 0 ? 1 : -1)
    : 0;
  return new THREE.Vector3()
    .addScaledVector(body.ex, along)
    .addScaledVector(body.ey, Math.cos(angle) * ring)
    .addScaledVector(body.ez, Math.sin(angle) * ring);
}

/** Any unit vector perpendicular to `v`. */
function perpendicular(v: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(v.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(v, ref).normalize();
}
