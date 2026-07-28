import type { GramCategory, GramStainStep } from '@/types/content';

/**
 * Colour-blind-safe substitutes for the stain palette.
 *
 * The whole module turns on telling violet from pink, which is the very
 * discrimination red-green colour blindness impairs — it affects roughly one man
 * in twelve, so a stain teaching tool that encodes its answer in that one
 * contrast is unreadable to a real share of its students. The safe palette
 * re-encodes the same states along blue/orange, which survives every common
 * form, and separates them by lightness as well as hue. The microscopy view
 * additionally hatches counterstained cells, so the result never rests on
 * colour alone.
 *
 * Keyed by the palette entry it replaces, so the steps stay the single source
 * of truth for what happens at each reagent.
 */
const COLOUR_BLIND_SAFE: Record<string, string> = {
  '#5b2a86': '#1f4fd8', // crystal violet — deep blue
  '#4a2170': '#123a9e', // violet after mordanting — darker blue
  '#d6547f': '#f08a24', // safranin pink — orange
  '#c0392b': '#d1620a', // acid-fast red — deep orange
  '#d9c7a0': '#9a8f7a', // waxy, unstained by this method
  '#e6e7ea': '#e6e7ea', // decolourised — colourless either way
  '#c9ccd1': '#c9ccd1', // never stains
};

/** The colour a cell of `category` shows at `step`, honouring the safe palette. */
export function stainColour(
  step: GramStainStep,
  category: GramCategory,
  colourBlindSafe: boolean,
): string {
  const base = step.colorByCategory[category];
  return colourBlindSafe ? (COLOUR_BLIND_SAFE[base] ?? base) : base;
}

/** True where the cell is showing the counterstain rather than the primary dye. */
export function isCounterstained(step: GramStainStep, category: GramCategory): boolean {
  const c = step.colorByCategory[category];
  return c === '#d6547f' || c === '#c0392b';
}

/**
 * The interactive Gram-stain walkthrough. Each step carries the colour a generic
 * cell should take on for every category, so the walkthrough can animate why the
 * four categories diverge at the decolourisation step.
 */
export const gramStainSteps: GramStainStep[] = [
  {
    id: 'crystal-violet',
    reagent: 'Crystal violet',
    action: 'Primary stain (1 min)',
    detail:
      'All cells take up the purple primary dye. At this point every category looks the same — deep violet.',
    colorByCategory: {
      'gram-positive': '#5b2a86',
      'gram-negative': '#5b2a86',
      'acid-fast': '#5b2a86',
      'non-staining': '#c9ccd1',
    },
  },
  {
    id: 'iodine',
    reagent: "Gram's iodine",
    action: 'Mordant (1 min)',
    detail:
      'Iodine forms a large crystal violet–iodine (CV-I) complex inside the cell that is harder to wash out. Still uniformly purple.',
    colorByCategory: {
      'gram-positive': '#4a2170',
      'gram-negative': '#4a2170',
      'acid-fast': '#4a2170',
      'non-staining': '#c9ccd1',
    },
  },
  {
    id: 'decolouriser',
    reagent: 'Alcohol / acetone',
    action: 'Decolourise (seconds — the critical step)',
    detail:
      'The decisive step. Thick Gram-positive walls dehydrate and trap the CV-I complex (stay purple). Gram-negative thin walls + dissolved outer membrane let the complex wash out (go colourless). Acid-fast waxy walls are stained by a different method entirely.',
    colorByCategory: {
      'gram-positive': '#4a2170',
      'gram-negative': '#e6e7ea',
      'acid-fast': '#d9c7a0',
      'non-staining': '#c9ccd1',
    },
  },
  {
    id: 'safranin',
    reagent: 'Safranin',
    action: 'Counterstain (1 min)',
    detail:
      'The pink counterstain colours whatever lost the primary dye. Gram-positive cells remain purple; Gram-negative cells now appear pink-red. Wall-less organisms show nothing.',
    colorByCategory: {
      'gram-positive': '#5b2a86',
      'gram-negative': '#d6547f',
      'acid-fast': '#c0392b',
      'non-staining': '#c9ccd1',
    },
  },
];
