import type { Organism, StructureNode } from '@/types/content';
import { useStore } from '@/state/store';
import { organisms, gramCategoryMeta } from '@/data/organisms';
import { differences, envelopeOf, structureFor } from '@/data/compare';
import { formatLength } from '@/three/ScaleBar';

/**
 * The panel that reads one cell against the other.
 *
 * A comparison is not two info panels next to each other — that is just the
 * same reading twice. What is worth saying is what differs, so this leads with
 * the layers one cell has and the other does not, and when a structure is
 * selected it puts the two accounts of that same layer side by side, including
 * the case where one organism simply has no such layer. That absence is the
 * most useful thing on the screen: it is why the two take different drugs.
 */
export function ComparePanel({ organism, other }: { organism: Organism; other: Organism }) {
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const selectStructure = useStore((s) => s.selectStructure);
  const setCompareOrganism = useStore((s) => s.setCompareOrganism);

  const left = structureFor(organism, selectedStructureId);
  const right = structureFor(other, selectedStructureId);
  const diff = differences(organism, other);

  return (
    <div className="panel-block">
      <div className="compare-head">
        <div className="rail-label" style={{ margin: 0 }}>
          Comparing
        </div>
        <button className="btn ghost" onClick={() => setCompareOrganism(null)}>
          Close
        </button>
      </div>

      <div className="compare-names">
        {[organism, other].map((o) => {
          const cat = gramCategoryMeta[o.gramCategory];
          return (
            <div key={o.id}>
              <h4 style={{ fontStyle: 'italic' }}>{o.name}</h4>
              <span className="tag" style={{ background: cat.color + '22', color: cat.color }}>
                {cat.label}
              </span>{' '}
              <span className="chip">≈ {formatLength(o.body.sizeUm)}</span>
            </div>
          );
        })}
      </div>

      {left || right ? (
        <>
          <div className="rail-label">
            {(left ?? right)!.name.replace(/\s*\(.*\)$/, '')}
          </div>
          <div className="compare-cols">
            <StructureSide organism={organism} structure={left} />
            <StructureSide organism={other} structure={right} />
          </div>
          <button
            className="btn ghost"
            style={{ marginTop: 10, width: '100%' }}
            onClick={() => selectStructure(null)}
          >
            Back to the whole cells
          </button>
        </>
      ) : (
        <>
          <div className="rail-label">Envelope, outside in</div>
          <div className="compare-cols">
            {[organism, other].map((o) => (
              <ul key={o.id} className="compare-stack">
                {envelopeOf(o).map((s) => (
                  <li key={s.id}>
                    <button className="legend-item" onClick={() => selectStructure(s.id)}>
                      <span className="swatch" style={{ background: s.color }} />
                      {s.shortLabel}
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          {/*
            Derived from the two structure lists rather than written, so it
            cannot claim a difference the models do not show, and so it keeps up
            as organisms are authored.
          */}
          <OnlyIn organism={organism} structures={diff.onlyInA} />
          <OnlyIn organism={other} structures={diff.onlyInB} />

          <div className="callout">
            <span className="k">Try this</span>
            Click a layer in either cell — the same layer lights up in both, so you can read
            the two accounts of it side by side. Both cells are framed to the same real
            width, so their sizes here are their sizes.
          </div>
        </>
      )}
    </div>
  );
}

function StructureSide({
  organism,
  structure,
}: {
  organism: Organism;
  structure: StructureNode | undefined;
}) {
  if (!structure) {
    return (
      <div className="compare-absent">
        <strong style={{ fontStyle: 'italic' }}>{organism.shortName}</strong> has no such layer.
      </div>
    );
  }
  return (
    <div>
      <div className="compare-side-name">
        <span className="swatch" style={{ background: structure.color }} />
        {structure.shortLabel}
      </div>
      <p>{structure.description}</p>
      {structure.clinicalRelevance && (
        <div className="callout clinical">
          <span className="k">Why it matters</span>
          {structure.clinicalRelevance}
        </div>
      )}
    </div>
  );
}

function OnlyIn({ organism, structures }: { organism: Organism; structures: StructureNode[] }) {
  if (structures.length === 0) return null;
  return (
    <div className="compare-only">
      <span className="k">
        Only in <em>{organism.shortName}</em>
      </span>
      {structures.map((s) => (
        <span className="chip" key={s.id}>
          <span className="swatch" style={{ background: s.color }} />
          {s.shortLabel}
        </span>
      ))}
    </div>
  );
}

/** Picks the second cell. Lives above the panel, since it is what opens it. */
export function ComparePicker({ organism }: { organism: Organism }) {
  const compareOrganismId = useStore((s) => s.compareOrganismId);
  const setCompareOrganism = useStore((s) => s.setCompareOrganism);

  return (
    <label className="compare-picker">
      <span className="rail-label" style={{ marginTop: 0 }}>
        Compare with
      </span>
      <select
        value={compareOrganismId ?? ''}
        onChange={(e) => setCompareOrganism(e.target.value || null)}
      >
        <option value="">— none —</option>
        {organisms
          .filter((o) => o.id !== organism.id)
          .map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
      </select>
    </label>
  );
}
