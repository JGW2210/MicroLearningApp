import { useState } from 'react';
import type { CellArrangement, MorphologyKind } from '@/types/content';
import { organisms } from '@/data/organisms';
import { MicroscopyField } from './MicroscopyField';

/**
 * Arrangement as a subject in its own right.
 *
 * Met one organism at a time, arrangement looks like a label attached to a
 * species. Side by side it is a short causal story instead: every form on this
 * board follows from which plane the cell divided in and whether the daughters
 * came apart, which is why the naming (diplo-, strepto-, staphylo-) describes
 * geometry rather than taxonomy.
 */
interface Entry {
  arrangement: CellArrangement;
  kind: MorphologyKind;
  title: string;
  why: string;
  examples: string;
}

const BOARD: Entry[] = [
  {
    arrangement: 'single',
    kind: 'bacillus',
    title: 'Single cells',
    why: 'Daughter cells separate cleanly after each division, so nothing stays joined.',
    examples: 'Most Gram-negative rods — E. coli, Salmonella, Pseudomonas',
  },
  {
    arrangement: 'pairs',
    kind: 'coccus',
    title: 'Diplococci',
    why: 'Division in a single plane, with the pair staying together but going no further.',
    examples: 'Neisseria (kidney-bean pairs), S. pneumoniae (lancet-shaped)',
  },
  {
    arrangement: 'tetrads',
    kind: 'coccus',
    title: 'Tetrads',
    why: 'Two successive divisions in perpendicular planes, giving a flat square of four.',
    examples: 'Micrococcus luteus, Aerococcus',
  },
  {
    arrangement: 'chains',
    kind: 'coccus',
    title: 'Streptococci — chains',
    why: 'Division in one plane over and over, and the daughters never separate, so the cells pay out in a line.',
    examples: 'S. pyogenes, S. agalactiae, Enterococcus',
  },
  {
    arrangement: 'clusters',
    kind: 'coccus',
    title: 'Staphylococci — clusters',
    why: 'Division in several planes at once with no separation, building an irregular bunch like grapes.',
    examples: 'S. aureus, S. epidermidis',
  },
  {
    arrangement: 'palisades',
    kind: 'bacillus',
    title: 'Palisades and V forms',
    why: 'Snapping division: the outer wall layer holds while the inner one splits, hinging the pair into a V or L. Repeated, the rods stack side by side like a fence.',
    examples: 'Corynebacterium diphtheriae, Listeria, Mycobacterium cords',
  },
  {
    arrangement: 'chains',
    kind: 'bacillus',
    title: 'Streptobacilli — rod chains',
    why: 'The same single-plane division as streptococci, in a rod — worth seeing beside the coccal chain, since arrangement and shape are read separately.',
    examples: 'Bacillus anthracis, Streptobacillus',
  },
  {
    arrangement: 'filaments',
    kind: 'bacillus',
    title: 'Branching filaments',
    why: 'Cells stay joined end to end and branch, growing as a mycelium-like thread rather than as separate cells.',
    examples: 'Actinomyces israelii, Nocardia',
  },
];

/** Cells drawn in a neutral stain so the shapes, not the colours, do the work. */
const NEUTRAL = '#6f7bdd';

export function ArrangementGallery() {
  const [open, setOpen] = useState<number | null>(null);
  // Which of these the app can currently show on a real organism.
  const covered = new Set(organisms.map((o) => o.arrangement));

  return (
    <div className="panel-block">
      <h3>Arrangements under the microscope</h3>
      <div className="sub">
        How cells group is set by the plane they divide in and whether the daughters
        come apart — which is why it is read off a slide alongside shape and stain.
      </div>

      <div className="arr-grid">
        {BOARD.map((e, i) => (
          <button
            key={i}
            className={`arr-card ${open === i ? 'active' : ''}`}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <MicroscopyField
              kind={e.kind}
              arrangement={e.arrangement}
              color={NEUTRAL}
              cellUm={e.kind === 'coccus' ? 1 : 2.5}
              size={126}
            />
            <span className="arr-title">{e.title}</span>
            {!covered.has(e.arrangement) && <span className="arr-tag">no example yet</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="callout">
          <span className="k">{BOARD[open].title}</span>
          {BOARD[open].why}
          <div className="sub" style={{ marginTop: 6 }}>
            <strong>Seen in:</strong> {BOARD[open].examples}
          </div>
        </div>
      )}
    </div>
  );
}
