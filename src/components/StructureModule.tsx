import { useEffect } from 'react';
import type { Organism } from '@/types/content';
import { useStore, type OverlayMode } from '@/state/store';
import { organisms, getOrganism, gramCategoryMeta } from '@/data/organisms';
import { Scene } from '@/three/Scene';
import { InfoPanel } from './InfoPanel';

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

  // Default to the deep exemplar if arriving without a selection.
  useEffect(() => {
    if (!organismId) selectOrganism('staphylococcus-aureus');
  }, [organismId, selectOrganism]);

  const organism = getOrganism(organismId) ?? organisms[0];
  const hovered = organism.structures.find((s) => s.id === hoveredStructureId);

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
        {organism.structures.map((s) => (
          <button
            key={s.id}
            className={`legend-item ${s.id === selectedStructureId ? 'active' : ''}`}
            onClick={() => selectStructure(s.id)}
          >
            <span className="swatch" style={{ background: s.color }} />
            {s.shortLabel}
          </button>
        ))}
      </aside>

      {/* Center: 3D stage */}
      <div className="stage">
        <Scene organismId={organism.id} />
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
              {hovered && (
                <span className="chip" style={{ background: '#0a101c' }}>
                  <span className="swatch" style={{ background: hovered.color }} /> {hovered.name}
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
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div className="rail-label" style={{ marginTop: 0 }}>
            Teaching overlay
          </div>
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
        </div>

        <div className="panel-scroll">
          <InfoPanel organism={organism} />
          <DetailList organism={organism} />
        </div>
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
