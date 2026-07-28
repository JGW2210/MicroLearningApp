import { useEffect } from 'react';
import type { Organism } from '@/types/content';
import { useStore, useLabelsHidden, type OverlayMode } from '@/state/store';
import { organisms, getOrganism, gramCategoryMeta } from '@/data/organisms';
import { currentQuestion, isFinished } from '@/data/quiz';
import { Scene } from '@/three/Scene';
import { InfoPanel } from './InfoPanel';
import { BottomSheet } from './BottomSheet';
import { CutDepthSlider } from './CutDepthSlider';
import { ArrangementControl } from './ArrangementControl';
import { StructureListbox } from './StructureListbox';
import { QuizPanel, QuizStartButton } from './QuizPanel';
import { useIsMobile } from '@/hooks/useIsMobile';

const OVERLAYS: { id: OverlayMode; label: string }[] = [
  { id: 'none', label: 'Structure' },
  { id: 'antibiotics', label: 'Antibiotic targets' },
  { id: 'resistance', label: 'Resistance' },
];

export function StructureModule() {
  const organismId = useStore((s) => s.organismId);
  const selectOrganism = useStore((s) => s.selectOrganism);
  const selectStructure = useStore((s) => s.selectStructure);
  const selectMechanism = useStore((s) => s.selectMechanism);
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const selectedMechanismId = useStore((s) => s.selectedMechanismId);
  const overlay = useStore((s) => s.overlay);
  const setOverlay = useStore((s) => s.setOverlay);
  const hoveredStructureId = useStore((s) => s.hoveredStructureId);
  const quiz = useStore((s) => s.quiz);
  // Hides the names; `testing` also hides the controls that would reintroduce
  // them (the overlay callouts) or make the model harder to answer on.
  const labelsHidden = useLabelsHidden();
  const testing = quiz !== null && !isFinished(quiz);
  const awaitingAnswer = testing && quiz!.picked === null;

  /**
   * What a screen reader is told when something happens.
   *
   * Not a running commentary — the listbox already reads the cursor as it
   * moves. This is for the outcomes, which are otherwise conveyed only by a
   * panel that never takes focus and a colour on the model.
   */
  const announcement = (() => {
    const organism = getOrganism(organismId) ?? organisms[0];
    if (quiz && !isFinished(quiz)) {
      const question = currentQuestion(quiz);
      if (!question || quiz.picked === null) return '';
      const target = organism.structures.find((s) => s.id === question.structureId);
      const picked = organism.structures.find((s) => s.id === quiz.picked);
      if (quiz.picked === question.structureId) return `Correct. ${target?.name}.`;
      return `Not this one. You chose the ${picked?.name}. The answer is the ${target?.name}.`;
    }
    const structure = organism.structures.find((s) => s.id === selectedStructureId);
    return structure ? `${structure.name} selected. ${structure.summary}` : '';
  })();

  // Default to the deep exemplar if arriving without a selection.
  useEffect(() => {
    if (!organismId) selectOrganism('staphylococcus-aureus');
  }, [organismId, selectOrganism]);

  const organism = getOrganism(organismId) ?? organisms[0];
  const hovered = organism.structures.find((s) => s.id === hoveredStructureId);
  const isMobile = useIsMobile();

  const overlaySeg = (
    <div className="seg">
      {OVERLAYS.map((o) => (
        <button
          key={o.id}
          className={overlay === o.id ? 'active' : ''}
          onClick={() => setOverlay(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  /** The stack of controls above the info panel — thinned right down under test. */
  const controls = testing ? (
    <CutDepthSlider />
  ) : (
    <>
      <div className="rail-label" style={{ marginTop: 0 }}>
        Teaching overlay
      </div>
      {overlaySeg}
      <CutDepthSlider />
      <div style={{ height: 14 }} />
      <ArrangementControl organism={organism} />
    </>
  );

  const panel = quiz ? (
    <QuizPanel organism={organism} />
  ) : (
    <>
      <InfoPanel organism={organism} />
      <QuizStartButton organism={organism} />
      <DetailList organism={organism} />
    </>
  );

  const resetBtn = (selectedStructureId || selectedMechanismId) && (
    <button
      className="btn"
      onClick={() => {
        selectStructure(null);
        selectMechanism(null);
      }}
    >
      ↺ Reset
    </button>
  );

  if (isMobile) {
    return (
      <div className="workspace">
        <div className="mobile-stage">
          <Scene organismId={organism.id} />
          {/* A small viewport does not imply a touchscreen, and a touchscreen
              does not preclude a keyboard. Both routes exist here too. */}
          <StructureListbox organism={organism} />
          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </div>
        <div className="mobile-float">
          <span className="tag" style={{ background: '#16233c', color: '#9fb0cc' }}>
            {organism.name}
          </span>
          <div className="pointer">{resetBtn}</div>
        </div>
        <BottomSheet>
          <div className="org-strip">
            {organisms.map((o) => (
              <button
                key={o.id}
                className={`org-chip ${o.id === organism.id ? 'active' : ''}`}
                onClick={() => selectOrganism(o.id)}
              >
                {o.shortName}
              </button>
            ))}
          </div>
          <div style={{ margin: '4px 0 12px' }}>{controls}</div>
          <div style={{ height: 12 }} />
          {panel}
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="workspace">
      {/* Left rail: organisms + structure legend */}
      <aside className="rail">
        <div className="rail-label">Organisms</div>
        {organisms.map((o) => {
          const cat = gramCategoryMeta[o.gramCategory];
          return (
            <button
              key={o.id}
              className={`org-item ${o.id === organism.id ? 'active' : ''}`}
              onClick={() => selectOrganism(o.id)}
            >
              <div className="name">
                {o.shortName}
                <span className={`depth-pill ${o.depth === 'deep' ? '' : 'overview'}`}>
                  {o.depth}
                </span>
              </div>
              <div className="meta">{o.morphology}</div>
              <span className="tag" style={{ background: cat.color + '22', color: cat.color }}>
                {cat.label}
              </span>
            </button>
          );
        })}

        <div className="rail-label" style={{ marginTop: 16 }}>
          Structures
        </div>
        {/* The legend is a complete answer key, so it goes dark for the run. */}
        {labelsHidden ? (
          <div className="empty-hint" style={{ padding: '14px 4px' }}>
            Names hidden while you are being tested.
          </div>
        ) : (
          organism.structures.map((s) => (
            <button
              key={s.id}
              className={`legend-item ${s.id === selectedStructureId ? 'active' : ''}`}
              onClick={() => selectStructure(s.id)}
            >
              <span className="swatch" style={{ background: s.color }} />
              {s.shortLabel}
            </button>
          ))
        )}
      </aside>

      {/* Center: 3D stage */}
      <div className="stage">
        <Scene organismId={organism.id} />
        <StructureListbox organism={organism} />
        {/*
          Selections and verdicts are announced here rather than left to the
          panel, which is never focused and so is never read. The listbox
          announces the cursor as it moves; this announces what came of it.
        */}
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        <div className="stage-overlay">
          <div className="row">
            <div className="pointer">
              <span className="tag" style={{ background: '#16233c', color: '#9fb0cc' }}>
                {organism.name}
              </span>
            </div>
          </div>
          <div className="row">
            <div>
              {/* Under test the chip keeps the affordance — something is under the
                  cursor and it can be clicked — without naming it, and drops
                  away entirely once the question is closed and clicking does
                  nothing. */}
              {hovered && (!labelsHidden || awaitingAnswer) && (
                <span className="chip" style={{ background: '#0a101c' }}>
                  <span className="swatch" style={{ background: hovered.color }} />{' '}
                  {labelsHidden ? 'click to answer' : hovered.name}
                </span>
              )}
            </div>
            <div className="pointer">
              {(selectedStructureId || selectedMechanismId) && (
                <button
                  className="btn"
                  onClick={() => {
                    selectStructure(null);
                    selectMechanism(null);
                  }}
                >
                  ↺ Reset view
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right rail: overlay control + info + lists */}
      <aside className="rail right">
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>{controls}</div>

        <div className="panel-scroll">{panel}</div>
      </aside>
    </div>
  );
}

function DetailList({ organism }: { organism: Organism }) {
  const overlay = useStore((s) => s.overlay);
  const selectMechanism = useStore((s) => s.selectMechanism);
  const selectStructure = useStore((s) => s.selectStructure);
  const selectedMechanismId = useStore((s) => s.selectedMechanismId);

  if (overlay === 'antibiotics') {
    return (
      <section>
        <div className="rail-label">Antibiotic classes ({organism.antibiotics.length})</div>
        {organism.antibiotics.map((a) => (
          <button
            key={a.id}
            className={`list-row ${a.id === selectedMechanismId ? 'active' : ''}`}
            onClick={() => {
              selectMechanism(a.id);
              selectStructure(a.targetStructureId);
            }}
          >
            <div className="title">
              <span className="swatch" style={{ background: a.color }} />
              {a.drugClass}
              <span className={`effect-pill ${a.effect}`} style={{ marginLeft: 'auto' }}>
                {a.effect}
              </span>
            </div>
            <div className="desc">{a.siteLabel} — {a.examples.slice(0, 3).join(', ')}</div>
          </button>
        ))}
      </section>
    );
  }

  if (overlay === 'resistance') {
    return (
      <section>
        <div className="rail-label">Resistance mechanisms ({organism.resistance.length})</div>
        {organism.resistance.map((r) => (
          <button
            key={r.id}
            className={`list-row ${r.id === selectedMechanismId ? 'active' : ''}`}
            onClick={() => {
              selectMechanism(r.id);
              if (r.locusStructureId) selectStructure(r.locusStructureId);
            }}
          >
            <div className="title">
              {r.name}
              {r.gene && <span className="gene" style={{ marginLeft: 'auto' }}>{r.gene}</span>}
            </div>
            <div className="desc">{r.clinicalImpact}</div>
          </button>
        ))}
        <GenomicsSection organism={organism} />
      </section>
    );
  }

  // Default overlay: structures list + genomics reference.
  return (
    <section>
      <div className="rail-label">Structures ({organism.structures.length})</div>
      {organism.structures.map((s) => (
        <button key={s.id} className="list-row" onClick={() => selectStructure(s.id)}>
          <div className="title">
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </div>
          <div className="desc">{s.summary}</div>
        </button>
      ))}
      <GenomicsSection organism={organism} />
    </section>
  );
}

function GenomicsSection({ organism }: { organism: Organism }) {
  if (organism.genomics.length === 0) return null;
  return (
    <section style={{ marginTop: 8 }}>
      <div className="rail-label">Genomic variations &amp; treatment</div>
      {organism.genomics.map((g) => (
        <div key={g.id} className="panel-block" style={{ marginBottom: 8 }}>
          <div className="title" style={{ fontSize: 13, fontWeight: 650 }}>
            <span className="gene">{g.gene}</span>
          </div>
          <div className="sub" style={{ margin: '6px 0' }}>{g.variation}</div>
          <p style={{ margin: '4px 0', fontSize: 12.5 }}>{g.effect}</p>
          <div className="callout clinical" style={{ marginTop: 8 }}>
            <span className="k">Treatment change</span>
            {g.treatmentChange}
          </div>
        </div>
      ))}
    </section>
  );
}
