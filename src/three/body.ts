import * as THREE from 'three';
import type { BodyShape, Organism, StructureNode } from '@/types/content';
import { defaultRadius, isShell } from './geometry';
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

/**
 * How much slacker than the widest swept layer a bend has to be. A tube whose
 * radius equals the centreline's radius of curvature is exactly degenerate;
 * anything tighter folds through itself, so the margin keeps bends clear of
 * that limit rather than merely at it.
 */
const CURVATURE_MARGIN = 1.2;

/** Depth of a wavy body's coil when nothing forces it rounder. */
const FLAT_DEPTH = 0.28;

/**
 * The widest layer that gets swept along the centreline — the radius the body's
 * bends have to be able to carry.
 */
export function sweptRadius(structures: StructureNode[], fallback: number): number {
  let r = fallback;
  for (const s of structures) {
    if (!isShell(s.kind)) continue;
    r = Math.max(r, s.geometry?.radius ?? defaultRadius[s.kind]);
  }
  return r;
}

/** Resolve the body an organism's layers will actually be swept along. */
export function buildCellBody(organism: Organism): CellBody {
  return buildBody(organism.body, sweptRadius(organism.structures, organism.body.radius));
}

/**
 * The radii everything that is not an envelope layer is positioned against:
 * where the cytoplasm ends, where the cell surface is, and how much room the
 * chromosome takes up. Resolved once per organism so contents, appendages and
 * granules all agree about the cell they live in.
 */
export interface CellLayout {
  /** Outer bound of the cytoplasm — the innermost envelope layer. */
  interior: number;
  /** Outermost envelope layer: the surface appendages emerge through. */
  envelope: number;
  /** Radius the chromosome occupies, already capped to fit the cytoplasm. */
  nucleoid: number;
}

export function cellLayout(structures: StructureNode[], body: CellBody): CellLayout {
  const interior = interiorRadius(structures, body);
  const envelope = sweptRadius(structures, body.radius);
  const authored = structures.find((s) => s.kind === 'nucleoid');
  const nucleoid = authored
    ? Math.min(authored.geometry?.radius ?? defaultRadius.nucleoid, interior * INTERIOR_HEADROOM)
    : 0;
  return { interior, envelope, nucleoid };
}

/**
 * @param sweepRadius radius of the widest layer that will be swept along the
 *   result. Bends tighter than this fold the swept tube through itself, so the
 *   wavy body kinds are relaxed until they can carry it.
 */
export function buildBody(shape: BodyShape, sweepRadius = shape.radius): CellBody {
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
    // The comma bends on a circle of radius L/arc, so the arc is capped at
    // whatever the outermost layer can be swept around without folding.
    const maxArc = L / Math.max(sweepRadius * CURVATURE_MARGIN, 1e-4);
    const arc = Math.min(Math.PI * (shape.curvature ?? 0.55), maxArc);
    curve = new ArcCurve({ ex, ey, ez }, L, arc);
    length = L;
  } else if (kind === 'spirillum' || kind === 'spirochete') {
    const turns = shape.turns ?? (kind === 'spirochete' ? 4 : 2.2);
    const L = shape.length ?? radius * (kind === 'spirochete' ? 7 : 5.2);
    // Drawn as flat as the envelope allows: a strong wave across the screen with
    // shallow depth reads like a textbook spirochaete, and keeps the coils lying
    // broadside to the cross-section so the cut slices them lengthwise rather
    // than removing whole turns. Flattening concentrates a coil's curvature at
    // its crests, though, so a wave that would pinch the swept layers is given
    // back the depth it needs (see `sweepableCoil`).
    const { amp, depth } = sweepableCoil(
      L,
      turns,
      shape.amplitude ?? radius * (kind === 'spirochete' ? 1.5 : 2.1),
      sweepRadius,
    );
    curve = new CoilCurve({ ex, ey, ez }, L, turns, amp, depth);
    length = L;
  }

  return { kind, curve, length, radius, ex, ey, ez };
}

type Basis = { ex: THREE.Vector3; ey: THREE.Vector3; ez: THREE.Vector3 };

