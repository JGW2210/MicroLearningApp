import type { Organism } from '@/types/content';
import { useStore } from '@/state/store';
import { gramCategoryMeta } from '@/data/organisms';
import { formatLength } from '@/three/ScaleBar';

export function InfoPanel({ organism }: { organism: Organism }) {
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const selectedMechanismId = useStore((s) => s.selectedMechanismId);

  const mechanism =
    selectedMechanismId != null
      ? organism.antibiotics.find((a) => a.id === selectedMechanismId) ??
        organism.resistance.find((r) => r.id === selectedMechanismId)
      : undefined;

  if (mechanism) {
    return 'drugClass' in mechanism ? (
      <AntibioticCard organism={organism} antibioticId={mechanism.id} />
    ) : (
      <ResistanceCard organism={organism} resistanceId={mechanism.id} />
    );
  }

  const structure = organism.structures.find((s) => s.id === selectedStructureId);
  if (structure) {
    return (
      <div className="panel-block">
        <span className="chip" style={{ marginBottom: 8 }}>
          <span className="swatch" style={{ background: structure.color }} /> {structure.group}
        </span>
        <h3>{structure.name}</h3>
        <div className="sub">{structure.summary}</div>
        <p>{structure.description}</p>
        {structure.clinicalRelevance && (
          <div className="callout clinical">
            <span className="k">Why it matters</span>
            {structure.clinicalRelevance}
          </div>
        )}
        {structure.drugTargetIds && structure.drugTargetIds.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="rail-label" style={{ margin: '0 0 6px' }}>
              Drugs acting here
            </div>
            {structure.drugTargetIds.map((id) => {
              const drug = organism.antibiotics.find((a) => a.id === id);
              if (!drug) return null;
              return (
                <span className="chip" key={id}>
                  <span className="swatch" style={{ background: drug.color }} /> {drug.drugClass}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: organism overview.
  const cat = gramCategoryMeta[organism.gramCategory];
  return (
    <div className="panel-block">
      <span className="tag" style={{ background: cat.color + '22', color: cat.color }}>
        {cat.label}
      </span>
      <span className="chip" style={{ marginLeft: 6 }}>
        ≈ {formatLength(organism.body.sizeUm)}
      </span>
      <h3 style={{ fontStyle: 'italic', marginTop: 8 }}>{organism.name}</h3>
      <div className="sub">{organism.morphology}</div>
      <p>{organism.clinicalNote}</p>
      <div className="callout">
        <span className="k">Try this</span>
        Click any labelled structure in the cell to zoom in and read about it — or tab to the
        model and walk its layers from the outside in with the arrow keys. Switch the overlay
        above to see antibiotic targets or resistance loci mapped onto the same cell.
      </div>
    </div>
  );
}

function AntibioticCard({ organism, antibioticId }: { organism: Organism; antibioticId: string }) {
  const drug = organism.antibiotics.find((a) => a.id === antibioticId)!;
  const target = organism.structures.find((s) => s.id === drug.targetStructureId);
  const defeats = organism.resistance.filter((r) => r.defeatsDrugIds.includes(drug.id));
  return (
    <div className="panel-block">
      <span className={`effect-pill ${drug.effect}`}>{drug.effect}</span>
      <h3 style={{ marginTop: 8 }}>{drug.drugClass}</h3>
      <div className="sub">
        e.g. {drug.examples.join(', ')} · acts on {drug.siteLabel}
        {target ? ` (${target.shortLabel})` : ''}
      </div>
      <p>{drug.mechanism}</p>
      {defeats.length > 0 && (
        <div className="callout warn">
          <span className="k">Resistance that defeats it</span>
          {defeats.map((r) => (
            <div key={r.id} style={{ marginTop: 4 }}>
              <strong>{r.name}</strong>
              {r.gene ? (
                <>
                  {' '}
                  <span className="gene">{r.gene}</span>
                </>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResistanceCard({ organism, resistanceId }: { organism: Organism; resistanceId: string }) {
  const r = organism.resistance.find((x) => x.id === resistanceId)!;
  const drugs = organism.antibiotics.filter((a) => r.defeatsDrugIds.includes(a.id));
  return (
    <div className="panel-block">
      <span className="chip" style={{ marginBottom: 8 }}>
        {r.type.replace(/-/g, ' ')}
      </span>
      <h3>{r.name}</h3>
      {r.gene && (
        <div className="sub">
          Gene: <span className="gene">{r.gene}</span>
        </div>
      )}
      <p>{r.description}</p>
      <div className="callout warn">
        <span className="k">Clinical impact</span>
        {r.clinicalImpact}
      </div>
      {drugs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="rail-label" style={{ margin: '0 0 6px' }}>
            Defeats
          </div>
          {drugs.map((d) => (
            <span className="chip" key={d.id}>
              <span className="swatch" style={{ background: d.color }} /> {d.drugClass}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
