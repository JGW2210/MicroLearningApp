import { useState } from 'react';
import type { Organism } from '@/types/content';
import { useStore } from '@/state/store';
import {
  getStain,
  isCounterstained,
  sporeColour,
  stainColour,
  stainProtocols,
  stainRelevance,
  type StainId,
} from '@/data/stains';
import { MicroscopyField } from './MicroscopyField';

/**
 * An organism's endospore, if it makes one, and whether it is wide enough to
 * distend the mother cell — which is what turns a terminal spore into a
 * drumstick rather than merely a spore at the end.
 */
function sporeOf(organism: Organism) {
  const s = organism.structures.find((x) => x.kind === 'endospore');
  if (!s) return undefined;
  return {
    position: s.geometry?.position ?? 'central',
    swells: (s.geometry?.radius ?? 0) > organism.body.radius * 0.92,
  };
}

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

/** Reagent-by-reagent walkthrough of whichever stain is selected. */
export function StainWalkthrough({ organism }: { organism: Organism }) {
  const step = useStore((s) => s.gramStep);
  const setStep = useStore((s) => s.setGramStep);
  const safe = useStore((s) => s.colourBlindSafe);
  const setSafe = useStore((s) => s.setColourBlindSafe);
  const [stainId, setStainId] = useState<StainId>('gram');

  const stain = getStain(stainId);
  const relevance = stainRelevance(stainId, organism);
  const total = stain.steps.length;
  const current = step >= 0 && step < total ? stain.steps[step] : null;

  const cellColor = current ? stainColour(current, organism.gramCategory, safe) : '#2a3550';
  // In safe mode a counterstained cell is hatched as well as recoloured, so the
  // result never depends on hue alone.
  const hatched = safe && !!current && isCounterstained(current, organism.gramCategory);
  const spore = sporeOf(organism);
  /**
   * How clearly this organism shows at this step. A cell with no wall never
   * appears at all; one the reagents barely enter shows as an indistinct ghost.
   * Both are results, and neither is the same as a clean pale colour.
   */
  const clarity = (() => {
    if (!current) return 1;
    if (organism.gramCategory === 'non-staining' && stainId === 'gram') return 0.12;
    if (current.faintFor?.includes(organism.gramCategory)) return 0.42;
    return 1;
  })();
  const capsule = organism.structures.some((s) => s.kind === 'capsule');

  const pickStain = (id: StainId) => {
    setStainId(id);
    setStep(-1);
  };

  return (
    <div className="panel-block">
      <h3>Stain walkthrough</h3>
      <div className="sub">{stain.indication}</div>

      <div className="stain-tabs">
        {stainProtocols.map((p) => {
          const rel = stainRelevance(p.id, organism);
          return (
            <button
              key={p.id}
              className={`cat-tab ${p.id === stainId ? 'active' : ''} ${rel.informative ? '' : 'muted'}`}
              style={p.id === stainId ? { borderColor: 'var(--accent)', color: '#fff' } : undefined}
              onClick={() => pickStain(p.id)}
              title={`${p.purpose} — ${rel.note}`}
            >
              {p.short}
            </button>
          );
        })}
      </div>

      <div className="stepper">
        {stain.steps.map((_, i) => (
          <div key={i} className={`step-dot ${i < step ? 'done' : i === step ? 'current' : ''}`} />
        ))}
      </div>

      <div className="stain-cell-wrap">
        <MicroscopyField
          kind={organism.body.kind}
          arrangement={organism.arrangement}
          color={cellColor}
          hatched={hatched}
          cellUm={organism.body.sizeUm}
          spore={spore?.position}
          sporeSwells={spore?.swells ?? false}
          sporeColor={current ? sporeColour(current, safe) : undefined}
          background={current?.background}
          halo={!!current?.halo && capsule}
          opacity={step < 0 ? 1 : clarity}
        />
      </div>
      <div className="stain-morph">
        <span className="k">{ARRANGEMENT_LABEL[organism.arrangement]}</span>
        {organism.morphology}
      </div>

      {/* Say plainly when a stain is being run on an organism it cannot show,
          rather than letting the four tabs imply they are interchangeable. */}
      {!relevance.informative && (
        <div className="callout" style={{ marginTop: 10 }}>
          <span className="k">Expected result for {organism.shortName}</span>
          {relevance.note}
        </div>
      )}

      {current ? (
        <>
          <div style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 14 }}>
              {step + 1}. {current.reagent}
            </strong>
            <span className="sub" style={{ marginLeft: 8 }}>
              {current.action}
            </span>
          </div>
          <p style={{ fontSize: 13 }}>{current.detail}</p>
        </>
      ) : (
        <p style={{ fontSize: 13, marginTop: 12 }}>
          {stain.purpose} Press <strong>Start</strong> to run it one reagent at a time.
        </p>
      )}

      {step === total - 1 && stainId === 'gram' && (
        <div className="callout clinical">
          <span className="k">Result — {organism.gramStain.category}</span>
          {organism.gramStain.microscopyAppearance}. {organism.gramStain.explanation}
        </div>
      )}
      {step === total - 1 && stainId !== 'gram' && (
        <div className="callout clinical">
          <span className="k">Result — {stain.short}</span>
          {relevance.note}
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
          {safe ? '◉' : '○'} Colour-safe
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