/**
 * Curved bodies are exact analytic curves rather than splines through sampled
 * points. A Catmull-Rom fitted to a coil bends noticeably tighter than the coil
 * it was sampled from — up to 28% here — which is enough to undo the clearance
 * `sweepableCoil` works out and let the swept layers fold again. Evaluating the
 * curve directly makes the geometry and the guard agree exactly.
 */
class CoilCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly b: Basis,
    private readonly span: number,
    private readonly turns: number,
    private readonly amp: number,
    private readonly depth: number,
  ) {
    super();
    this.arcLengthDivisions = Math.max(200, Math.round(turns * 120));
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const a = t * this.turns * Math.PI * 2;
    return target
      .set(0, 0, 0)
      .addScaledVector(this.b.ex, this.span * (t - 0.5))
      .addScaledVector(this.b.ey, Math.sin(a) * this.amp)
      .addScaledVector(this.b.ez, Math.cos(a) * this.amp * this.depth);
  }
}

/** A comma: a circular arc of radius span/arc, its ends level with the origin. */
class ArcCurve extends THREE.Curve<THREE.Vector3> {
  private readonly r: number;

  constructor(
    private readonly b: Basis,
    span: number,
    private readonly arc: number,
  ) {
    super();
    this.r = span / arc;
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const a = this.arc * (t - 0.5);
    return target
      .set(0, 0, 0)
      .addScaledVector(this.b.ex, Math.sin(a) * this.r)
      .addScaledVector(this.b.ey, this.r * (Math.cos(this.arc / 2) - Math.cos(a)));
  }
}

/**
 * Shape a coil so a tube of `sweepRadius` can actually be swept along it.
 *
 * A swept tube folds through itself wherever the tube is fatter than the
 * centreline's radius of curvature, which is what pinched the crests of the
 * spirochaete and the spirillum: at 28% depth their walls were more than twice
 * as thick as the bends they had to turn.
 *
 * Depth is the parameter to spend, because it is the one that was never
 * anatomical — a real spirochaete is a three-dimensional coil, and flattening it
 * is a drawing convention. Rounding the coil out spreads curvature that
 * flattening had piled into the crests, and buys a great deal of it: the
 * tightest bend of a coil of amplitude `a`, depth `d` and angular rate `w` over
 * length `l` has radius (l² + d²a²w²) / (aw²), so depth enters squared. Only
 * once a fully round coil still bends too tightly is the amplitude eased, and
 * the coil is never flattened past the drawing convention.
 */
function sweepableCoil(
  length: number,
  turns: number,
  amplitude: number,
  sweepRadius: number,
): { amp: number; depth: number } {
  const w = turns * Math.PI * 2;
  const need = sweepRadius * CURVATURE_MARGIN;
  const l2 = length * length;
  const aw2 = amplitude * w * w;
  if (aw2 <= 1e-9) return { amp: amplitude, depth: FLAT_DEPTH };

  // Depth that puts the crest's radius of curvature exactly at `need`.
  const d2 = (need * aw2 - l2) / (amplitude * amplitude * w * w);
  const depth = d2 <= 0 ? 0 : Math.sqrt(d2);
  if (depth <= 1) return { amp: amplitude, depth: Math.max(depth, FLAT_DEPTH) };

  // Even a round coil bends too tightly. At full depth the radius of curvature
  // is (l² + a²w²)/(aw²), so the amplitudes that clear `need` are the roots of
  // w²a² − need·w²a + l² ≥ 0; take the lower one to slacken rather than inflate.
  const disc = need * need * w * w - 4 * l2;
  if (disc <= 0) return { amp: amplitude, depth: 1 };
  const eased = (need * w * w - w * Math.sqrt(disc)) / (2 * w * w);
  return { amp: Math.min(amplitude, eased), depth: 1 };
}

export function isElongated(body: CellBody): boolean {
  return body.curve !== null;
}

/** Endpoints of the centreline (for caps and polar features like flagella). */
export function bodyEnds(body: CellBody): { a: THREE.Vector3; b: THREE.Vector3 } {
  if (!body.curve) return { a: new THREE.Vector3(), b: new THREE.Vector3() };
  return { a: body.curve.getPointAt(0), b: body.curve.getPointAt(1) };
}

