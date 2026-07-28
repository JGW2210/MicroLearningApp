import type { GramCategory, Organism } from '@/types/content';

/**
 * The stains, as protocols rather than as one hard-coded sequence.
 *
 * A Gram stain answers one question, and the app previously behaved as though
 * it were the only question — M. tuberculosis sat in it as an awkward footnote,
 * and the spore-formers had nothing to show the structure they are named for.
 * Each protocol here exists because there is something a Gram stain cannot
 * tell you, and each carries the reason you would reach for it.
 */

export type StainId = 'gram' | 'ziehl-neelsen' | 'endospore' | 'capsule';

export interface StainStep {
  id: string;
  reagent: string;
  action: string;
  detail: string;
  /** Colour the cell body takes at this step. */
  colorByCategory: Record<GramCategory, string>;
  /** Colour an endospore takes, where the protocol stains it separately. */
  sporeColor?: string;
  /** Field colour — negative stains darken the background, not the cell. */
  background?: string;
  /** Draw a clear zone around each cell (a capsule excluding the stain). */
  halo?: boolean;
}

export interface StainProtocol {
  id: StainId;
  name: string;
  short: string;
  /** What it is for, in one line. */
  purpose: string;
  /** When you would order it instead of, or as well as, a Gram stain. */
  indication: string;
  steps: StainStep[];
}

const ALL = (c: string): Record<GramCategory, string> => ({
  'gram-positive': c,
  'gram-negative': c,
  'acid-fast': c,
  'non-staining': c,
});

/* -------------------------------------------------------------------- Gram */

const GRAM: StainProtocol = {
  id: 'gram',
  name: 'Gram stain',
  short: 'Gram',
  purpose: 'Splits almost all bacteria by cell-wall architecture.',
  indication:
    'The first stain on nearly every specimen. It narrows the field in minutes and, with shape and arrangement, often decides empirical therapy before any culture grows.',
  steps: [
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
  ],
};

/* ----------------------------------------------------------- Ziehl-Neelsen */

const ZIEHL_NEELSEN: StainProtocol = {
  id: 'ziehl-neelsen',
  name: 'Ziehl-Neelsen (acid-fast)',
  short: 'Acid-fast',
  purpose: 'Finds mycobacteria, which a Gram stain effectively cannot see.',
  indication:
    'Requested whenever tuberculosis or another mycobacterial infection is suspected. A mycobacterium has a wall so waxy that Gram reagents barely enter it — it stains weakly and unreliably, so a negative Gram stain says nothing at all about TB.',
  steps: [
    {
      id: 'carbol-fuchsin',
      reagent: 'Carbol fuchsin + heat',
      action: 'Primary stain (steam 5 min)',
      detail:
        'The phenol in carbol fuchsin dissolves into the waxy wall, and heat drives it through. Heat is not incidental here — it is what gets the dye past a barrier built to keep things out. Every cell on the slide takes up the red dye.',
      colorByCategory: ALL('#c0392b'),
    },
    {
      id: 'acid-alcohol',
      reagent: 'Acid-alcohol (3% HCl in ethanol)',
      action: 'Decolourise (the defining step)',
      detail:
        'A far harsher decolouriser than the alcohol of a Gram stain. As the slide cools, the mycolic acid layer solidifies around the dye and holds it against even acid — this retention is what "acid-fast" means. Everything else on the slide gives its colour up.',
      colorByCategory: {
        'gram-positive': '#e6e7ea',
        'gram-negative': '#e6e7ea',
        'acid-fast': '#c0392b',
        'non-staining': '#e6e7ea',
      },
    },
    {
      id: 'methylene-blue',
      reagent: 'Methylene blue',
      action: 'Counterstain (1 min)',
      detail:
        'The counterstain colours everything that decolourised, so acid-fast bacilli stand out as bright red rods against a blue background of host cells and other bacteria. On a sputum smear you are hunting a handful of red rods in a blue field.',
      colorByCategory: {
        'gram-positive': '#2f6fb5',
        'gram-negative': '#2f6fb5',
        'acid-fast': '#c0392b',
        'non-staining': '#2f6fb5',
      },
    },
  ],
};

/* ------------------------------------------------------ Schaeffer-Fulton */

const ENDOSPORE: StainProtocol = {
  id: 'endospore',
  name: 'Endospore stain (Schaeffer-Fulton)',
  short: 'Endospore',
  purpose: 'Stains the spore itself, rather than leaving it as a gap.',
  indication:
    'Used to confirm and locate spores when a Gram film shows unstained gaps in Gram-positive rods. Position and swelling are identification features, so it matters whether the spore is central, subterminal or terminal.',
  steps: [
    {
      id: 'malachite',
      reagent: 'Malachite green + heat',
      action: 'Primary stain (steam 5 min)',
      detail:
        'Heat is again doing the work: steaming drives malachite green through the spore coat that keeps ordinary reagents out. Both the spore and the vegetative cell take up the green.',
      colorByCategory: ALL('#3f9d6b'),
      sporeColor: '#3f9d6b',
    },
    {
      id: 'water-wash',
      reagent: 'Water',
      action: 'Decolourise (30 s)',
      detail:
        'Plain water is enough to rinse the dye out of the vegetative cell, but the spore coat that resisted the dye going in now resists it coming out. The spore stays green; the mother cell goes colourless.',
      colorByCategory: ALL('#e6e7ea'),
      sporeColor: '#3f9d6b',
    },
    {
      id: 'safranin-spore',
      reagent: 'Safranin',
      action: 'Counterstain (1 min)',
      detail:
        'Safranin colours the now-empty vegetative cell pink, leaving green spores inside pink rods. Where the spore sits, and whether it is wide enough to distend the cell, are read off this.',
      colorByCategory: ALL('#d6547f'),
      sporeColor: '#3f9d6b',
    },
  ],
};

