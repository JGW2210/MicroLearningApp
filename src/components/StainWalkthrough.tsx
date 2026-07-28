import type { Organism } from '@/types/content';
import { useStore } from '@/state/store';

/** Plain-language name for each arrangement, shown under the field. */
const ARRANGEMENT_LABEL: Record<string, string> = {
  single: 'Singly',
  pairs: 'In pairs (diplo-)',
  tetrads: 'In tetrads',
  chains: 'In chains (strepto-)',
  clusters: 'In clusters (staphylo-)',
  palisades: 'Palisades / V forms',
  filaments: 'Branching filaments',
};
import { gramStainSteps, isCounterstained, stainColour } from '@/data/gramStainSteps';
import { MicroscopyField } from './MicroscopyField';

/** Interactive Gram-stain reagent walkthrough with an animated cell preview. */
export function StainWalkthrough({ organism }: { organism: Organism }) {
  const step = useStore((s) => s.gramStep);
  const setStep = useStore((s) => s.setGramStep);

  const safe = useStore((s) => s.colourBlindSafe);
  const setSafe = useStore((s) => s.setColourBlindSafe);

  const total = gramStainSteps.length;
  const current = step >= 0 ? gramStainSteps[step] : null;
  const cellColor = current ? stainColour(current, organism.gramCategory, safe) : '#2a3550';
  // In safe mode the counterstain is hatched as well as recoloured, so the
  // Gram-positive / Gram-negative call never depends on hue alone.
  const hatched = safe && !!current && isCounterstained(current, organism.gramCategory);

  return (
    <div className="panel-block">
      <h3>Gram stain walkthrough</h3>
      <div className="sub">
        Follow each reagent and watch why {organism.shortName} ends up{' '}
        {organism.gramStain.microscopyAppearance.toLowerCase()}.
      </div>

      <div className="stepper">
        {gramStainSteps.map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i < step ? 'done' : i === step ? 'current' : ''}`}
          />
        ))}
      </div>

      <div className="stain-cell-wrap">
        <MicroscopyField
          kind={organism.body.kind}
          arrangement={organism.arrangement}
          color={cellColor}
          hatched={hatched}
          cellUm={organism.body.sizeUm}
          visible={organism.gramCategory !== 'non-staining' || step < 0}
        />
      </div>
      <div className="stain-morph">
        <span className="k">{ARRANGEMENT_LABEL[organism.arrangement]}</span>
        {organism.morphology}
      </div>

      {current ? (
        <>
          <div style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 14 }}>
              {step + 1}. {current.reagent}
            </strong>
            <span className="sub" style={{ marginLeft: 8 }}>{current.action}</span>
          </div>
          <p style={{ fontSize: 13 }}>{current.detail}</p>
        </>
      ) : (
        <p style={{ fontSize: 13, marginTop: 12 }}>
          Press <strong>Start</strong> to run the stain one reagent at a time.
        </p>
      )}

      {step === total - 1 && (
        <div className="callout clinical">
          <span className="k">Result — {organism.gramStain.category}</span>
          {organism.gramStain.microscopyAppearance}. {organism.gramStain.explanation}
        </div>
      )}

      <div className="walk-controls">
        <button className="btn" disabled={step < 0} onClick={() => setStep(step - 1)}>
          ← Back
        </button>
        <button
          className={`btn ghost ${safe ? 'active' : ''}`}
          aria-pressed={safe}
          title="Re-encode the stain colours for red-green colour blindness"
          onClick={() => setSafe(!safe)}
        >
          {safe ? '\u25c9' : '\u25cb'} Colour-safe
        </button>
        {step < total - 1 ? (
          <button className="btn primary" onClick={() => setStep(step + 1)}>
            {step < 0 ? 'Start' : 'Next reagent →'}
          </button>
        ) : (
          <button className="btn" onClick={() => setStep(-1)}>
            ↺ Restart
          </button>
        )}
      </div>
    </div>
  );
}
