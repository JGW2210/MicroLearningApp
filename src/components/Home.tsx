import { Suspense, lazy, useEffect, useState } from 'react';
import { useStore } from '@/state/store';

/**
 * The hero is the only 3D on this page, and it is decoration: it explains
 * nothing the copy beside it does not. Loading it eagerly meant the headline,
 * the counts and the two module cards all waited on three.js before any of
 * them appeared. Split out, the page is readable immediately and the cell
 * fades in behind it.
 */
const HeroCell = lazy(() => import('./HeroCell').then((m) => ({ default: m.HeroCell })));

export function Home() {
  const goToModule = useStore((s) => s.goToModule);
  const selectOrganism = useStore((s) => s.selectOrganism);

  /**
   * The organism count, fetched rather than imported.
   *
   * Importing the registry here to read `.length` pulled all seventeen
   * organisms — every description, mechanism and clinical note — into the entry
   * bundle: 134 kB to render one decorative chip. Counting them after paint
   * costs a chunk that is being fetched for the hero anyway, and keeps the
   * number derived from the data rather than duplicated beside it, where it
   * would quietly go stale the first time an organism was added.
   */
  const [organismCount, setOrganismCount] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    void import('@/data/organisms').then((m) => {
      if (live) setOrganismCount(m.organisms.length);
    });
    return () => {
      live = false;
    };
  }, []);

  const openStructure = () => {
    selectOrganism('staphylococcus-aureus');
    goToModule('structure');
  };
  const openGram = () => {
    selectOrganism('staphylococcus-aureus');
    goToModule('gram');
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Learn microbiology by <span className="grad">taking cells apart</span>
          </h1>
          <p>
            An interactive, three.js-powered atlas of clinically important pathogens. Rotate a cell,
            click any structure to zoom in, and follow the thread from wall architecture to antibiotic
            target to resistance gene and treatment.
          </p>
          <div className="feature-line">
            <span className="chip">
              <span className="swatch" style={{ background: '#3ddc97' }} /> {organismCount ?? '\u2013\u2013'} organisms
            </span>
            <span className="chip">
              <span className="swatch" style={{ background: '#6ea8fe' }} /> Antibiotic targeting
            </span>
            <span className="chip">
              <span className="swatch" style={{ background: '#ff6b6b' }} /> Resistance &amp; genomics
            </span>
          </div>
        </div>
        <div className="hero-canvas">
          {/* No spinner: a placeholder that holds the shape of what is coming
              reads as loading, where a spinner reads as waiting. */}
          <Suspense fallback={<div className="hero-canvas-pending" aria-hidden />}>
            <HeroCell organismId="staphylococcus-aureus" />
          </Suspense>
        </div>
      </section>

      <div className="module-grid">
        <button className="module-card" onClick={openStructure}>
          <div className="icon">🧫</div>
          <h3>Bacterial Structure &amp; Morphology</h3>
          <p>
            Explore the cell envelope of pathogenic bacteria in 3D. See how cell-wall architecture
            differs across organisms, overlay where each antibiotic class strikes, and reveal the
            resistance mechanisms and genomic variations that change treatment.
          </p>
          <div className="arrow">Open explorer →</div>
        </button>

        <button className="module-card" onClick={openGram}>
          <div className="icon">🔬</div>
          <h3>Gram Staining &amp; Appearance</h3>
          <p>
            Walk through the Gram stain reagent by reagent and see why organisms end up purple, pink,
            acid-fast red, or invisible. Compare the interactive cell with how each species looks on
            the agar media used to identify it.
          </p>
          <div className="arrow">Open stain lab →</div>
        </button>
      </div>
    </div>
  );
}