/**
 * The two poles, each with the direction pointing out of the cell there.
 *
 * Envelope layers are capped with a hemisphere aimed down these directions. A
 * whole sphere would do the same job on the outside while leaving its back half
 * buried in the cytoplasm, where the cutaway finds it: two domes sitting inside
 * the cell, each ringed by the seam where it cuts through its own tube.
 */
export function bodyCaps(body: CellBody): { point: THREE.Vector3; outward: THREE.Vector3 }[] {
  if (!body.curve) return [];
  return [
    { point: body.curve.getPointAt(0), outward: body.curve.getTangentAt(0).negate() },
    { point: body.curve.getPointAt(1), outward: body.curve.getTangentAt(1) },
  ];
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

/**
 * Points inside the body volume (for ribosomes and similar granules).
 *
 * `minR` hollows the distribution out into a shell. Ribosomes use it to stay
 * clear of the nucleoid: a real chromosome excludes them, so they crowd into the
 * cytoplasm around it rather than sitting on top of it as a uniform scatter did.
 */
export function volumePoints(
  body: CellBody,
  maxR: number,
  count: number,
  minR = 0,
  minSpan = 1,
): THREE.Vector3[] {
  const lo = Math.max(0, Math.min(minR, maxR * 0.92));
  const at = (f: number, hollow = true) => {
    const inner = hollow ? lo : 0;
    return inner + (maxR - inner) * f;
  };
  if (!body.curve) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const y = 1 - t * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const rr = at(0.12 + 0.86 * ((i * 0.61803398875) % 1));
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
    // Only hollowed out where the chromosome actually lies. The nucleoid takes
    // up the middle of a rod, not its poles, so the polar cytoplasm stays packed
    // right across — which is where ribosomes really are densest.
    const rr = at(0.08 + 0.9 * ((i * 0.371) % 1), Math.abs(t - 0.5) < minSpan / 2);
    pts.push(p.clone().addScaledVector(n0, Math.cos(a) * rr).addScaledVector(b0, Math.sin(a) * rr));
  }
  return pts;
}

/**
 * Path of a spirochaete's endoflagellum.
 *
 * Spirochaetes do not trail their flagella behind them: the filaments are held
 * inside the periplasm, anchored at one pole and wound around the protoplasmic
 * cylinder, and turning them there is what screws the whole cell forward. That
 * is the organism's defining feature, so it is drawn where it actually sits —
 * between the cell membrane and the outer membrane — rather than as an external
 * tuft borrowed from the rods.
 *
 * @param offset  radial distance from the centreline (the periplasm)
 * @param fromEnd which pole it is anchored at
 * @param span    fraction of the cell length it runs along
 */