/* ------------------------------------------------------------ India ink */

const CAPSULE: StainProtocol = {
  id: 'capsule',
  name: 'Capsule stain (negative / India ink)',
  short: 'Capsule',
  purpose: 'Shows the capsule by staining everything except it.',
  indication:
    'A capsule is water-soluble and washes out of conventional stains, so it is demonstrated negatively. Classically used on CSF to look for Cryptococcus, and it is why a capsule can appear as a clear halo on an ordinary Gram film.',
  steps: [
    {
      id: 'ink',
      reagent: 'India ink / nigrosin',
      action: 'Negative stain (mix, no heat)',
      detail:
        'The ink is a suspension of particles too large to enter either the cell or the capsule, so it fills the background instead. Nothing is fixed and nothing is heated — heating would collapse the capsule being looked for.',
      colorByCategory: ALL('#cfd4dc'),
      background: '#20242c',
      halo: true,
    },
    {
      id: 'read',
      reagent: 'Read wet',
      action: 'Examine immediately',
      detail:
        'The capsule shows as a clear zone between the grey cell and the dark background — the capsule is the one thing on the slide that was never stained. Encapsulated cells sit in bright halos; unencapsulated ones sit directly against the ink.',
      colorByCategory: ALL('#cfd4dc'),
      background: '#20242c',
      halo: true,
    },
  ],
};

export const stainProtocols: StainProtocol[] = [GRAM, ZIEHL_NEELSEN, ENDOSPORE, CAPSULE];

export function getStain(id: StainId): StainProtocol {
  return stainProtocols.find((s) => s.id === id) ?? GRAM;
}

/**
 * Whether this stain actually tells you anything about this organism, and if
 * not, why not. Offering every stain for every organism would imply they are
 * interchangeable; the point of a stain is that it is chosen.
 */
export function stainRelevance(
  stain: StainId,
  organism: Organism,
): { informative: boolean; note: string } {
  const has = (kind: string) => organism.structures.some((s) => s.kind === kind);
  switch (stain) {
    case 'ziehl-neelsen':
      return organism.gramCategory === 'acid-fast'
        ? { informative: true, note: 'Acid-fast — retains carbol fuchsin against acid-alcohol.' }
        : {
            informative: false,
            note: 'Not acid-fast. The stain is still run to exclude mycobacteria — a blue result is a meaningful negative.',
          };
    case 'endospore':
      return has('endospore')
        ? { informative: true, note: 'Forms endospores — position and swelling are diagnostic.' }
        : { informative: false, note: 'Makes no endospores, so nothing is retained at the water wash.' };
    case 'capsule':
      return has('capsule')
        ? { informative: true, note: 'Encapsulated — the capsule appears as a clear halo.' }
        : { informative: false, note: 'No capsule, so the cell sits directly against the ink.' };
    default:
      return organism.gramCategory === 'non-staining'
        ? { informative: false, note: 'No cell wall to stain — not seen on a Gram film.' }
        : { informative: true, note: 'Wall architecture determines the result.' };
  }
}

/**
 * Colour-blind-safe substitutes for the stain palettes.
 *
 * Every one of these protocols encodes its answer in a colour contrast, and
 * three of the four use a red/green or violet/pink pair — precisely the
 * discriminations red-green colour blindness impairs, in roughly one man in
 * twelve. A stain teaching tool that rests on those pairs is unreadable to a
 * real share of its students. The safe palette re-encodes the same states along
 * blue/orange, which survives every common form, and separates them by
 * lightness as well as hue. The microscopy view additionally hatches
 * counterstained cells, so no result depends on colour alone.
 */
const COLOUR_BLIND_SAFE: Record<string, string> = {
  '#5b2a86': '#1f4fd8', // crystal violet
  '#4a2170': '#123a9e', // violet after mordanting
  '#d6547f': '#f08a24', // safranin pink
  '#c0392b': '#d1620a', // carbol fuchsin / acid-fast red
  '#d9c7a0': '#9a8f7a', // waxy, unstained by this method
  '#2f6fb5': '#1f4fd8', // methylene blue counterstain
  '#3f9d6b': '#1f4fd8', // malachite green — the hardest pair, re-cast as blue
  '#e6e7ea': '#e6e7ea', // decolourised
  '#c9ccd1': '#c9ccd1', // never stains
  '#cfd4dc': '#cfd4dc', // negative stain
};

/** The colour a cell of `category` shows at `step`, honouring the safe palette. */
export function stainColour(
  step: StainStep,
  category: GramCategory,
  colourBlindSafe: boolean,
): string {
  const base = step.colorByCategory[category];
  return colourBlindSafe ? (COLOUR_BLIND_SAFE[base] ?? base) : base;
}

/** The colour an endospore shows at `step`, or undefined to leave it a void. */
export function sporeColour(step: StainStep, colourBlindSafe: boolean): string | undefined {
  if (!step.sporeColor) return undefined;
  return colourBlindSafe ? (COLOUR_BLIND_SAFE[step.sporeColor] ?? step.sporeColor) : step.sporeColor;
}

/** True where the cell is showing a counterstain rather than the primary dye. */
export function isCounterstained(step: StainStep, category: GramCategory): boolean {
  const c = step.colorByCategory[category];
  return c === '#d6547f' || c === '#c0392b' || c === '#2f6fb5';
}
