import { describe, expect, it } from 'vitest';
import { organisms } from '@/data/organisms';
import { arrangementNote } from '@/data/arrangements';
import { buildCellBody, cellRadius, contactRadius } from '@/three/body';
import { cellGroup, type Septum } from '@/three/arrangement';

/**
 * What the arrangement layouts promise the rest of the app.
 *
 * Two of these are agreements between files that nothing else enforces. The
 * focused cell must sit at the group's origin unrotated, because the cutaway's
 * clipping plane is anchored at that cell's centre in world space and knows
 * nothing about the group — move the cell and the cut stops passing through it.
 * And `arrangementNote.rounds` drives the legend of division-plane colours in
 * the UI, so a layout that generates a third-generation septum for a form the
 * copy calls one-round produces a plane with no key entry.
 */

const cases = organisms.map((o) => {
  const body = buildCellBody(o);
  return {
    organism: o,
    body,
    girth: contactRadius(o.structures, o.body.radius),
    reach: cellRadius(o.structures, body),
  };
});

describe.each(cases.map((c) => [`${c.organism.shortName} (${c.organism.arrangement})`, c] as const))(
  '%s',
  (_name, c) => {
    const group = cellGroup(c.organism.arrangement, c.body, c.girth, c.reach);

    it('leaves the focused cell at the origin, unrotated', () => {
      const first = group.placements[0];
      expect(first.offset.length()).toBeLessThan(1e-9);
      // |w| = 1 is the identity rotation (and its negation, the same rotation).
      expect(Math.abs(first.rotation.w)).toBeGreaterThan(1 - 1e-9);
    });

    it('draws no more division rounds than the copy accounts for', () => {
      const rounds = arrangementNote[c.organism.arrangement].rounds;
      for (const septum of group.septa) {
        expect(septum.generation).toBeGreaterThanOrEqual(1);
        expect(
          septum.generation,
          `${c.organism.arrangement} septum from round ${septum.generation}, copy says ${rounds}`,
        ).toBeLessThanOrEqual(rounds);
      }
      if (rounds === 0) expect(group.septa).toHaveLength(0);
    });

    it('keeps its cells apart', () => {
      // Joined cells overlap a little so they read as joined rather than merely
      // near, but two cells occupying the same space is always a layout bug.
      const offsets = group.placements.map((p) => p.offset);
      for (let i = 0; i < offsets.length; i++) {
        for (let j = i + 1; j < offsets.length; j++) {
          expect(
            offsets[i].distanceTo(offsets[j]),
            `cells ${i} and ${j} are on top of each other`,
          ).toBeGreaterThan(c.girth);
        }
      }
    });

    it('reports a radius that actually contains the group', () => {
      // The camera trusts this number to frame the whole arrangement; if it
      // under-reports, the group is cropped at the edges of the viewport.
      for (const p of group.placements) {
        expect(p.offset.distanceTo(group.centre) + c.reach).toBeLessThanOrEqual(
          group.radius + 1e-9,
        );
      }
    });

    it('joins every septum to the cells that share it', () => {
      // A septum has to lie between two cell centres, not out in open space.
      for (const septum of group.septa) {
        const nearest = group.placements
          .map((p) => p.offset.distanceTo(septum.position))
          .sort((a, b) => a - b);
        expect(nearest[1]).toBeLessThan(c.reach * 1.6);
      }
    });
  },
);

describe('the arrangements as a set', () => {
  it('gives a single cell no septum to show', () => {
    const c = cases.find((x) => x.organism.arrangement === 'single')!;
    expect(cellGroup('single', c.body, c.girth, c.reach).septa).toHaveLength(0);
  });

  it('lays a chain down in one plane and a tetrad in two', () => {
    const c = cases.find((x) => x.organism.arrangement === 'chains')!;
    const chain = cellGroup('chains', c.body, c.girth, c.reach);
    const tetrad = cellGroup('tetrads', c.body, c.girth, c.reach);

    // How nearly parallel the least-aligned pair of septa are. Every septum of
    // a chain faces roughly the same way — that *is* what "one plane, used over
    // and over" means geometrically — while a tetrad's two rounds are
    // perpendicular, so somewhere in its septa there is a pair at right angles.
    const leastAligned = (septa: Septum[]) =>
      Math.min(
        ...septa.flatMap((a, i) =>
          septa.slice(i + 1).map((b) => Math.abs(a.normal.dot(b.normal))),
        ),
      );
    expect(leastAligned(chain.septa)).toBeGreaterThan(0.8);
    expect(leastAligned(tetrad.septa)).toBeLessThan(0.3);
  });
});