export function endoflagellum(
  body: CellBody,
  offset: number,
  fromEnd: 0 | 1,
  span: number,
  wraps: number,
  phase: number,
): THREE.Vector3[] {
  if (!body.curve) return [];
  const pts: THREE.Vector3[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const t = fromEnd === 0 ? f * span : 1 - f * span;
    const p = body.curve.getPointAt(t);
    const tan = body.curve.getTangentAt(t).normalize();
    const n0 = perpendicular(tan);
    const b0 = new THREE.Vector3().crossVectors(tan, n0).normalize();
    // Taper into the pole so the filament emerges from its anchor rather than
    // starting abruptly at full offset.
    const r = offset * Math.min(1, f * 8);
    const a = phase + f * wraps * Math.PI * 2;
    pts.push(p.clone().addScaledVector(n0, Math.cos(a) * r).addScaledVector(b0, Math.sin(a) * r));
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
  if (!body.curve) return outerRadius * CUT_CLEARANCE;
  let max = 0;
  // Fine enough to resolve a coil's near crest. At 32 samples a five-turn helix
  // gets six readings per turn and misses its own peak, which put the intact end
  // of the slider *inside* the cell.
  const steps = Math.max(64, tubeSegments(body) * 4);
  for (let i = 0; i <= steps; i++) {
    max = Math.max(max, Math.abs(body.curve.getPointAt(i / steps).dot(body.ez)));
  }
  return (max + outerRadius) * CUT_CLEARANCE;
}

/**
 * Clearance between a fully-retracted cut and the cell's near surface.
 *
 * A plane exactly tangent to a surface does not graze it — it clips every part
 * of it lying within floating-point reach, and near the tangent point the
 * surface runs parallel to the plane, so that is a broad patch rather than a
 * sliver. On a coil, which touches its near extreme once per turn, "Whole" was
 * opening the cell at every crest. Half is unaffected: the slider maps depth
 * 0.5 to offset 0 whatever this is.
 */
const CUT_CLEARANCE = 1.05;

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
 * The innermost envelope shell — the boundary everything cytoplasmic has to stay
 * inside. Cells that model a distinct cytoplasm are bounded by it; the rest are
 * bounded by the cytoplasmic membrane.
 */
export function interiorRadius(structures: StructureNode[], body: CellBody): number {
  let r = Infinity;
  for (const s of structures) {
    if (s.kind !== 'cytoplasm' && s.kind !== 'cell-membrane') continue;
    r = Math.min(r, s.geometry?.radius ?? defaultRadius[s.kind]);
  }
  return Number.isFinite(r) ? r : body.radius * 0.75;
}

/** How close to that boundary loose cytoplasmic contents are allowed to come. */
export const INTERIOR_HEADROOM = 0.86;

/** Centreline samples used for containment tests (a single point for cocci). */
const AXIS_SAMPLES = 192;
/** Ceilings that keep a long, finely wound chromosome from exploding the mesh. */
const MAX_WRITHE = 160;
const MAX_SEGMENTS = 1600;
/** Fraction of an elongated cell the chromosome spans — the poles stay clear. */
export const NUCLEOID_AXIAL = 0.33;

export interface NucleoidStrand {
  curve: THREE.Curve<THREE.Vector3>;
  /** Tubular segments to sweep along it. */
  segments: number;
  /** Radius of the drawn strand. */
  radius: number;
}

/**
 * The bacterial chromosome: a **closed, supercoiled loop fitted to the cell it
 * lives in**.
 *
 * Two things keep it accurate.
 *
 * 1. *It is built in the cell's own frame.* The loop is laid out along the body
 *    centreline and offset in the plane perpendicular to it, so a curved or
 *    helical cell gets a curved or helical chromosome. A loop built in the world
 *    plane instead — as a flat ellipse about the origin — hangs clean outside the
 *    envelope of anything that is not a straight rod.
 * 2. *Its size is budgeted from the outside in.* `outerRadius` is the space the
 *    finished strand may occupy; the supercoil swing and the strand's own
 *    thickness come out of that budget before the base path is drawn, so the loop
 *    cannot escape by the width of a coil. Every point is then clamped to the
 *    interior as a hard guarantee, whatever the cell's shape.
 *
 * The result is closed (a genuine circular chromosome), excluded from the poles
 * the way a real nucleoid is, folded back on itself in proportion to how long the
 * cell is, and wound plectonemically about its own path so it crosses over itself
 * like a twisted rubber band.
 *
 * @param outerRadius the radius of the space the finished strand may fill
 */
export function nucleoidStrand(body: CellBody, outerRadius: number): NucleoidStrand {
  const outer = Math.max(outerRadius, 1e-3);
  const radius = outer * 0.075;
  const coil = outer * 0.17;
  const baseMax = outer - coil - radius;

  // A frame that varies smoothly along the centreline. `perpendicular` alone
  // would do here, but it flips as the tangent swings, which would tear the
  // strand apart on a helical cell.
  const frames = body.curve ? body.curve.computeFrenetFrames(AXIS_SAMPLES, false) : null;
  // How many times the chromosome doubles back along the cell. Long, thin cells
  // fold it more, so the strand stays evenly distributed instead of stretching
  // into a bare hoop; three is the ceiling, because each fold lays two more
  // passes around the loop and past six they crowd the width available. A
  // coccus always takes two — one fold through a sphere reads as a hoop, two
  // as a compact tangle.
  const lobes = body.curve
    ? clamp(
        Math.round((body.curve.getLength() * NUCLEOID_AXIAL * 2) / (2 * outer) / 1.2),
        1,
        3,
      )
    : 2;

  const basePoint = (theta: number): THREE.Vector3 => {
    const along = Math.cos(lobes * theta); // -1..1, `lobes` passes end to end
    const azimuth = theta; // one turn about the axis per loop
    const spread = 0.72 + 0.28 * Math.cos(3 * lobes * theta + 1.7);
    if (!body.curve || !frames) {
      // Coccus: a closed seam across the sphere, so the chromosome reads as a
      // rounded body rather than a flat washer seen edge-on. The loop stops
      // short of the poles and its width tapers with the room the sphere leaves
      // — capping it against the sphere instead would flatten each end of the
      // path into a tight ring and read as a dumbbell.
      const x = baseMax * 0.88 * along;
      const room = Math.sqrt(Math.max(0, baseMax * baseMax - x * x));
      const r = room * spread;
      return new THREE.Vector3()
        .addScaledVector(body.ex, x)
        .addScaledVector(body.ey, Math.cos(azimuth) * r)
        .addScaledVector(body.ez, Math.sin(azimuth) * r);
    }
    const u = clamp(0.5 + NUCLEOID_AXIAL * along, 0, 1);
    const i = Math.round(u * AXIS_SAMPLES);
    const r = baseMax * spread;
    return body.curve
      .getPointAt(u)
      .addScaledVector(frames.normals[i], Math.cos(azimuth) * r)
      .addScaledVector(frames.binormals[i], Math.sin(azimuth) * r);
  };

  const sample = (n: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) pts.push(basePoint((i / n) * Math.PI * 2));
    return pts;
  };

  // Measure the base path coarsely first, so the supercoil gets a pitch that
  // reads as a twisted loop rather than as fuzz, then draw it at full resolution.
  const baseLength = closedLength(sample(256));
  // Pitch about three times the swing: tight enough to read as a plectoneme,
  // open enough that the crossings stay legible instead of blurring into fuzz.
  const writhe = clamp(Math.round(baseLength / (coil * 3)), 6, MAX_WRITHE);
  const segments = clamp(writhe * 12, 240, MAX_SEGMENTS);

  const base = sample(segments);
  const { normals, binormals } = transportFrames(base);
  // A transported frame does not come back to itself around a closed loop. The
  // leftover twist is taken out of the winding so the seam joins invisibly.
  const turn = Math.PI * 2 * writhe - frameDrift(base, normals);
  const axis = axisSamples(body);
  const limit = outer - radius;

  const pts = base.map((p, i) => {
    const w = turn * (i / segments);
    p.addScaledVector(normals[i], Math.cos(w) * coil).addScaledVector(
      binormals[i],
      Math.sin(w) * coil,
    );
    return clampInsideBody(p, axis, limit);
  });

  // closed = true joins the ends, giving a genuine circular chromosome.
  return { curve: new THREE.CatmullRomCurve3(pts, true), segments, radius };
}

