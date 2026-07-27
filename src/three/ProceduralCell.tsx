import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import type { Organism, StructureNode } from '@/types/content';
import type { OverlayMode } from '@/state/store';
import { StructureMesh } from './StructureMesh';
import { buildBody } from './body';
import { structureAnchor } from './focus';

interface Props {
  organism: Organism;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
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
        <OverlayTags
          items={organism.antibiotics.map((a) => ({
            id: a.id,
            structureId: a.targetStructureId,
            label: a.drugClass,
            color: a.color,
          }))}
          organism={organism}
          onSelect={props.onSelectMechanism}
        />
      )}

      {overlay === 'resistance' && (
        <OverlayTags
          items={organism.resistance.map((r) => ({
            id: r.id,
            structureId: r.locusStructureId ?? '',
            label: r.gene ?? r.name,
            color: '#ff6b6b',
          }))}
          organism={organism}
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
  color: string;
}

/** Floating HTML pins anchored to the targeted structures. */
function OverlayTags(props: {
  items: TagItem[];
  organism: Organism;
  onSelect: (id: string) => void;
}) {
  // Stack multiple tags on the same structure so they don't overlap.
  const perStructureIndex = new Map<string, number>();

  return (
    <>
      {props.items.map((item) => {
        const structure = props.organism.structures.find((s) => s.id === item.structureId);
        if (!structure) return null;
        const idx = perStructureIndex.get(item.structureId) ?? 0;
        perStructureIndex.set(item.structureId, idx + 1);
        const anchor = structureAnchor(structure);
        const pos: [number, number, number] = [
          anchor.x,
          anchor.y + 0.5 + idx * 0.42,
          anchor.z,
        ];
        return (
          <Html key={item.id} position={pos} center distanceFactor={9} zIndexRange={[20, 0]}>
            <button
              className="overlay-pin"
              style={{ borderColor: item.color }}
              onClick={(e) => {
                e.stopPropagation();
                props.onSelect(item.id);
              }}
            >
              <span className="overlay-pin-dot" style={{ background: item.color }} />
              {item.label}
            </button>
          </Html>
        );
      })}
    </>
  );
}
