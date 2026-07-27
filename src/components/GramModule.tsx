import { useEffect } from 'react';
import type { GramCategory } from '@/types/content';
import { useStore } from '@/state/store';
import {
  organisms,
  getOrganism,
  organismsByCategory,
  gramCategoryMeta,
} from '@/data/organisms';
import { Scene } from '@/three/Scene';
import { StainWalkthrough } from './StainWalkthrough';
import { AgarPlate } from './AgarPlate';

const CATEGORY_ORDER: GramCategory[] = [
  'gram-positive',
  'gram-negative',
  'acid-fast',
  'non-staining',
];

export function GramModule() {
  const organismId = useStore((s) => s.organismId);
  const selectOrganism = useStore((s) => s.selectOrganism);
  const setGramStep = useStore((s) => s.setGramStep);

  useEffect(() => {
    if (!organismId) selectOrganism('staphylococcus-aureus');
  }, [organismId, selectOrganism]);

  const organism = getOrganism(organismId) ?? organisms[0];
  const activeCategory = organism.gramCategory;

  const pickOrganism = (id: string) => {
    selectOrganism(id);
    setGramStep(-1);
  };

  const pickCategory = (cat: GramCategory) => {
    const first = organismsByCategory(cat)[0];
    if (first) pickOrganism(first.id);
  };

  return (
    <div className="gram-layout">
      {/* Left: interactive 3D cell */}
      <div className="gram-left">
        <Scene organismId={organism.id} />
        <div className="stage-overlay">
          <div className="row">
            <span className="tag" style={{ background: '#16233c', color: '#9fb0cc' }}>
              {organism.name}
            </span>
          </div>
          <div className="row">
            <span className="chip" style={{ background: '#0a101c' }}>
              Rotate · click a structure to zoom in
            </span>
            <span />
          </div>
        </div>
      </div>

      {/* Right: category + organism pickers, stain walkthrough, agar */}
      <div className="gram-right">
        <div className="rail-label" style={{ marginTop: 0 }}>
          Stain category
        </div>
        <div className="cat-tabs">
          {CATEGORY_ORDER.map((cat) => {
            const meta = gramCategoryMeta[cat];
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                className="cat-tab"
                style={
                  active
                    ? { borderColor: meta.color, background: meta.color + '22', color: '#fff' }
                    : undefined
                }
                onClick={() => pickCategory(cat)}
                title={meta.blurb}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="rail-label">Example organisms</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {organismsByCategory(activeCategory).map((o) => (
            <button
              key={o.id}
              className={`cat-tab ${o.id === organism.id ? 'active' : ''}`}
              style={o.id === organism.id ? { borderColor: 'var(--accent)', color: '#fff' } : undefined}
              onClick={() => pickOrganism(o.id)}
            >
              {o.shortName}
            </button>
          ))}
        </div>

        <StainWalkthrough organism={organism} />

        <div className="panel-block">
          <h3>Appearance on agar</h3>
          <div className="sub">How {organism.shortName} presents on the media used to identify it.</div>
          <div className="agar-grid">
            {organism.agar.map((a) => (
              <AgarPlate key={a.medium} agar={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
