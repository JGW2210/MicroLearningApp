import { useMemo } from 'react';
import * as THREE from 'three';
import type { Organism, StructureNode } from '@/types/content';
import { defaultRadius, isShell } from './geometry';
import { bodyCenter, type CellBody } from './body';
import { shellSurface } from './shell';
import { placementTransform, type CellGroup } from './arrangement';

/**
 * The rest of the group: the cells around the one being studied.
 *
 * They are drawn as envelope only — the outermost layer, plus the capsule over
 * it where there is one — and never as full cells. That is partly cost (one cell
 * is already a hundred-odd meshes, every shell of it drawn twice for the ghost
 * half, so a chain of six at full detail would be six times that for nothing),
 * but mostly it is the point: in this view the subject is the *group*, and a
 * neighbour rendered in as much detail as the focused cell competes with it. One
 * cell opened up among a group of closed ones reads the way a textbook figure
 * does — this is one of these, and here is what is inside it.
 *
 * They share a single geometry between them for the same reason, and take no
 * part in picking, so hovering and clicking still reach the cell being studied
 * even where a companion lies in front of it.
 */

/**
 * A companion is set back by colour, not by transparency.
 *
 * Fading the walls instead looked right on a chain, where the cells sit side by
 * side, and fell apart on a cluster, where they overlap: half a dozen
 * see-through spheres piled on each other read as coloured fog rather than as
 * cells. Keeping the wall opaque lets them occlude one another the way solid
 * bodies do, which is what makes a bunch legible as a bunch. Only the capsule
 * stays translucent — it is translucent on the focused cell too.
 */
const COMPANION_SHADE = { saturation: -0.24, lightness: -0.13 };
const COMPANION_CAPSULE_OPACITY = 0.7;

interface Props {
  organism: Organism;
  body: CellBody;
  group: CellGroup;
}

/** The layers a companion is drawn from: its outermost surface, and its capsule. */
function companionShells(structures: StructureNode[]): { structure: StructureNode; r: number }[] {
  const shells = structures
    .filter((s) => isShell(s.kind))
    .map((s) => ({ structure: s, r: s.geometry?.radius ?? defaultRadius[s.kind] }))
    .sort((a, b) => b.r - a.r);
  if (shells.length === 0) return [];
  // The widest opaque layer is the cell's visible body; anything wider than it
  // is a capsule or slime layer, which is worth keeping because its presence is
  // exactly what is being taught elsewhere in the app.
  const solid = shells.find((s) => s.structure.kind !== 'capsule' && s.structure.kind !== 'cytoplasm');
  const out = solid ? [solid] : [shells[0]];
  if (shells[0] !== out[0]) out.push(shells[0]);
  return out;
}

export function Companions({ organism, body, group }: Props) {
  const shells = useMemo(() => companionShells(organism.structures), [organism.structures]);

  // One geometry per layer, shared by every companion — the difference between
  // one swept tube and one per cell in the group.
  const surfaces = useMemo(
    () =>
      shells.map((s) => {
        const translucent = s.structure.kind === 'capsule' || s.structure.kind === 'cytoplasm';
        return {
          geometry: shellSurface(body, s.r),
          color: `#${new THREE.Color(s.structure.color)
            .offsetHSL(0, COMPANION_SHADE.saturation, COMPANION_SHADE.lightness)
            .getHexString()}`,
          translucent,
          opacity:
            (s.structure.geometry?.opacity ?? (translucent ? 0.28 : 0.92)) *
            (translucent ? COMPANION_CAPSULE_OPACITY : 1),
        };
      }),
    [shells, body],
  );

  const transforms = useMemo(
    () => group.placements.slice(1).map((p) => placementTransform(p, body)),
    [group, body],
  );

  return (
    <>
      {transforms.map((t, i) => (
        <group key={i} position={t.position} quaternion={t.quaternion}>
          {surfaces.map((s, k) => (
            <mesh key={k} geometry={s.geometry} raycast={() => null} renderOrder={s.translucent ? 1 : 0}>
              <meshStandardMaterial
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.06}
                transparent
                opacity={s.opacity}
                roughness={0.55}
                side={THREE.DoubleSide}
                depthWrite={!s.translucent}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/** Colour per round of division, so successive planes are told apart at a glance. */
export const GENERATION_COLORS = ['#5aa9ff', '#c86bff', '#f4c04d'];

export function generationColor(generation: number): string {
  return GENERATION_COLORS[Math.min(Math.max(generation, 1), GENERATION_COLORS.length) - 1];
}

/**
 * The division planes themselves, drawn as a collar standing proud of each join.
 *
 * A disc filling the interface would be the honest shape but an invisible one —
 * it sits buried inside both daughters. Letting it protrude past the envelope is
 * what makes the plane readable from outside, and reading them is the point: a
 * chain's collars all lie parallel, a tetrad's second round stands at right
 * angles to its first, and a cluster's point every which way. That comparison is
 * the whole causal story of arrangement, and it is invisible in a flat drawing.
 */
export function DivisionPlanes({
  body,
  group,
  girth,
  fringe,
}: {
  body: CellBody;
  group: CellGroup;
  /** Where the cells touch — the radius of the septum itself. */
  girth: number;
  /** ...and how far out anything is drawn, which the collar has to clear. */
  fringe: number;
}) {
  const centre = useMemo(() => bodyCenter(body), [body]);
  // Sized off whichever is wider. On a capsulated cell the septum is well inside
  // the outermost layer, and a collar sized from the wall alone stayed buried in
  // the capsule, showing through it as a plate rather than standing proud as a
  // ring.
  const geometry = useMemo(
    () => new THREE.RingGeometry(girth * 0.72, Math.max(girth * 1.28, fringe * 1.04), 56),
    [girth, fringe],
  );
  const quaternions = useMemo(
    () =>
      group.septa.map((s) =>
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), s.normal),
      ),
    [group],
  );

  return (
    <>
      {group.septa.map((s, i) => (
        <mesh
          key={i}
          geometry={geometry}
          raycast={() => null}
          renderOrder={2}
          position={centre.clone().add(s.position)}
          quaternion={quaternions[i]}
        >
          <meshBasicMaterial
            color={generationColor(s.generation)}
            transparent
            opacity={0.36}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