/**
 * Where a plasmid sits: out toward the envelope, in the polar thirds of an
 * elongated cell, which keeps them clear of the chromosome filling the middle.
 * Positions fan out by the golden angle so no two ever coincide, however many
 * plasmids an organism carries.
 *
 * @param ring distance from the centreline (or centre) to the plasmid's centre
 */
export function plasmidAnchor(body: CellBody, index: number, ring: number): THREE.Vector3 {
  const angle = index * 2.39996;
  if (!body.curve) {
    // Fan out over a sphere rather than stacking up in one plane.
    const z = 1 - 2 * ((index * 0.61803398875) % 1);
    const rad = Math.sqrt(Math.max(0, 1 - z * z));
    return new THREE.Vector3()
      .addScaledVector(body.ex, z * ring)
      .addScaledVector(body.ey, Math.cos(angle) * rad * ring)
      .addScaledVector(body.ez, Math.sin(angle) * rad * ring);
  }
  const side = index % 2 === 0 ? 1 : -1;
  // Past the ends of the chromosome's central stretch, so the two never tangle.
  const u = clamp(0.5 + side * (0.36 + 0.1 * ((index * 0.61803398875) % 1)), 0.08, 0.92);
  const tan = body.curve.getTangentAt(u).normalize();
  const n0 = perpendicular(tan);
  const b0 = new THREE.Vector3().crossVectors(tan, n0).normalize();
  return body.curve
    .getPointAt(u)
    .addScaledVector(n0, Math.cos(angle) * ring)
    .addScaledVector(b0, Math.sin(angle) * ring);
}

