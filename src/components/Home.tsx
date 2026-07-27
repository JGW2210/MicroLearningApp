import { useStore } from '@/state/store';
import { organisms } from '@/data/organisms';
import { HeroCell } from './HeroCell';

export function Home() {
  const goToModule = useStore((s) => s.goToModule);
  const selectOrganism = useStore((s) => s.selectOrganism);

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
              <span className="swatch" style={{ background: '#3ddc97' }} /> {organisms.length} organisms
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
          <HeroCell organismId="staphylococcus-aureus" />
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
