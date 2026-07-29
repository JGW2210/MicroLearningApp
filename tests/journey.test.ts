import { describe, expect, it } from 'vitest';
import type { ResistanceType } from '@/types/content';
import { organisms } from '@/data/organisms';
import { buildCellBody, cellLayout, radialReach } from '@/three/body';
import {
  FATE_BY_RESISTANCE,
  FATE_CAPTION,
  resistanceJourney,
  successJourney,
} from '@/three/journey';

/**
 * The path a drug takes has to agree with the cell it is crossing.
 *
 * These are pictures of a claim — the enzyme meets it in the periplasm, the
 * pump throws it back out, the porin it needed is gone — and a picture that
 * disagrees with the claim is worse than no picture, because it is believed.
 * The specific risk is arithmetic: every distance is derived from radii that
 * differ per organism, so a molecule can end up stopping outside a cell it was
 * supposed to enter, or inside one it was never supposed to reach.
 */

const cases = organisms.map((organism) => {
  const body = buildCellBody(organism);
  return { organism, body, layout: cellLayout(organism.structures, body) };
});

describe('a drug that works reaches its target', () => {
  for (const { organism, layout } of cases) {
    for (const drug of organism.antibiotics) {
      it(`${organism.shortName}: ${drug.drugClass}`, () => {
        const journey = successJourney(organism, drug, layout);
        // It has to start outside the cell and end inside it, or the animation
        // is not showing an approach at all.
        expect(journey.startRadius).toBeGreaterThan(radialReach(organism.structures));
        expect(journey.stopRadius).toBeLessThan(journey.startRadius);
        expect(journey.stopRadius).toBeGreaterThan(0);
        expect(journey.color).toBe(drug.color);
      });
    }
  }
});

describe('a drug that is stopped stops in the right place', () => {
  for (const { organism, layout } of cases) {
    for (const mechanism of organism.resistance) {
      it(`${organism.shortName}: ${mechanism.name}`, () => {
        const journey = resistanceJourney(organism, mechanism, layout);
        if (!journey) {
          // Only one type declines to be drawn, and it declines on purpose.
          expect(FATE_BY_RESISTANCE[mechanism.type]).toBeNull();
          return;
        }
        expect(journey.startRadius).toBeGreaterThan(journey.stopRadius);
        expect(journey.stopRadius).toBeGreaterThan(0);
        expect(journey.caption).toBe(FATE_CAPTION[journey.fate]);

        // Blocked means blocked: it must not finish inside the cell it never
        // got into. The envelope is the outermost layer there is.
        if (journey.fate === 'blocked') {
          expect(journey.stopRadius).toBeGreaterThanOrEqual(layout.interior);
        }
        // Ejected means it got in first, and left again by the way it came.
        if (journey.fate === 'ejected') {
          expect(journey.stopRadius).toBeLessThanOrEqual(layout.interior);
          expect(journey.exitRadius).toBeGreaterThan(journey.startRadius);
        }
        // Cleaved before it binds: destroyed no deeper than the layer holding
        // the enzyme, which is where the mechanism says the enzyme is.
        if (journey.fate === 'cleaved' && mechanism.locusStructureId) {
          expect(journey.stopRadius).toBeLessThanOrEqual(layout.envelope);
        }
      });
    }
  }
});

describe('the vocabulary of endings', () => {
  it('has decided about every resistance type there is', () => {
    // `FATE_BY_RESISTANCE` is a full record, so this is really a check that no
    // type was silently given a fate that does not describe it.
    const types = new Set(organisms.flatMap((o) => o.resistance).map((r) => r.type));
    for (const type of types) {
      expect(Object.keys(FATE_BY_RESISTANCE)).toContain(type);
    }
  });

  it('gives every ending a caption', () => {
    for (const fate of Object.values(FATE_BY_RESISTANCE)) {
      if (fate) expect(FATE_CAPTION[fate]).toBeTruthy();
    }
    expect(FATE_CAPTION.docked).toBeTruthy();
  });

  it('does not animate the one type that is not about the drug getting anywhere', () => {
    // Prodrugs that are never activated, spores the drug cannot reach, a toxin
    // already doing the damage — none is a story about distance travelled.
    expect(FATE_BY_RESISTANCE['target-bypass' as ResistanceType]).toBeNull();
  });
});