/** Centreline samples; a coccus collapses to its single centre point. */
function axisSamples(body: CellBody): THREE.Vector3[] {
  if (!body.curve) return [new THREE.Vector3()];
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= AXIS_SAMPLES; i++) pts.push(body.curve.getPointAt(i / AXIS_SAMPLES));
  return pts;
}

/**
 * Pull a point back inside the cell. The body is swept as a tube of constant
 * radius about its centreline and capped with spheres of that same radius, so
 * "within `limit` of the nearest centreline point" is exactly "inside" —
 * true however tightly the centreline bends.
 */
function clampInsideBody(
  p: THREE.Vector3,
  axis: THREE.Vector3[],
  limit: number,
): THREE.Vector3 {
  let near = axis[0];
  let dist = p.distanceTo(axis[0]);
  for (let i = 1; i < axis.length; i++) {
    const d = p.distanceTo(axis[i]);
    if (d < dist) {
      dist = d;
      near = axis[i];
    }
  }
  if (dist <= limit || dist < 1e-6) return p;
  return p.sub(near).multiplyScalar(limit / dist).add(near);
}

/** Length of a closed polyline. */
function closedLength(pts: THREE.Vector3[]): number {
  let total = 0;
  for (let i = 0; i < pts.length; i++) total += pts[i].distanceTo(pts[(i + 1) % pts.length]);
  return total;
}

/** Central-difference tangent on a closed polyline. */
function loopTangent(pts: THREE.Vector3[], i: number): THREE.Vector3 {
  const n = pts.length;
  const t = pts[(i + 1) % n].clone().sub(pts[(i - 1 + n) % n]);
  return t.lengthSq() < 1e-12 ? new THREE.Vector3(1, 0, 0) : t.normalize();
}

/**
 * A rotation-minimising frame along a closed polyline: each normal is the
 * previous one with its along-path component removed. Used to wind the supercoil
 * about the strand's own direction rather than about a fixed world axis.
 */
function transportFrames(pts: THREE.Vector3[]): {
  normals: THREE.Vector3[];
  binormals: THREE.Vector3[];
} {
  const normals: THREE.Vector3[] = [];
  const binormals: THREE.Vector3[] = [];
  let normal = perpendicular(loopTangent(pts, 0));
  for (let i = 0; i < pts.length; i++) {
    const t = loopTangent(pts, i);
    normal = normal.clone().addScaledVector(t, -normal.dot(t));
    if (normal.lengthSq() < 1e-10) normal = perpendicular(t);
    normal.normalize();
    normals.push(normal.clone());
    binormals.push(new THREE.Vector3().crossVectors(t, normal).normalize());
  }
  return { normals, binormals };
}

/** Signed twist the transported frame has picked up by the time it comes back round. */
function frameDrift(pts: THREE.Vector3[], normals: THREE.Vector3[]): number {
  const t0 = loopTangent(pts, 0);
  const back = normals[normals.length - 1].clone();
  back.addScaledVector(t0, -back.dot(t0));
  if (back.lengthSq() < 1e-10) return 0;
  back.normalize();
  const angle = Math.acos(clamp(back.dot(normals[0]), -1, 1));
  return new THREE.Vector3().crossVectors(normals[0], back).dot(t0) < 0 ? -angle : angle;
}

/** Any unit vector perpendicular to `v`. */
function perpendicular(v: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(v.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(v, ref).normalize();
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
