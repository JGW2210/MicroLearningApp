import type {
  AntibioticTarget,
  Organism,
  ResistanceMechanism,
  ResistanceType,
} from '@/types/content';
import { defaultRadius } from './geometry';
import { radialReach, type CellLayout } from './body';

/**
 * What happens to a molecule of the drug.
 *
 * Every resistance mechanism in the data is, underneath, a statement about how
 * far a drug gets and what stops it there — the enzyme meets it in the
 * periplasm, the pump throws it back out, the porin it needed is gone, the
 * target it reached will no longer hold it. Those are different *places* and
 * different *endings*, and they are the part of resistance that a paragraph
 * conveys poorly and a path conveys immediately.
 *
 * So the animation is derived from the mechanism rather than drawn per
 * organism: the type decides the ending, the locus decides where, and the
 * envelope the organism actually has decides the distances. Nothing here is
 * authored twice, and a new mechanism animates correctly the moment it is
 * written.
 *
 * The animation is not asked to carry the whole explanation. The panel beside
 * it already gives the gene, the mechanism and the clinical impact; this says
 * only *where the drug got to and what became of it*, which is the part the
 * prose is worst at.
 */

export type Fate =
  /** Reaches its target and stays. What working looks like. */
  | 'docked'
  /** Destroyed on the way in. */
  | 'cleaved'
  /** Gets in, and is carried straight back out. */
  | 'ejected'
  /** Never crosses the envelope at all. */
  | 'blocked'
  /** Arrives, and cannot hold on. */
  | 'unbound'
  /** Arrives where the target would be, and finds nothing. */
  | 'absent';

/**
 * Which ending each mechanism produces — and, for one type, that it has none.
 *
 * `target-bypass` is deliberately not animated. In this data it covers a prodrug
 * that is never switched on, a spore the drug cannot reach because the cell is
 * dormant, and a toxin that is already doing the damage — none of which is a
 * story about how far the drug travelled. Drawing it as though it were would be
 * inventing a mechanism to have something to show, which is worse than showing
 * nothing and saying why.
 *
 * Typed as a full record so that adding a resistance type is a compile error
 * until someone has decided what it looks like.
 */
export const FATE_BY_RESISTANCE: Record<ResistanceType, Fate | null> = {
  'enzymatic-inactivation': 'cleaved',
  efflux: 'ejected',
  'porin-loss': 'blocked',
  'reduced-permeability': 'blocked',
  'target-modification': 'unbound',
  intrinsic: 'absent',
  'target-bypass': null,
};

/** One line saying what is being watched. */
export const FATE_CAPTION: Record<Fate, string> = {
  docked: 'The drug crosses the envelope, reaches its target and stays there. This is what working looks like.',
  cleaved: 'The drug is broken apart before it ever reaches its target.',
  ejected: 'The drug gets in, and is carried straight back out.',
  blocked: 'The drug cannot cross the envelope, so what it would have bound never sees it.',
  unbound: 'The drug arrives at its target and cannot hold on to it.',
  absent: 'The drug arrives where its target should be and finds nothing to bind.',
};

export interface Journey {
  fate: Fate;
  /** Colour of the drug being followed. */
  color: string;
  /** Where a molecule starts, well clear of the cell. */
  startRadius: number;
  /** Where its journey ends. */
  stopRadius: number;
  /** How far back out it is carried — `ejected` only. */
  exitRadius: number;
  caption: string;
}

/** Radius a structure is drawn at, or the layer's default. */
function radiusOf(organism: Organism, structureId: string | undefined): number | null {
  if (!structureId) return null;
  const structure = organism.structures.find((s) => s.id === structureId);
  return structure ? (structure.geometry?.radius ?? defaultRadius[structure.kind]) : null;
}

/** A drug getting through: the control case, and the contrast the rest need. */
export function successJourney(
  organism: Organism,
  drug: AntibioticTarget,
  layout: CellLayout,
): Journey {
  const outside = radialReach(organism.structures) * 1.55;
  return {
    fate: 'docked',
    color: drug.color,
    startRadius: outside,
    stopRadius: radiusOf(organism, drug.targetStructureId) ?? layout.interior * 0.6,
    exitRadius: outside,
    caption: FATE_CAPTION.docked,
  };
}

/**
 * A drug being stopped.
 *
 * Returns null where the mechanism is not about the drug's route — see
 * `FATE_BY_RESISTANCE` — so the caller can say so rather than draw something
 * that is not true.
 */
export function resistanceJourney(
  organism: Organism,
  mechanism: ResistanceMechanism,
  layout: CellLayout,
): Journey | null {
  const fate = FATE_BY_RESISTANCE[mechanism.type];
  if (!fate) return null;

  const drug = organism.antibiotics.find((a) => mechanism.defeatsDrugIds.includes(a.id));
  const outside = radialReach(organism.structures) * 1.55;
  const locus = radiusOf(organism, mechanism.locusStructureId);
  const target = radiusOf(organism, drug?.targetStructureId);

  const stopRadius = (() => {
    switch (fate) {
      // Where the enzyme is. For a periplasmic β-lactamase that is the wall
      // itself, which is right: it is destroyed at the very layer it came for.
      case 'cleaved':
        return locus ?? target ?? layout.envelope;
      // Past the envelope and back — the pump spans the membrane it sits in.
      case 'ejected':
        return Math.min(locus ?? layout.interior, layout.interior);
      // Stopped at the outermost layer it cannot get through.
      case 'blocked':
        return locus ?? layout.envelope;
      case 'unbound':
        return target ?? locus ?? layout.interior * 0.6;
      // Nothing to stop at: it carries on into a cell that has no such target.
      case 'absent':
        return layout.interior * 0.12;
      default:
        return layout.interior;
    }
  })();

  return {
    fate,
    // Coloured as the drug it defeats, so what is being watched is unambiguous.
    // Some intrinsic entries name no drug at all, which is the point of them.
    color: drug?.color ?? '#9fb0cc',
    startRadius: outside,
    stopRadius,
    exitRadius: outside * 1.25,
    caption: FATE_CAPTION[fate],
  };
}
