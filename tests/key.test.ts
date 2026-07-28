import { describe, expect, it } from 'vitest';
import { organisms } from '@/data/organisms';
import { bestAttribute, optionsFor, NA_VALUE } from '@/data/key';
import type { Organism } from '@/types/content';

/**
 * Every organism has to be reachable through the key.
 *
 * The key is derived from the organism data rather than authored, so it cannot
 * contradict that data — but it can still fail to *separate* it. Two organisms
 * that answer every available observation identically are indistinguishable to
 * the key no matter how it branches, and the failure mode is quiet: the key runs
 * out of questions and offers a shortlist as though that were the answer. That
 * becomes more likely with every organism added, which is exactly when nobody is
 * looking at the key.
 */

/** Walk the key the way a student would, answering as this organism. */
function identify(target: Organism): { remaining: Organism[]; steps: number } {
  let candidates = organisms;
  const used = new Set<string>();
  let steps = 0;

  while (candidates.length > 1) {
    const attr = bestAttribute(candidates, used);
    // No observation left that separates what remains.
    if (!attr) break;
    used.add(attr.id);
    const answer = attr.read(target) ?? NA_VALUE;
    const option = optionsFor(candidates, attr).find((o) => o.value === answer);
    // The organism's own answer must be one the key offers — if it is not, the
    // key and the data have come apart.
    expect(option, `${target.shortName}: no option for its own answer to ${attr.id}`).toBeTruthy();
    candidates = option!.remaining;
    steps++;
  }
  return { remaining: candidates, steps };
}

describe('the identification key resolves every organism uniquely', () => {
  for (const organism of organisms) {
    it(organism.shortName, () => {
      const { remaining, steps } = identify(organism);
      expect(remaining.map((o) => o.id)).toEqual([organism.id]);
      // A key that needs to ask about every observation it has is not a key.
      expect(steps).toBeLessThanOrEqual(6);
    });
  }
});

describe('the key asks useful questions', () => {
  it('never opens with an observation almost nobody answers', () => {
    const first = bestAttribute(organisms, new Set());
    expect(first).toBeTruthy();
    const answered = organisms.filter((o) => first!.read(o) !== null).length;
    // Coagulase is the cautionary case: sixteen of seventeen organisms have no
    // result at all, so opening with it eliminates nothing.
    expect(answered).toBeGreaterThan(organisms.length / 2);
  });

  it('splits the field rather than shaving one organism off it', () => {
    const first = bestAttribute(organisms, new Set());
    const worst = Math.max(...optionsFor(organisms, first!).map((o) => o.remaining.length));
    expect(worst).toBeLessThan(organisms.length * 0.6);
  });
});
