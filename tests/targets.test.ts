import { describe, expect, it } from 'vitest';
import type { StructureKind } from '@/types/content';
import { organisms } from '@/data/organisms';

/**
 * A drug has to be drawn acting on the thing it actually acts on.
 *
 * The app's central claim is that a structure and a drug class are connected —
 * you click the wall, and the β-lactams are what strike it. `content.test.ts`
 * already checks that every `targetStructureId` resolves, but resolving is not
 * the same as being right, and the difference is invisible: the callout appears
 * on a real structure, in the right colour, with a confident label.
 *
 * It was wrong twice. Macrolides on H. influenzae and tetracyclines on
 * B. burgdorferi both pointed at the nucleoid — the chromosome — because
 * neither organism modelled its ribosomes, so the nearest internal structure
 * got the pin. Doxycycline is the *first-line* drug for Lyme disease, so the
 * most prominent thing on that cell was teaching the wrong target.
 *
 * The rule is deliberately partial: it covers the classes whose target is not
 * in dispute and says nothing about the rest.
 */

/** Drug classes whose site of action is settled, and the layer it sits in. */
const EXPECTED: { match: RegExp; kinds: StructureKind[]; why: string }[] = [
  {
    match: /macrolide|tetracyclin|aminoglycos|oxazolidinone|lincosamide|chloramphenicol/i,
    kinds: ['ribosomes'],
    why: 'these bind the 30S or 50S subunit',
  },
  {
    match: /fluoroquinolone|quinolone/i,
    kinds: ['nucleoid'],
    why: 'these trap DNA gyrase and topoisomerase IV on the chromosome',
  },
  {
    match: /β-lactam|beta-lactam|cephalosporin|carbapenem|penicillin|glycopeptide/i,
    kinds: ['peptidoglycan'],
    why: 'these block wall cross-linking',
  },
  {
    match: /polymyxin/i,
    kinds: ['lps'],
    why: 'these bind lipid A in the outer leaflet',
  },
];

describe('every drug class acts on the structure it really acts on', () => {
  for (const organism of organisms) {
    for (const drug of organism.antibiotics) {
      const rule = EXPECTED.find((r) => r.match.test(drug.drugClass));
      if (!rule) continue;
      it(`${organism.shortName}: ${drug.drugClass}`, () => {
        const target = organism.structures.find((s) => s.id === drug.targetStructureId);
        expect(target, `${drug.id} points at nothing`).toBeDefined();
        expect(
          rule.kinds,
          `${drug.drugClass} is drawn acting on the ${target!.kind}, but ${rule.why}`,
        ).toContain(target!.kind);
      });
    }
  }
});

describe('the cell carries whatever its drugs need it to have', () => {
  for (const organism of organisms) {
    it(organism.shortName, () => {
      // The failure above only became possible because the right structure was
      // missing. An organism treated with a ribosome-binding drug has to model
      // its ribosomes, or the pin has nowhere honest to go.
      for (const rule of EXPECTED) {
        if (!organism.antibiotics.some((a) => rule.match.test(a.drugClass))) continue;
        expect(
          organism.structures.map((s) => s.kind),
          `carries a drug that acts on ${rule.kinds.join('/')} but does not model it`,
        ).toEqual(expect.arrayContaining([expect.stringMatching(rule.kinds.join('|'))]));
      }
    });
  }
});
