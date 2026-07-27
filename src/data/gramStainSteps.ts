import type { GramStainStep } from '@/types/content';

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
