import { describe, expect, it } from 'vitest';
import { organisms } from '@/data/organisms';
import { quizzable } from '@/data/quiz';
import { defaultRadius } from '@/three/geometry';
import { outsideIn } from '@/components/StructureListbox';

/**
 * Keyboard parity with the pointer.
 *
 * The model is picked with a mouse by aiming at it and with a keyboard by
 * walking an ordered list of the same structures. Those two routes are built
 * from different code and have no reason to agree unless something makes them,
 * and the failure is quiet in the worst way: a structure that is clickable but
 * missing from the list is simply unreachable without a mouse, which nobody
 * testing with a mouse will ever notice. During a run it is worse than
 * unreachable — it is an unanswerable question.
 */
describe.each(organisms.map((o) => [o.shortName, o] as const))('%s', (_name, organism) => {
  const order = outsideIn(organism.structures);

  it('offers the keyboard exactly what the pointer can select', () => {
    expect([...order].map((s) => s.id).sort()).toEqual(
      quizzable(organism)
        .map((s) => s.id)
        .sort(),
    );
  });

  it('walks the cell from the outside in', () => {
    const radii = order.map((s) => s.geometry?.radius ?? defaultRadius[s.kind]);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i], `${order[i].id} is not inside ${order[i - 1].id}`).toBeLessThanOrEqual(
        radii[i - 1],
      );
    }
  });

  it('starts at the surface', () => {
    // The first thing a keyboard user meets should be the outermost layer, not
    // whichever structure happens to be first in the authored array.
    const widest = Math.max(
      ...organism.structures.map((s) => s.geometry?.radius ?? defaultRadius[s.kind]),
    );
    expect(order[0].geometry?.radius ?? defaultRadius[order[0].kind]).toBe(widest);
  });
});
