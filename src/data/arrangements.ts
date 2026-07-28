import type { CellArrangement } from '@/types/content';

/**
 * What each arrangement is, and the division it records.
 *
 * Held here rather than in the gallery because the 3D view needs the same
 * sentence: the gallery teaches the forms side by side, the model shows one
 * organism's own group, and both are explaining the same causal fact. The
 * gallery's board keeps its own longer copy, since it is comparing forms rather
 * than captioning one.
 */
interface ArrangementNote {
  label: string;
  why: string;
  /**
   * How many rounds of division the form records — how many differently-aimed
   * planes the 3D group draws. Chains reuse one plane however long they get;
   * a tetrad's whole point is that its second is perpendicular to its first.
   * Must agree with the layouts in `three/arrangement.ts`, which is what
   * actually generates the septa.
   */
  rounds: number;
}

export const arrangementNote: Record<CellArrangement, ArrangementNote> = {
  single: {
    label: 'Single cells',
    why: 'Daughters separate cleanly after each division, so nothing stays joined — there is no septum left to see.',
    rounds: 0,
  },
  pairs: {
    label: 'Pairs — diplo-',
    why: 'One division in one plane, and the pair goes no further.',
    rounds: 1,
  },
  tetrads: {
    label: 'Tetrads',
    why: 'Two successive divisions in perpendicular planes, giving a flat square of four.',
    rounds: 2,
  },
  chains: {
    label: 'Chains — strepto-',
    why: 'The same plane used over and over, with the daughters never separating, so the cells pay out in a line.',
    rounds: 1,
  },
  clusters: {
    label: 'Clusters — staphylo-',
    why: 'Division in several planes at once and no separation, building an irregular bunch like grapes.',
    rounds: 3,
  },
  palisades: {
    label: 'Palisades and V forms',
    why: 'Snapping division: the outer wall holds while the inner one splits, hinging each pair into a V. Repeated, the rods stack side by side like a fence — and the fence neighbours share no septum, because they were never joined there.',
    rounds: 1,
  },
  filaments: {
    label: 'Branching filaments',
    why: 'Cells stay joined end to end and branch, growing as a thread rather than as separate cells. A branch is a wall laid down across the thread instead of along it.',
    rounds: 2,
  },
};
