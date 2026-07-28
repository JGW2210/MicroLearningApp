import { describe, expect, it } from 'vitest';
import { organisms } from '@/data/organisms';
import { defaultRadius, isShell } from '@/three/geometry';
import { testDefinitions } from '@/data/tests';
import { arrangementNote } from '@/data/arrangements';

/**
 * The cross-references that hold an organism together.
 *
 * Adding an organism is deliberately data entry with no rendering code to
 * change, and the cost of that is that the ids tying the pieces together —
 * a drug to the structure it acts on, a resistance mechanism to the drugs it
 * defeats, a structure back to the drugs that target it — are just strings. A
 * typo in one produces no error: the drug simply stops appearing in the panel
 * that would have listed it, or the overlay quietly highlights nothing. These
 * are the checks that would otherwise have to be done by clicking through every
 * organism in every mode.
 */

const testIds = new Set(testDefinitions.map((t) => t.id));

describe.each(organisms.map((o) => [o.shortName, o] as const))('%s', (_name, organism) => {
  const structureIds = new Set(organism.structures.map((s) => s.id));
  const drugIds = new Set(organism.antibiotics.map((a) => a.id));

  it('has unique ids within each collection', () => {
    for (const [label, ids] of [
      ['structures', organism.structures.map((s) => s.id)],
      ['antibiotics', organism.antibiotics.map((a) => a.id)],
      ['resistance', organism.resistance.map((r) => r.id)],
      ['genomics', organism.genomics.map((g) => g.id)],
    ] as const) {
      expect(new Set(ids).size, `duplicate ${label} id`).toBe(ids.length);
    }
  });

  it('points every antibiotic at a structure it actually has', () => {
    for (const drug of organism.antibiotics) {
      expect(structureIds, `${drug.id} → ${drug.targetStructureId}`).toContain(
        drug.targetStructureId,
      );
    }
  });

  it('points every resistance mechanism at real drugs and a real locus', () => {
    for (const r of organism.resistance) {
      for (const id of r.defeatsDrugIds) {
        expect(drugIds, `${r.id} defeats ${id}`).toContain(id);
      }
      if (r.locusStructureId) {
        expect(structureIds, `${r.id} locus ${r.locusStructureId}`).toContain(r.locusStructureId);
      }
    }
  });

  it('cross-links structures back to drugs that exist', () => {
    for (const s of organism.structures) {
      for (const id of s.drugTargetIds ?? []) {
        expect(drugIds, `${s.id} → ${id}`).toContain(id);
      }
    }
  });

  it('records only tests the bench actually defines', () => {
    for (const id of Object.keys(organism.tests)) {
      expect(testIds, `unknown test ${id}`).toContain(id);
    }
  });

  it('has an envelope to render', () => {
    // Without at least one shell there is no cell body: the organism would
    // appear in every picker and render as an empty scene.
    expect(organism.structures.some((s) => isShell(s.kind))).toBe(true);
  });

  it('nests its envelope layers outermost-first by radius', () => {
    // Not a rendering requirement — the shells are drawn at whatever radius they
    // declare — but a wall wider than the capsule over it is always a data
    // error, and it shows up as a layer poking through the one outside it.
    const order = ['capsule', 'lps', 'outer-membrane', 'mycolic-acid', 'peptidoglycan', 'cell-membrane', 'cytoplasm'];
    const shells = organism.structures
      .filter((s) => isShell(s.kind))
      .map((s) => ({ kind: s.kind, r: s.geometry?.radius ?? defaultRadius[s.kind] }))
      .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
    for (let i = 1; i < shells.length; i++) {
      expect(
        shells[i].r,
        `${shells[i].kind} (${shells[i].r}) is not inside ${shells[i - 1].kind} (${shells[i - 1].r})`,
      ).toBeLessThan(shells[i - 1].r);
    }
  });

  it('describes an arrangement the 3D view knows how to lay out', () => {
    expect(arrangementNote[organism.arrangement]).toBeTruthy();
  });
});

describe('the registry', () => {
  it('has no duplicate organism ids', () => {
    const ids = organisms.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every Gram category with at least one example', () => {
    for (const category of ['gram-positive', 'gram-negative', 'acid-fast', 'non-staining']) {
      expect(
        organisms.some((o) => o.gramCategory === category),
        `no example of ${category}`,
      ).toBe(true);
    }
  });
});
