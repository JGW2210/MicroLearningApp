import { describe, expect, it } from 'vitest';
import { organisms, getOrganism } from '@/data/organisms';
import { differences, envelopeOf, findStructure, structureFor } from '@/data/compare';
import { sharedFieldUm } from '@/three/focus';
import { buildCellBody, cellRadius, umPerUnit } from '@/three/body';

/**
 * What a comparison promises.
 *
 * Two claims here are the ones a reader will actually take away, and both are
 * derived rather than written — which is what makes them trustworthy and also
 * what makes them worth checking. That selecting a layer in one cell selects
 * the same layer in the other is the entire interaction; that one cell "has no
 * such layer" is a statement about biology that had better be true.
 */

const sa = getOrganism('staphylococcus-aureus')!;
const ec = getOrganism('escherichia-coli')!;

describe('a selection carries between two cells', () => {
  it('resolves an organism\'s own structure by id', () => {
    const wall = sa.structures.find((s) => s.kind === 'peptidoglycan')!;
    expect(structureFor(sa, wall.id)?.id).toBe(wall.id);
  });

  it('resolves the other cell\'s equivalent layer by kind', () => {
    // Ids are namespaced per organism, so nothing carries across on its own.
    const wall = sa.structures.find((s) => s.kind === 'peptidoglycan')!;
    const counterpart = structureFor(ec, wall.id);
    expect(counterpart).toBeDefined();
    expect(counterpart!.kind).toBe('peptidoglycan');
    expect(counterpart!.id).not.toBe(wall.id);
  });

  it('resolves to nothing when the other cell has no such layer', () => {
    const outer = ec.structures.find((s) => s.kind === 'outer-membrane')!;
    expect(structureFor(sa, outer.id)).toBeUndefined();
  });

  it('finds any structure id in the registry, and rejects one that is not there', () => {
    const wall = sa.structures.find((s) => s.kind === 'peptidoglycan')!;
    expect(findStructure(wall.id)?.organism.id).toBe(sa.id);
    expect(findStructure('no-such-structure')).toBeNull();
    expect(findStructure(null)).toBeNull();
  });
});

describe('the differences it reports are differences', () => {
  it('names the envelope architecture that actually differs', () => {
    const diff = differences(sa, ec);
    const kinds = (list: typeof diff.onlyInA) => list.map((s) => s.kind);
    // The whole reason these two take different drugs.
    expect(kinds(diff.onlyInB)).toContain('outer-membrane');
    expect(kinds(diff.onlyInB)).toContain('lps');
    expect(kinds(diff.onlyInA)).toContain('teichoic-acid');
  });

  it('never claims a bacterium lacks a cytoplasm, ribosomes or a chromosome', () => {
    // These are absent from some models and from no organisms. The first run of
    // this comparison announced that E. coli has no ribosomes.
    for (const a of organisms) {
      for (const b of organisms) {
        if (a === b) continue;
        const said = [...differences(a, b).onlyInA, ...differences(a, b).onlyInB];
        for (const s of said) {
          expect(['cytoplasm', 'ribosomes', 'nucleoid']).not.toContain(s.kind);
        }
      }
    }
  });

  it('is symmetric', () => {
    const forward = differences(sa, ec);
    const back = differences(ec, sa);
    expect(forward.onlyInA.map((s) => s.kind).sort()).toEqual(
      back.onlyInB.map((s) => s.kind).sort(),
    );
  });

  it('gives every organism an envelope to list', () => {
    for (const organism of organisms) {
      expect(envelopeOf(organism).length).toBeGreaterThan(0);
    }
  });
});

describe('both cells are framed to the same real width', () => {
  it('takes the field from whichever cell is larger', () => {
    const realRadius = (o: typeof sa) => {
      const body = buildCellBody(o);
      return cellRadius(o.structures, body) * umPerUnit(body, o.body.sizeUm) * 1.12;
    };
    expect(sharedFieldUm(sa, ec)).toBeCloseTo(Math.max(realRadius(sa), realRadius(ec)), 6);
    // ...so the larger organism is the one that fits exactly, and the smaller
    // one is left looking smaller, which is the point.
    expect(sharedFieldUm(sa, ec)).toBeGreaterThan(realRadius(sa));
  });

  it('holds a real difference in size between any pair', () => {
    // A shared field is only worth having if it actually separates them.
    const field = sharedFieldUm(sa, ec);
    const apparent = (o: typeof sa) => {
      const body = buildCellBody(o);
      return (cellRadius(o.structures, body) * umPerUnit(body, o.body.sizeUm)) / field;
    };
    expect(apparent(ec)).toBeGreaterThan(apparent(sa) * 1.2);
  });
});
