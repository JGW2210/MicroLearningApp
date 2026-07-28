import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { organisms } from '@/data/organisms';
import {
  INTERIOR_HEADROOM,
  buildCellBody,
  cellLayout,
  interiorRadius,
  nucleoidStrand,
  sweptRadius,
} from '@/three/body';

/**
 * The two invariants `body.ts` exists to enforce.
 *
 * Both are silent when they break. A swept layer fatter than its centreline's
 * bend does not error — it folds through itself and renders as a cell with a
 * pinched, self-intersecting wall, which looks like a lighting artefact until
 * you orbit it. A chromosome that escapes its membrane just draws DNA outside
 * the cell, which reads as a stylistic choice. Neither is the kind of thing
 * review catches reliably, and both are one authored radius away at all times,
 * so they are checked here against every organism in the registry rather than
 * by eye against whichever organism happened to be on screen.
 */

/** Samples per curve. Fine enough to resolve a five-turn helix's crests. */
const SAMPLES = 400;

/**
 * Radius of curvature at a point, as the circumradius of three neighbouring
 * samples. Exact for a circular arc and second-order accurate elsewhere;
 * collinear samples give Infinity, which is the right answer for a straight rod.
 */
function curvatureRadius(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number {
  const ab = a.distanceTo(b);
  const bc = b.distanceTo(c);
  const ca = c.distanceTo(a);
  const area = new THREE.Vector3()
    .subVectors(b, a)
    .cross(new THREE.Vector3().subVectors(c, a))
    .length() / 2;
  if (area < 1e-12) return Infinity;
  return (ab * bc * ca) / (4 * area);
}

/** The tightest bend anywhere along a body's centreline. */
function tightestBend(curve: THREE.Curve<THREE.Vector3>): number {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) pts.push(curve.getPointAt(i / SAMPLES));
  let min = Infinity;
  for (let i = 1; i < pts.length - 1; i++) {
    min = Math.min(min, curvatureRadius(pts[i - 1], pts[i], pts[i + 1]));
  }
  return min;
}

describe('swept envelope layers can turn every bend of their own centreline', () => {
  for (const organism of organisms) {
    const body = buildCellBody(organism);
    if (!body.curve) continue;

    it(`${organism.shortName} (${organism.body.kind})`, () => {
      const widest = sweptRadius(organism.structures, organism.body.radius);
      const bend = tightestBend(body.curve!);
      // A tube whose radius equals its centreline's radius of curvature is
      // exactly degenerate. Anything tighter folds through itself, so this is
      // the hard limit rather than a matter of taste.
      expect(bend).toBeGreaterThan(widest);
    });
  }
});

describe('the chromosome stays inside the membrane it lives in', () => {
  for (const organism of organisms) {
    if (!organism.structures.some((s) => s.kind === 'nucleoid')) continue;

    it(organism.shortName, () => {
      const body = buildCellBody(organism);
      const layout = cellLayout(organism.structures, body);
      const strand = nucleoidStrand(body, layout.nucleoid);
      const membrane = interiorRadius(organism.structures, body);

      // The centreline the strand has to stay within reach of. A coccus
      // collapses to its single centre point.
      const axis: THREE.Vector3[] = [];
      if (body.curve) {
        for (let i = 0; i <= SAMPLES; i++) axis.push(body.curve.getPointAt(i / SAMPLES));
      } else {
        axis.push(new THREE.Vector3());
      }

      // Sampled off the finished curve, not off its control points. The strand
      // is a Catmull-Rom through points that were individually clamped inside
      // the cell, and a Catmull-Rom is free to bulge between them — which is
      // exactly the escape route worth testing for.
      let worst = 0;
      for (let i = 0; i <= 2000; i++) {
        const p = strand.curve.getPointAt(i / 2000);
        let nearest = Infinity;
        for (const a of axis) nearest = Math.min(nearest, p.distanceTo(a));
        worst = Math.max(worst, nearest + strand.radius);
      }

      expect(layout.nucleoid).toBeLessThanOrEqual(membrane * INTERIOR_HEADROOM + 1e-9);
      // The drawn surface of the strand, not just its centreline. This is the
      // one that matters: whatever else changes, the chromosome is inside the
      // cell. Every organism currently sits between 45% and 72% of the
      // membrane, so there is real room here, not a hairline pass.
      expect(worst).toBeLessThan(membrane);

      // ...and it does fill the space it was budgeted, give or take. The strand
      // is a spline through points that were each clamped to the budget, and a
      // spline bulges between its control points: B. burgdorferi overshoots by
      // 1.6% and the rest land just under. That overshoot is absorbed by the
      // headroom above, but it should stay small — if it ever grew large, the
      // budget would have stopped meaning anything.
      expect(worst).toBeLessThan(layout.nucleoid * 1.05);
      expect(worst).toBeGreaterThan(layout.nucleoid * 0.8);
    });
  }
});
