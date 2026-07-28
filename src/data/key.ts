import type { Organism } from '@/types/content';
import { HAEMOLYSIS_INFO, testDefinitions } from './tests';

/**
 * An identification key, derived rather than authored.
 *
 * A printed dichotomous key is a fixed tree someone decided on in advance. That
 * hides the thing worth learning: which test to reach for depends on what is
 * still on the table. Catalase is the obvious first move among Gram-positive
 * cocci and a waste of a plate once you already know you have a Vibrio.
 *
 * So the key here computes its next question each time, choosing whichever
 * observation splits the remaining candidates most evenly. It can never
 * contradict the organism data because it is read from it, and it demonstrates
 * the reasoning — that a good test is one whose answer you cannot guess.
 */

export interface KeyAttribute {
  id: string;
  question: string;
  /** This organism's answer, or null where the observation does not apply. */
  read: (o: Organism) => string | null;
  /** Human-readable form of an answer. */
  label: (value: string) => string;
}

const NOT_APPLICABLE = '__na__';

const GRAM_LABEL: Record<string, string> = {
  'gram-positive': 'Gram-positive (purple)',
  'gram-negative': 'Gram-negative (pink)',
  'acid-fast': 'Acid-fast (ghost on Gram)',
  'non-staining': 'Not seen on Gram',
};

const SHAPE_LABEL: Record<string, string> = {
  coccus: 'Cocci (round)',
  bacillus: 'Bacilli (rods)',
  coccobacillus: 'Coccobacilli',
  vibrio: 'Curved rods (comma)',
  spirillum: 'Helical rods',
  spirochete: 'Spirochaetes',
  'club-rod': 'Club-shaped rods',
  filament: 'Branching filaments',
};

const ARRANGEMENT_LABEL: Record<string, string> = {
  single: 'Singly',
  pairs: 'In pairs',
  tetrads: 'In tetrads',
  chains: 'In chains',
  clusters: 'In clusters',
  palisades: 'Palisades / V forms',
  filaments: 'Branching filaments',
};

export const keyAttributes: KeyAttribute[] = [
  {
    id: 'gram',
    question: 'What does the Gram stain show?',
    read: (o) => o.gramCategory,
    label: (v) => GRAM_LABEL[v] ?? v,
  },
  {
    id: 'shape',
    question: 'What shape are the cells?',
    read: (o) => o.body.kind,
    label: (v) => SHAPE_LABEL[v] ?? v,
  },
  {
    id: 'arrangement',
    question: 'How are the cells arranged?',
    read: (o) => o.arrangement,
    label: (v) => ARRANGEMENT_LABEL[v] ?? v,
  },
  {
    id: 'haemolysis',
    question: 'What haemolysis is seen on blood agar?',
    read: (o) => (o.haemolysis === 'not-applicable' ? null : o.haemolysis),
    label: (v) => (v === NOT_APPLICABLE ? 'Not grown on blood agar' : HAEMOLYSIS_INFO[v as 'alpha'].label),
  },
  {
    id: 'spores',
    question: 'Does it form endospores?',
    read: (o) => (o.structures.some((s) => s.kind === 'endospore') ? 'yes' : 'no'),
    label: (v) => (v === 'yes' ? 'Forms endospores' : 'No endospores'),
  },
  ...testDefinitions.map(
    (t): KeyAttribute => ({
      id: `test:${t.id}`,
      question: `${t.name}: ${t.question}`,
      read: (o) => {
        const r = o.tests[t.id];
        return !r || r === 'not-applicable' ? null : r;
      },
      label: (v) =>
        v === NOT_APPLICABLE
          ? 'Not done / not applicable'
          : v === 'positive'
            ? `${t.name} positive`
            : v === 'negative'
              ? `${t.name} negative`
              : `${t.name} variable`,
    }),
  ),
];

/** Group candidates by their answer to `attr`. */
export function partition(candidates: Organism[], attr: KeyAttribute): Map<string, Organism[]> {
  const out = new Map<string, Organism[]>();
  for (const o of candidates) {
    const v = attr.read(o) ?? NOT_APPLICABLE;
    const bucket = out.get(v);
    if (bucket) bucket.push(o);
    else out.set(v, [o]);
  }
  return out;
}

/**
 * The observation worth making next: the one whose largest possible outcome
 * leaves the fewest candidates standing.
 *
 * This is why the key never opens with coagulase. Sixteen of seventeen
 * organisms have no coagulase result at all, so the answer is a foregone
 * conclusion and nothing is eliminated — it only becomes the decisive test
 * once staphylococci are all that remain.
 */
export function bestAttribute(candidates: Organism[], used: Set<string>): KeyAttribute | null {
  let best: { attr: KeyAttribute; worst: number } | null = null;
  for (const attr of keyAttributes) {
    if (used.has(attr.id)) continue;
    const groups = partition(candidates, attr);
    // An observation everyone answers the same way tells you nothing.
    if (groups.size < 2) continue;
    const worst = Math.max(...[...groups.values()].map((g) => g.length));
    if (!best || worst < best.worst) best = { attr, worst };
  }
  return best?.attr ?? null;
}

/** Answers actually available for `attr`, each with what it would leave. */
export function optionsFor(
  candidates: Organism[],
  attr: KeyAttribute,
): { value: string; label: string; remaining: Organism[] }[] {
  return [...partition(candidates, attr).entries()]
    .map(([value, remaining]) => ({ value, label: attr.label(value), remaining }))
    .sort((a, b) => b.remaining.length - a.remaining.length);
}

export const NA_VALUE = NOT_APPLICABLE;
