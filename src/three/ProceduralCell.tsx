import { useMemo, type CSSProperties } from 'react';
import { Html, Line } from '@react-three/drei';
import type { Organism, StructureNode } from '@/types/content';
import type { OverlayMode } from '@/state/store';
import { StructureMesh } from './StructureMesh';
import { buildBody, bodyCenter, interiorRadius, type CellBody } from './body';
import { defaultRadius } from './geometry';

interface Props {
  organism: Organism;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  selectedMechanismId: string | null;
  overlay: OverlayMode;
  onSelectStructure: (id: string) => void;
  onHoverStructure: (id: string | null) => void;
  onSelectMechanism: (id: string) => void;
}

/** Translucent layers render last so transparency sorts correctly. */
function renderOrder(s: StructureNode): number {
  const translucent = s.kind === 'capsule' || s.kind === 'cytoplasm' || s.kind === 'lps';
  return translucent ? 1 : 0;
}

export function ProceduralCell(props: Props) {
  const { organism, overlay, selectedStructureId, hoveredStructureId } = props;

  // Which structures the active overlay should emphasise.
  const highlightedIds = useMemo(() => {
    if (overlay === 'antibiotics') {
      return new Set(organism.antibiotics.map((a) => a.targetStructureId));
    }
    if (overlay === 'resistance') {
      return new Set(
        organism.resistance
          .map((r) => r.locusStructureId)
          .filter((id): id is string => Boolean(id)),
      );
    }
    return new Set<string>();
  }, [organism, overlay]);

  const sorted = useMemo(
    () => [...organism.structures].sort((a, b) => renderOrder(a) - renderOrder(b)),
    [organism.structures],
  );

  const body = useMemo(() => buildBody(organism.body), [organism.body]);
  // The cytoplasm's outer bound, so contents can be fitted inside the envelope
  // this particular organism actually has rather than a nominal body radius.
  const interior = useMemo(
    () => interiorRadius(organism.structures, body),
    [organism.structures, body],
  );

  return (
    <group>
      {sorted.map((s) => {
        const selected = s.id === selectedStructureId;
        const hovered = s.id === hoveredStructureId;
        const highlighted = highlightedIds.has(s.id);
        const dimmed =
          (selectedStructureId !== null && !selected) ||
          (overlay !== 'none' && !highlighted && !selected);
        return (
          <StructureMesh
            key={s.id}
            structure={s}
            body={body}
            interior={interior}
            selected={selected}
            hovered={hovered}
            dimmed={dimmed}
            highlighted={highlighted}
            onSelect={props.onSelectStructure}
            onHover={props.onHoverStructure}
          />
        );
      })}

      {overlay === 'antibiotics' && (
        <Callouts
          items={organism.antibiotics.map((a) => ({
            id: a.id,
            structureId: a.targetStructureId,
            label: a.drugClass,
            sub: a.siteLabel,
            color: a.color,
          }))}
          organism={organism}
          body={body}
          selectedId={props.selectedMechanismId}
          onSelect={props.onSelectMechanism}
        />
      )}

      {overlay === 'resistance' && (
        <Callouts
          items={organism.resistance.map((r) => ({
            id: r.id,
            structureId: r.locusStructureId ?? '',
            label: r.gene ?? r.name,
            sub: r.type.replace(/-/g, ' '),
            color: '#ff7a7a',
          }))}
          organism={organism}
          body={body}
          selectedId={props.selectedMechanismId}
          onSelect={props.onSelectMechanism}
        />
      )}
    </group>
  );
}

interface TagItem {
  id: string;
  structureId: string;
  label: string;
  sub: string;
  color: string;
}

/**
 * Textbook-style leader-line callouts: a glowing dot sits on the target site,
 * a thin line leads out to a labelled pill in a row above the cell.
 */
function Callouts(props: {
  items: TagItem[];
  organism: Organism;
  body: CellBody;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { body } = props;
  const items = props.items.filter((it) =>
    props.organism.structures.some((s) => s.id === it.structureId),
  );
  const n = items.length;
  const center = bodyCenter(body);
  // Labels ring the cell (leaving the bottom clear); each line runs to its site.
  const ringR = Math.max(body.radius, body.length * 0.5) + body.radius * 0.5 + 1.25;

  return (
    <>
      {items.map((item, k) => {
        const structure = props.organism.structures.find((s) => s.id === item.structureId)!;
        const r = structure.geometry?.radius ?? defaultRadius[structure.kind];
        const f = n === 1 ? 0.5 : k / (n - 1);
        // Distribute over a 240° arc from lower-left, up over the top, to
        // lower-right — reserving the bottom for the reset/hover chrome.
        const theta = (7 * Math.PI) / 6 - ((4 * Math.PI) / 3) * f;
        const dir = body.ex
          .clone()
          .multiplyScalar(Math.cos(theta))
          .addScaledVector(body.ey, Math.sin(theta))
          .normalize();

        const anchor = center.clone().addScaledVector(dir, r * 0.98);
        // Elliptical label ring: narrower horizontally so side labels stay on-canvas,
        // and slightly flattened vertically (the camera looks down a little).
        const labelPos = center
          .clone()
          .addScaledVector(body.ex, Math.cos(theta) * ringR * 0.68)
          .addScaledVector(body.ey, Math.sin(theta) * ringR * 0.82);

        const active = props.selectedId === item.id;
        return (
          <group key={item.id}>
            <Line
              points={[anchor.toArray(), labelPos.toArray()]}
              color={item.color}
              lineWidth={active ? 2.4 : 1.2}
              transparent
              opacity={active ? 1 : 0.6}
              dashed={false}
            />
            <mesh position={anchor.toArray()}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial
                color={item.color}
                emissive={item.color}
                emissiveIntensity={active ? 1.4 : 0.8}
              />
            </mesh>
            <Html position={labelPos.toArray()} center distanceFactor={11} zIndexRange={[30, 0]}>
              <button
                className={`callout-pill ${active ? 'active' : ''}`}
                style={{ '--pill': item.color } as CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onSelect(item.id);
                }}
              >
                <span className="callout-label">{item.label}</span>
                <span className="callout-sub">{item.sub}</span>
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}
